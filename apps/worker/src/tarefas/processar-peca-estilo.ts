import {
  dividirEmSecoes,
  ehDocx,
  ehErroDefinitivoDaApi,
  ErroEmbeddingsDefinitivo,
  gerarEmbeddings,
  lerDocumento,
  lerDocx,
  RespostaInvalidaDaIa,
  transcreverPdf,
  vetorParaPgvector,
} from "@tesia/ia";
import { z } from "zod";
import { registrarUso } from "../analise/banco.js";
import { ErroDefinitivo, type Job } from "../fila.js";
import type { Contexto, Tarefa } from "./tipos.js";

const dadosSchema = z.object({ estilo_documento_id: z.uuid() });
const linhaSchema = z.object({ arquivo_path: z.string() });

function documentoDoJob(job: Job) {
  const resultado = dadosSchema.safeParse(job.dados);
  if (!resultado.success) throw new ErroDefinitivo("Job sem estilo_documento_id válido");
  return resultado.data.estilo_documento_id;
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

async function extrairTexto(arquivo: Uint8Array, job: Job, contexto: Contexto) {
  if (ehDocx(arquivo)) return definitivo(() => lerDocx(arquivo));
  const cabecalho = Buffer.from(arquivo.subarray(0, 5)).toString("latin1");
  if (!cabecalho.startsWith("%PDF")) throw new ErroDefinitivo("Envie a peça em PDF ou DOCX");
  const leitura = await definitivo(() =>
    lerDocumento(arquivo, { transcrever: (pdf) => transcreverPdf(contexto.ia, pdf) }),
  );
  if (leitura.origem === "ia")
    await registrarUso(contexto.db, job, { etapa: "transcricao", ...leitura.transcricao });
  return leitura.texto;
}

async function executar(job: Job, contexto: Contexto) {
  const { db, supabase, chaveEmbeddings, registrar } = contexto;
  const documentoId = documentoDoJob(job);
  const { rows } = await db.query(
    `update estilo_documentos set status = 'processando'
     where id = $1 and escritorio_id = $2 returning arquivo_path`,
    [documentoId, job.escritorio_id],
  );
  const linha = linhaSchema.safeParse(rows[0]);
  if (!linha.success) throw new ErroDefinitivo("Peça de estilo não encontrada");

  const { data, error } = await supabase.storage.from("estilo").download(linha.data.arquivo_path);
  if (error || !data) throw new Error(`Falha ao baixar a peça: ${error?.message ?? "vazio"}`);
  const arquivo = new Uint8Array(await data.arrayBuffer());

  const texto = await extrairTexto(arquivo, job, contexto);
  const trechos = dividirEmSecoes(texto);
  if (trechos.length === 0) throw new ErroDefinitivo("A peça não tem texto suficiente");

  const embeddings = await definitivo(() =>
    gerarEmbeddings(
      trechos.map((trecho) => trecho.texto),
      { chave: chaveEmbeddings, tipo: "document" },
    ),
  );
  await registrarUso(db, job, {
    etapa: "embeddings",
    versaoPrompt: embeddings.modelo,
    duracaoMs: embeddings.duracaoMs,
    uso: {
      modelo: embeddings.modelo,
      tokensEntrada: embeddings.tokens,
      tokensCache: 0,
      tokensSaida: 0,
      custoEstimado: embeddings.custoEstimado,
    },
  });

  const cliente = await db.connect();
  try {
    await cliente.query("begin");
    await cliente.query(
      "delete from estilo_trechos where estilo_documento_id = $1 and escritorio_id = $2",
      [documentoId, job.escritorio_id],
    );
    for (const [indice, trecho] of trechos.entries()) {
      const vetor = embeddings.vetores[indice];
      if (!vetor) throw new Error("Embedding ausente para um trecho");
      await cliente.query(
        `insert into estilo_trechos (escritorio_id, estilo_documento_id, secao, texto, embedding)
         values ($1, $2, $3, $4, $5::vector)`,
        [job.escritorio_id, documentoId, trecho.secao, trecho.texto, vetorParaPgvector(vetor)],
      );
    }
    await cliente.query(
      "update estilo_documentos set texto = $3, status = 'lido' where id = $1 and escritorio_id = $2",
      [documentoId, job.escritorio_id, texto],
    );
    await cliente.query("commit");
  } catch (erro) {
    await cliente.query("rollback");
    throw erro;
  } finally {
    cliente.release();
  }

  registrar("peca_estilo_lida", {
    job_id: job.id,
    trechos: trechos.length,
    secoes: [...new Set(trechos.map((trecho) => trecho.secao))],
    tokens: embeddings.tokens,
  });
}

async function aoFalhar(job: Job, { db }: Contexto) {
  const resultado = dadosSchema.safeParse(job.dados);
  if (!resultado.success) return;
  await db.query(
    "update estilo_documentos set status = 'erro' where id = $1 and escritorio_id = $2",
    [resultado.data.estilo_documento_id, job.escritorio_id],
  );
}

export const processarPecaEstilo: Tarefa = { executar, aoFalhar };
