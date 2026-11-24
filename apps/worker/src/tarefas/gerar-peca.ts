import {
  acharPendencias,
  ehErroDefinitivoDaApi,
  marcarMencaoDePrazo,
  marcarProblemas,
  pontosSemPrazo,
  revisarCitacoes,
  ErroEmbeddingsDefinitivo,
  gerarEmbeddings,
  gerarPeca,
  RespostaInvalidaDaIa,
  vetorParaPgvector,
} from "@tesia/ia";
import { analiseGravadaSchema, perfilEstiloSchema, textoQualificacao } from "@tesia/shared";
import { z } from "zod";
import { registrarUso } from "../analise/banco.js";
import {
  competenciaEmBrasilia,
  limitarTamanhoReferencia,
  textoBuscaEstilo,
} from "../analise/montar.js";
import { ErroDefinitivo, type Job } from "../fila.js";
import type { Contexto, Tarefa } from "./tipos.js";

const dadosSchema = z.object({ peca_id: z.uuid() });

const advogadoSchema = z.object({
  nome: z.string(),
  oab_numero: z.string().min(1),
  oab_uf: z.string().nullable(),
});

const clienteSchema = z.object({
  nome: z.string(),
  documento: z.string().nullable(),
  tipo_pessoa: z.enum(["pf", "pj"]),
  qualificacao: z.unknown(),
});
const MAXIMO_TRECHOS = 6;

const pecaSchema = z.object({
  tipo_peca_id: z.uuid().nullable(),
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
    `select id, documento, secao, texto from (
       select distinct on (t.secao) t.id, coalesce(nullif(d.nome_arquivo, ''), 'peça') as documento,
         t.secao, t.texto, (t.embedding <=> $3::vector) as distancia
       from estilo_trechos t join estilo_documentos d on d.id = t.estilo_documento_id
       where t.escritorio_id = $1 and d.usuario_id = $2 and t.embedding is not null
         and t.secao <> 'outra'
       order by t.secao, t.embedding <=> $3::vector
     ) melhores
     order by distancia
     limit ${MAXIMO_TRECHOS}`,
    [job.escritorio_id, usuarioId, vetorParaPgvector(vetor)],
  );
  return z.array(trechoSchema).parse(rows);
}

export async function tamanhoMedioDasPecas(
  db: Contexto["db"],
  escritorioId: string,
  usuarioId: string | null,
  tipoPecaId: string | null,
) {
  if (!usuarioId) return null;
  const { rows } = await db.query(
    `select coalesce(
       (select avg(length(d.texto)) from estilo_documentos d
         where d.escritorio_id = $1 and d.usuario_id = $2 and d.status = 'lido'
           and d.texto is not null and d.tipo_peca_id = $3),
       (select avg(length(d.texto)) from estilo_documentos d
         where d.escritorio_id = $1 and d.usuario_id = $2 and d.status = 'lido'
           and d.texto is not null)
     )::float8 as media`,
    [escritorioId, usuarioId, tipoPecaId],
  );
  const lida = z.array(z.object({ media: z.number().nullable() })).parse(rows)[0]?.media ?? null;
  return limitarTamanhoReferencia(lida);
}

async function executar(job: Job, contexto: Contexto) {
  const { db, ia, registrar } = contexto;
  const pecaId = pecaDoJob(job);
  const { rows } = await db.query(
    `select p.tipo_peca_id, p.intimacao_id, p.responsavel_id, p.prazo_id, t.nome,
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

  const temQualificacao = peca.data.estrutura.includes("qualificacao");
  const { rows: clientes } = temQualificacao
    ? await db.query(
        `select c.nome, c.documento, c.tipo_pessoa::text as tipo_pessoa, c.qualificacao
         from intimacoes i
         join processos p on p.id = i.processo_id and p.escritorio_id = i.escritorio_id
         join clientes c on c.id = p.cliente_id and c.escritorio_id = p.escritorio_id
         where i.id = $1 and i.escritorio_id = $2`,
        [peca.data.intimacao_id, job.escritorio_id],
      )
    : { rows: [] };
  const clienteDaPeca = clienteSchema.safeParse(clientes[0]);
  const qualificacaoCliente = clienteDaPeca.success ? textoQualificacao(clienteDaPeca.data) : null;

  const { rows: advogados } = await db.query(
    "select nome, oab_numero, oab_uf from usuarios where id = $1 and escritorio_id = $2",
    [peca.data.responsavel_id, job.escritorio_id],
  );
  const dadosAdvogado = advogadoSchema.safeParse(advogados[0]);
  const advogado = dadosAdvogado.success
    ? {
        nome: dadosAdvogado.data.nome,
        oab: `OAB/${dadosAdvogado.data.oab_uf ?? "[CONFIRMAR: UF]"} nº ${dadosAdvogado.data.oab_numero}`,
      }
    : null;

  const pontos = pontosSemPrazo(analise.data.resumo.pontos_ataque);
  const trechos = await buscarTrechos(
    contexto,
    job,
    peca.data.responsavel_id,
    textoBuscaEstilo(peca.data.nome, analise.data.resumo.o_que_aconteceu, pontos),
  );

  const tamanhoReferencia = await tamanhoMedioDasPecas(
    db,
    job.escritorio_id,
    peca.data.responsavel_id,
    peca.data.tipo_peca_id,
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
      qualificacaoCliente,
      advogado,
      tamanhoReferencia,
    }),
  );
  await registrarUso(db, job, { etapa: "geracao_peca", ...resultado });

  let secoes = resultado.secoes;
  try {
    const revisao = await revisarCitacoes(ia, {
      secoes,
      textoIntimacao: intimacao.data.texto ?? "",
      trechos: trechos.map(({ documento, secao, texto }) => ({ documento, secao, texto })),
      advogado,
      qualificacaoCliente,
    });
    await registrarUso(db, job, { etapa: "revisao_citacoes", ...revisao });
    const marcadas = marcarProblemas(secoes, revisao.resultado);
    secoes = marcadas.secoes;
    registrar("citacoes_revisadas", {
      job_id: job.id,
      apontadas: revisao.resultado.length,
      marcadas: marcadas.inseridos,
    });
  } catch (erro) {
    registrar("revisao_falhou", {
      job_id: job.id,
      erro: erro instanceof Error ? erro.message : String(erro),
    });
  }
  const prazoMarcado = marcarMencaoDePrazo(
    secoes,
    trechos.map(({ texto }) => texto),
  );
  secoes = prazoMarcado.secoes;
  if (prazoMarcado.inseridos > 0)
    registrar("mencao_de_prazo_marcada", { job_id: job.id, marcadas: prazoMarcado.inseridos });
  const pendencias = acharPendencias(secoes);

  const aviso =
    !perfil || trechos.length === 0
      ? "Rascunho genérico: envie suas peças em Meu estilo para eu escrever do seu jeito."
      : null;
  const conteudo = { secoes, aviso };
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
        JSON.stringify(pendencias),
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
    secoes: secoes.length,
    pendencias: pendencias.length,
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
