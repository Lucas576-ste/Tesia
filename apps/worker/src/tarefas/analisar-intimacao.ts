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

async function executar(job: Job, { db, supabase }: Contexto) {
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

  const cabecalho = Buffer.from(await data.slice(0, 5).arrayBuffer()).toString("latin1");
  if (!cabecalho.startsWith("%PDF")) throw new ErroDefinitivo("O arquivo não é um PDF válido");
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
