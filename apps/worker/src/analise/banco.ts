import type { UsoIa } from "@tesia/ia";
import { atualizarFase, ligarCliente } from "./cliente-fase";
import { nomePartes, type AnaliseGravada, type MemoriaCalculo } from "@tesia/shared";
import type { Pool, PoolClient } from "pg";
import { z } from "zod";
import type { Job } from "../fila.js";
import {
  ritoParaRegra,
  type FeriadoBanco,
  type OpcaoBanco,
  type PrazoSugerido,
  type RegraBanco,
  type SuspensaoBanco,
} from "./montar.js";

export type UsoEtapa = {
  etapa: string;
  uso: Omit<UsoIa, "modelo"> & { modelo: string };
  versaoPrompt: string;
  duracaoMs: number;
};

export async function registrarUso(
  db: Pool,
  job: Job,
  { etapa, uso, versaoPrompt, duracaoMs }: UsoEtapa,
) {
  await db.query(
    `insert into uso_ia (escritorio_id, job_id, etapa, modelo, versao_prompt,
       tokens_entrada, tokens_cache, tokens_saida, custo_estimado, duracao_ms)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      job.escritorio_id,
      job.id,
      etapa,
      uso.modelo,
      versaoPrompt,
      uso.tokensEntrada,
      uso.tokensCache,
      uso.tokensSaida,
      uso.custoEstimado,
      duracaoMs,
    ],
  );
}

const linhaOpcaoSchema = z.object({
  codigo: z.string(),
  nome: z.string(),
  regra_id: z.uuid().nullable(),
  dias: z.number().int().nullable(),
  contagem: z.enum(["uteis", "corridos"]).nullable(),
  fundamento: z.string().nullable(),
  prioridade: z.number().int().nullable(),
  ativa: z.boolean().nullable(),
});

export async function buscarOpcoes(
  db: Pool,
  area: string | null,
  rito: string,
  tipoAto: string,
): Promise<OpcaoBanco[]> {
  const { rows } = await db.query(
    `select t.codigo, t.nome, r.id as regra_id, r.dias, r.contagem, r.fundamento, r.prioridade, r.ativa
     from regras_prazo r
     join tipos_peca t on t.codigo = r.tipo_peca_codigo and t.area in (r.area, 'geral') and t.ativa
     where r.area = $1 and r.rito::text = $2 and r.tipo_ato = $3`,
    [area, ritoParaRegra(rito), tipoAto],
  );
  const comRegra = z.array(linhaOpcaoSchema).parse(rows);
  if (comRegra.length > 0) return comRegra.map(paraOpcao);

  const { rows: semRegra } = await db.query(
    `select codigo, nome, null as regra_id, null::int as dias, null as contagem,
       null as fundamento, null::int as prioridade, null::boolean as ativa
     from tipos_peca where ativa and (area = $1 or area = 'geral') order by area = 'geral', nome`,
    [area],
  );
  return z.array(linhaOpcaoSchema).parse(semRegra).map(paraOpcao);
}

function paraOpcao(linha: z.infer<typeof linhaOpcaoSchema>): OpcaoBanco {
  const regra: RegraBanco | null =
    linha.regra_id && linha.dias && linha.contagem && linha.fundamento
      ? {
          id: linha.regra_id,
          dias: linha.dias,
          contagem: linha.contagem,
          fundamento: linha.fundamento,
          prioridade: linha.prioridade ?? 1,
          ativa: linha.ativa ?? false,
        }
      : null;
  return { codigo: linha.codigo, nome: linha.nome, regra };
}

export async function buscarCalendario(
  db: Pool,
  escritorioId: string,
  tribunal: string | null,
  uf: string | null,
  municipio: string | null,
) {
  const { rows: feriados } = await db.query(
    `select to_char(data, 'YYYY-MM-DD') as data, nome from feriados
     where (escritorio_id is null or escritorio_id = $1)
       and (
         (abrangencia = 'tribunal' and tribunal = $2)
         or (abrangencia = 'estadual' and uf = $3)
         or (abrangencia = 'municipal' and uf = $3 and lower(municipio) = lower($4))
         or (abrangencia = 'nacional')
         or (escritorio_id = $1 and tribunal is null)
       )`,
    [escritorioId, tribunal, uf, municipio],
  );
  const { rows: suspensoes } = await db.query(
    `select to_char(data_inicio, 'YYYY-MM-DD') as inicio, to_char(data_fim, 'YYYY-MM-DD') as fim, motivo
     from suspensoes_tribunal
     where (escritorio_id is null or escritorio_id = $1) and (tribunal = $2 or (escritorio_id = $1 and tribunal is null))`,
    [escritorioId, tribunal],
  );
  return {
    feriados: z
      .array(z.object({ data: z.string(), nome: z.string() }))
      .parse(feriados) as FeriadoBanco[],
    suspensoes: z
      .array(z.object({ inicio: z.string(), fim: z.string(), motivo: z.string() }))
      .parse(suspensoes) as SuspensaoBanco[],
  };
}

export type GravacaoAnalise = {
  job: Job;
  intimacaoId: string;
  analise: AnaliseGravada;
  tribunal: string | null;
  prazo:
    | (PrazoSugerido & {
        regraId: string;
        descricao: string;
        memoria_calculo: MemoriaCalculo;
        dias: number;
        contagem: string;
      })
    | null;
};

async function salvarProcesso(
  cliente: PoolClient,
  escritorioId: string,
  analise: AnaliseGravada,
  tribunal: string | null,
) {
  const { dados } = analise;
  if (
    !dados.numero_processo ||
    !/^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/.test(dados.numero_processo)
  )
    return null;
  const contraria = dados.partes
    .filter((parte) => dados.polo_cliente && parte.polo && parte.polo !== dados.polo_cliente)
    .map((parte) => parte.nome)
    .join(", ");
  const { rows } = await cliente.query(
    `insert into processos (escritorio_id, numero_cnj, tribunal, orgao, uf, municipio, area, rito, polo, parte_contraria, partes)
     values ($1, $2, $3, $4, $5, $6, $7, $8::rito_processo, $9::polo_processo, $10, $11)
     on conflict (escritorio_id, numero_cnj) do update set
       tribunal = coalesce(processos.tribunal, excluded.tribunal),
       orgao = coalesce(processos.orgao, excluded.orgao),
       uf = coalesce(processos.uf, excluded.uf),
       municipio = coalesce(processos.municipio, excluded.municipio),
       area = coalesce(processos.area, excluded.area),
       rito = coalesce(processos.rito, excluded.rito),
       polo = coalesce(processos.polo, excluded.polo),
       parte_contraria = coalesce(processos.parte_contraria, excluded.parte_contraria),
       partes = coalesce(processos.partes, excluded.partes)
     returning id`,
    [
      escritorioId,
      dados.numero_processo,
      tribunal ?? dados.tribunal,
      dados.orgao,
      dados.uf,
      dados.municipio,
      dados.area,
      dados.rito,
      dados.polo_cliente,
      contraria || null,
      dados.partes.length ? nomePartes(dados.partes) : null,
    ],
  );
  return z.object({ id: z.uuid() }).parse(rows[0]).id;
}

const vinculoSchema = z.object({
  processo_id: z.uuid().nullable(),
  numero_cnj: z.string().nullable(),
});

type Vinculo = z.infer<typeof vinculoSchema>;

async function vinculoAtual(
  cliente: PoolClient,
  escritorioId: string,
  intimacaoId: string,
): Promise<Vinculo> {
  const { rows } = await cliente.query(
    `select i.processo_id, p.numero_cnj
     from intimacoes i
     left join processos p on p.id = i.processo_id
     where i.id = $1 and i.escritorio_id = $2
     for update of i`,
    [intimacaoId, escritorioId],
  );
  return vinculoSchema.parse(rows[0]);
}

export function deveSalvarProcesso(vinculo: Vinculo, numeroDaAnalise: string | null) {
  return !vinculo.processo_id || vinculo.numero_cnj === numeroDaAnalise;
}

export async function gravarAnalise(
  db: Pool,
  { job, intimacaoId, analise, tribunal, prazo }: GravacaoAnalise,
) {
  const cliente = await db.connect();
  try {
    await cliente.query("begin");
    const vinculo = await vinculoAtual(cliente, job.escritorio_id, intimacaoId);
    const salvo = deveSalvarProcesso(vinculo, analise.dados.numero_processo)
      ? await salvarProcesso(cliente, job.escritorio_id, analise, tribunal)
      : null;
    const processoId = salvo ?? vinculo.processo_id;
    await cliente.query(
      "delete from prazos where intimacao_id = $1 and escritorio_id = $2 and status = 'sugerido'",
      [intimacaoId, job.escritorio_id],
    );
    if (prazo) {
      await cliente.query(
        `insert into prazos (escritorio_id, processo_id, intimacao_id, origem, regra_prazo_id, descricao,
           dias, contagem, data_inicio, data_vencimento, data_vencimento_sugerida, data_prazo_interno,
           memoria_calculo, status)
         values ($1, $2, $3, 'intimacao', $4, $5, $6, $7::contagem_prazo, $8, $9, $9, $10, $11, 'sugerido')`,
        [
          job.escritorio_id,
          processoId,
          intimacaoId,
          prazo.regraId,
          prazo.descricao,
          prazo.dias,
          prazo.contagem,
          prazo.inicio,
          prazo.vencimento,
          prazo.interno,
          JSON.stringify(prazo.memoria_calculo),
        ],
      );
    }
    await cliente.query(
      `update intimacoes set processo_id = $3, extracao = $4, resumo = $5, tipo_ato = $6, resultado = $7,
         data_disponibilizacao = coalesce($8::date, data_disponibilizacao), status = 'analisada'
       where id = $1 and escritorio_id = $2`,
      [
        intimacaoId,
        job.escritorio_id,
        processoId,
        JSON.stringify(analise),
        analise.resumo.o_que_aconteceu,
        analise.dados.tipo_ato,
        analise.dados.resultado,
        analise.dados.data_disponibilizacao,
      ],
    );
    if (processoId) {
      await cliente.query(
        `update prazos set processo_id = $3
         where escritorio_id = $2 and processo_id is null
           and id = (select tarefa_id from intimacoes where id = $1 and escritorio_id = $2)`,
        [intimacaoId, job.escritorio_id, processoId],
      );
      await ligarCliente(cliente, job.escritorio_id, processoId, analise);
      await atualizarFase(
        cliente,
        job.escritorio_id,
        processoId,
        intimacaoId,
        analise.dados.tipo_ato,
      );
    }
    await cliente.query("commit");
  } catch (erro) {
    await cliente.query("rollback");
    throw erro;
  } finally {
    cliente.release();
  }
}
