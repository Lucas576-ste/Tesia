import { ajustarPeca, ehErroDefinitivoDaApi, RespostaInvalidaDaIa } from "@tesia/ia";
import {
  documentoDoConteudo,
  documentoParaSecoes,
  pendenciasDoDocumento,
  perfilEstiloSchema,
  secoesParaDocumento,
} from "@tesia/shared";
import { z } from "zod";
import { registrarUso } from "../analise/banco.js";
import { competenciaEmBrasilia } from "../analise/montar.js";
import { ErroDefinitivo, type Job } from "../fila.js";
import type { Contexto, Tarefa } from "./tipos.js";

const dadosSchema = z.object({ peca_id: z.uuid() });
export const AJUSTES_SEM_CUSTO = 3;

const pecaSchema = z.object({
  conteudo: z.unknown(),
  ajuste_pedido: z.string().nullable(),
  ajustes_usados: z.number().int(),
  responsavel_id: z.uuid().nullable(),
  status: z.string(),
});

function pecaDoJob(job: Job) {
  const resultado = dadosSchema.safeParse(job.dados);
  if (!resultado.success) throw new ErroDefinitivo("Job sem peca_id válido");
  return resultado.data.peca_id;
}

async function executar(job: Job, contexto: Contexto) {
  const { db, ia, registrar } = contexto;
  const pecaId = pecaDoJob(job);
  const { rows } = await db.query(
    `update pecas set ajuste_status = 'processando', ajuste_erro = null
     where id = $1 and escritorio_id = $2 and ajuste_status in ('pendente', 'processando')
     returning conteudo, ajuste_pedido, ajustes_usados, responsavel_id, status`,
    [pecaId, job.escritorio_id],
  );
  const peca = pecaSchema.safeParse(rows[0]);
  if (!peca.success || !peca.data.ajuste_pedido)
    throw new ErroDefinitivo("Pedido de ajuste não encontrado");
  if (peca.data.status !== "rascunho") throw new ErroDefinitivo("A peça não está em rascunho");

  const { rows: perfis } = await db.query(
    "select guia from perfis_estilo where usuario_id = $1 and escritorio_id = $2",
    [peca.data.responsavel_id, job.escritorio_id],
  );
  const perfil = perfilEstiloSchema.safeParse(perfis[0]?.guia).data ?? null;
  const secoes = documentoParaSecoes(documentoDoConteudo(peca.data.conteudo));
  if (secoes.length === 0) throw new ErroDefinitivo("A peça está vazia");

  let resultado;
  try {
    resultado = await ajustarPeca(ia, { secoes, pedido: peca.data.ajuste_pedido, perfil });
  } catch (erro) {
    if (erro instanceof RespostaInvalidaDaIa || ehErroDefinitivoDaApi(erro)) {
      throw new ErroDefinitivo(erro instanceof Error ? erro.message : String(erro));
    }
    throw erro;
  }
  await registrarUso(db, job, { etapa: "ajuste_peca", ...resultado });

  const documento = secoesParaDocumento(resultado.secoes);
  const contaComoPeca = peca.data.ajustes_usados >= AJUSTES_SEM_CUSTO;
  const cliente = await db.connect();
  try {
    await cliente.query("begin");
    const { rows: ultimas } = await cliente.query(
      "select coalesce(max(versao), 0)::int as versao from pecas_versoes where peca_id = $1",
      [pecaId],
    );
    const versao = (z.array(z.object({ versao: z.number() })).parse(ultimas)[0]?.versao ?? 0) + 1;
    await cliente.query(
      `insert into pecas_versoes (escritorio_id, peca_id, versao, conteudo, origem)
       values ($1, $2, $3, $4, 'ia')`,
      [
        job.escritorio_id,
        pecaId,
        versao,
        JSON.stringify({ doc: documento, pedido: peca.data.ajuste_pedido }),
      ],
    );
    await cliente.query(
      `update pecas set conteudo = $3, versao = $4, pendencias = $5, ajustes_usados = ajustes_usados + 1,
         ajuste_status = 'concluido', ajuste_erro = null
       where id = $1 and escritorio_id = $2`,
      [
        pecaId,
        job.escritorio_id,
        JSON.stringify({ doc: documento, aviso: null }),
        versao,
        JSON.stringify(pendenciasDoDocumento(documento)),
      ],
    );
    if (contaComoPeca) {
      await cliente.query(
        `insert into uso_mensal (escritorio_id, competencia, pecas_geradas, tokens_entrada, tokens_saida, custo_estimado)
         values ($1, $2, 1, $3, $4, $5)
         on conflict (escritorio_id, competencia) do update set
           pecas_geradas = uso_mensal.pecas_geradas + 1,
           tokens_entrada = uso_mensal.tokens_entrada + excluded.tokens_entrada,
           tokens_saida = uso_mensal.tokens_saida + excluded.tokens_saida,
           custo_estimado = uso_mensal.custo_estimado + excluded.custo_estimado`,
        [
          job.escritorio_id,
          competenciaEmBrasilia(),
          resultado.uso.tokensEntrada + resultado.uso.tokensCache,
          resultado.uso.tokensSaida,
          resultado.uso.custoEstimado,
        ],
      );
    }
    await cliente.query("commit");
  } catch (erro) {
    await cliente.query("rollback");
    throw erro;
  } finally {
    cliente.release();
  }
  registrar("peca_ajustada", {
    job_id: job.id,
    secoes_alteradas: resultado.alteradas,
    conta_como_peca: contaComoPeca,
    custo: resultado.uso.custoEstimado,
  });
}

async function aoFalhar(job: Job, { db }: Contexto) {
  const resultado = dadosSchema.safeParse(job.dados);
  if (!resultado.success) return;
  await db.query(
    "update pecas set ajuste_status = 'erro', ajuste_erro = 'Não consegui fazer este ajuste. Tente reformular o pedido.' where id = $1 and escritorio_id = $2",
    [resultado.data.peca_id, job.escritorio_id],
  );
}

export const ajustarPecaTarefa: Tarefa = { executar, aoFalhar };
