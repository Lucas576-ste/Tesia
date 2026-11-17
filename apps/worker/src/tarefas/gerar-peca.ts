import {
  ehErroDefinitivoDaApi,
  ErroEmbeddingsDefinitivo,
  gerarEmbeddings,
  gerarPeca,
  RespostaInvalidaDaIa,
  vetorParaPgvector,
} from "@tesia/ia";
import { analiseGravadaSchema, perfilEstiloSchema } from "@tesia/shared";
import { z } from "zod";
import { registrarUso } from "../analise/banco.js";
import { competenciaEmBrasilia, textoBuscaEstilo } from "../analise/montar.js";
import { ErroDefinitivo, type Job } from "../fila.js";
import type { Contexto, Tarefa } from "./tipos.js";

const dadosSchema = z.object({ peca_id: z.uuid() });
const MAXIMO_TRECHOS = 3;

const pecaSchema = z.object({
  intimacao_id: z.uuid().nullable(),
  responsavel_id: z.uuid().nullable(),
  prazo_id: z.uuid().nullable(),
  nome: z.string(),
  estrutura: z.array(z.string()),
  instrucoes: z.string().nullable(),
});

const intimacaoSchema = z.object({ texto: z.string().nullable(), extracao: z.unknown() });
const trechoSchema = z.object({
  id: z.uuid(),
  documento: z.string(),
  secao: z.string(),
  texto: z.string(),
});

function pecaDoJob(job: Job) {
  const resultado = dadosSchema.safeParse(job.dados);
  if (!resultado.success) throw new ErroDefinitivo("Job sem peca_id válido");
  return resultado.data.peca_id;
}

async function definitivo<T>(chamada: () => Promise<T>): Promise<T> {
  try {
    return await chamada();
  } catch (erro) {
    if (
      erro instanceof RespostaInvalidaDaIa ||
      erro instanceof ErroEmbeddingsDefinitivo ||
      ehErroDefinitivoDaApi(erro)
    ) {
      throw new ErroDefinitivo(erro instanceof Error ? erro.message : String(erro));
    }
    throw erro;
  }
}

async function buscarTrechos(
  contexto: Contexto,
  job: Job,
  usuarioId: string | null,
  consulta: string,
) {
  const { db, chaveEmbeddings } = contexto;
  if (!usuarioId) return [];
  const { rows: total } = await db.query(
    `select count(*)::int as n from estilo_trechos t join estilo_documentos d on d.id = t.estilo_documento_id
     where t.escritorio_id = $1 and d.usuario_id = $2 and t.embedding is not null`,
    [job.escritorio_id, usuarioId],
  );
  if (!z.array(z.object({ n: z.number() })).parse(total)[0]?.n) return [];

  const embedding = await definitivo(() =>
    gerarEmbeddings([consulta], { chave: chaveEmbeddings, tipo: "query" }),
  );
  await registrarUso(db, job, {
    etapa: "busca_estilo",
    versaoPrompt: embedding.modelo,
    duracaoMs: embedding.duracaoMs,
    uso: {
      modelo: embedding.modelo,
      tokensEntrada: embedding.tokens,
      tokensCache: 0,
      tokensSaida: 0,
      custoEstimado: embedding.custoEstimado,
    },
  });
  const vetor = embedding.vetores[0];
  if (!vetor) return [];
  const { rows } = await db.query(
    `select t.id, coalesce(nullif(d.nome_arquivo, ''), 'peça') as documento, t.secao, t.texto
     from estilo_trechos t join estilo_documentos d on d.id = t.estilo_documento_id
     where t.escritorio_id = $1 and d.usuario_id = $2 and t.embedding is not null
     order by t.embedding <=> $3::vector
     limit ${MAXIMO_TRECHOS}`,
    [job.escritorio_id, usuarioId, vetorParaPgvector(vetor)],
  );
  return z.array(trechoSchema).parse(rows);
}

async function executar(job: Job, contexto: Contexto) {
  const { db, ia, registrar } = contexto;
  const pecaId = pecaDoJob(job);
  const { rows } = await db.query(
    `select p.intimacao_id, p.responsavel_id, p.prazo_id, t.nome,
       coalesce((select array_agg(x) from jsonb_array_elements_text(t.estrutura) x), '{}') as estrutura,
       t.instrucoes
     from pecas p join tipos_peca t on t.id = p.tipo_peca_id
     where p.id = $1 and p.escritorio_id = $2 and p.status = 'gerando'`,
    [pecaId, job.escritorio_id],
  );
  const peca = pecaSchema.safeParse(rows[0]);
  if (!peca.success) throw new ErroDefinitivo("Peça não encontrada ou já gerada");
  if (!peca.data.intimacao_id) throw new ErroDefinitivo("Peça sem intimação");

  const { rows: intimacoes } = await db.query(
    "select texto, extracao from intimacoes where id = $1 and escritorio_id = $2",
    [peca.data.intimacao_id, job.escritorio_id],
  );
  const intimacao = intimacaoSchema.safeParse(intimacoes[0]);
  const analise = analiseGravadaSchema.safeParse(intimacao.data?.extracao);
  if (!intimacao.success || !analise.success || !intimacao.data.texto)
    throw new ErroDefinitivo("Intimação sem análise");

  const { rows: perfis } = await db.query(
    "select guia from perfis_estilo where usuario_id = $1 and escritorio_id = $2",
    [peca.data.responsavel_id, job.escritorio_id],
  );
  const perfil = perfilEstiloSchema.safeParse(perfis[0]?.guia).data ?? null;

  const { rows: prazos } = await db.query(
    "select to_char(data_vencimento, 'DD/MM/YYYY') as vencimento from prazos where id = $1 and escritorio_id = $2",
    [peca.data.prazo_id, job.escritorio_id],
  );
  const vencimento = z.object({ vencimento: z.string() }).safeParse(prazos[0]).data?.vencimento;

  const pontos = analise.data.resumo.pontos_ataque;
  const trechos = await buscarTrechos(
    contexto,
    job,
    peca.data.responsavel_id,
    textoBuscaEstilo(peca.data.nome, analise.data.resumo.o_que_aconteceu, pontos),
  );

  const resultado = await definitivo(() =>
    gerarPeca(ia, {
      peca: {
        nome: peca.data.nome,
        estrutura: peca.data.estrutura,
        instrucoes: peca.data.instrucoes,
      },
      perfil,
      trechos: trechos.map(({ documento, secao, texto }) => ({ documento, secao, texto })),
      dados: { ...analise.data.dados, pontos: undefined },
      textoIntimacao: intimacao.data.texto ?? "",
      pontosAtacar: pontos,
      prazo: vencimento ? { vencimento, fundamento: analise.data.prazo?.fundamento ?? "" } : null,
    }),
  );
  await registrarUso(db, job, { etapa: "geracao_peca", ...resultado });

  const aviso =
    !perfil || trechos.length === 0
      ? "Rascunho genérico: envie suas peças em Meu estilo para eu escrever do seu jeito."
      : null;
  const conteudo = { secoes: resultado.secoes, aviso };
  const fontes = trechos.map(({ id, documento, secao }) => ({ trecho_id: id, documento, secao }));

  const cliente = await db.connect();
  try {
    await cliente.query("begin");
    await cliente.query(
      `update pecas set conteudo = $3, pendencias = $4, fontes = $5, status = 'rascunho', versao = 1
       where id = $1 and escritorio_id = $2`,
      [
        pecaId,
        job.escritorio_id,
        JSON.stringify(conteudo),
        JSON.stringify(resultado.pendencias),
        JSON.stringify(fontes),
      ],
    );
    await cliente.query(
      `insert into pecas_versoes (escritorio_id, peca_id, versao, conteudo, origem)
       values ($1, $2, 1, $3, 'ia') on conflict (peca_id, versao) do update set conteudo = excluded.conteudo`,
      [job.escritorio_id, pecaId, JSON.stringify(conteudo)],
    );
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
    await cliente.query("commit");
  } catch (erro) {
    await cliente.query("rollback");
    throw erro;
  } finally {
    cliente.release();
  }

  registrar("peca_gerada", {
    job_id: job.id,
    secoes: resultado.secoes.length,
    pendencias: resultado.pendencias.length,
    trechos: trechos.length,
    custo: resultado.uso.custoEstimado,
  });
}

async function aoFalhar(job: Job, { db }: Contexto) {
  const resultado = dadosSchema.safeParse(job.dados);
  if (!resultado.success) return;
  await db.query(
    "update pecas set status = 'erro' where id = $1 and escritorio_id = $2 and status = 'gerando'",
    [resultado.data.peca_id, job.escritorio_id],
  );
}

export const gerarPecaTarefa: Tarefa = { executar, aoFalhar };
