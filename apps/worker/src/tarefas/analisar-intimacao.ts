import {
  ehErroDefinitivoDaApi,
  lerDocumento,
  RespostaInvalidaDaIa,
  transcreverPdf,
  type Leitura,
} from "@tesia/ia";
import { z } from "zod";
import { ErroDefinitivo, type Job } from "../fila.js";
import type { Contexto, Tarefa } from "./tipos.js";

const dadosSchema = z.object({ intimacao_id: z.uuid() });
const linhaSchema = z.object({ arquivo_path: z.string() });

function intimacaoDoJob(job: Job) {
  const resultado = dadosSchema.safeParse(job.dados);
  if (!resultado.success) throw new ErroDefinitivo("Job sem intimacao_id válido");
  return resultado.data.intimacao_id;
}

async function ler(pdf: Uint8Array, { ia }: Contexto): Promise<Leitura> {
  try {
    return await lerDocumento(pdf, { transcrever: (arquivo) => transcreverPdf(ia, arquivo) });
  } catch (erro) {
    if (erro instanceof RespostaInvalidaDaIa || ehErroDefinitivoDaApi(erro)) {
      throw new ErroDefinitivo(erro instanceof Error ? erro.message : String(erro));
    }
    throw erro;
  }
}

async function registrarUso(job: Job, leitura: Leitura, { db }: Contexto) {
  if (leitura.origem !== "ia") return;
  const { uso, versaoPrompt, duracaoMs } = leitura.transcricao;
  await db.query(
    `insert into uso_ia (escritorio_id, job_id, etapa, modelo, versao_prompt,
       tokens_entrada, tokens_cache, tokens_saida, custo_estimado, duracao_ms)
     values ($1, $2, 'transcricao', $3, $4, $5, $6, $7, $8, $9)`,
    [
      job.escritorio_id,
      job.id,
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

async function executar(job: Job, contexto: Contexto) {
  const { db, supabase, registrar } = contexto;
  const intimacaoId = intimacaoDoJob(job);
  const { rows } = await db.query(
    `update intimacoes set status = 'processando'
     where id = $1 and escritorio_id = $2 and excluido_em is null
     returning arquivo_path`,
    [intimacaoId, job.escritorio_id],
  );
  const linha = linhaSchema.safeParse(rows[0]);
  if (!linha.success) throw new ErroDefinitivo("Intimação ou arquivo não encontrado");

  const { data, error } = await supabase.storage
    .from("intimacoes")
    .download(linha.data.arquivo_path);
  if (error || !data) throw new Error(`Falha ao baixar o arquivo: ${error?.message ?? "vazio"}`);

  const pdf = new Uint8Array(await data.arrayBuffer());
  const cabecalho = Buffer.from(pdf.subarray(0, 5)).toString("latin1");
  if (!cabecalho.startsWith("%PDF")) throw new ErroDefinitivo("O arquivo não é um PDF válido");

  const leitura = await ler(pdf, contexto);
  await registrarUso(job, leitura, contexto);
  await db.query("update intimacoes set texto = $1 where id = $2 and escritorio_id = $3", [
    leitura.texto,
    intimacaoId,
    job.escritorio_id,
  ]);
  registrar("documento_lido", {
    job_id: job.id,
    origem: leitura.origem,
    paginas: leitura.paginas,
    caracteres: leitura.texto.length,
  });
}

async function aoFalhar(job: Job, { db }: Contexto) {
  const resultado = dadosSchema.safeParse(job.dados);
  if (!resultado.success) return;
  await db.query("update intimacoes set status = 'erro' where id = $1 and escritorio_id = $2", [
    resultado.data.intimacao_id,
    job.escritorio_id,
  ]);
}

export const analisarIntimacao: Tarefa = { executar, aoFalhar };
