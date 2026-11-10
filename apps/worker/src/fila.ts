import type { Pool } from "pg";
import { z } from "zod";

const jobSchema = z.object({
  id: z.uuid(),
  escritorio_id: z.uuid(),
  tipo: z.string(),
  dados: z.record(z.string(), z.unknown()),
  tentativas: z.number().int(),
  max_tentativas: z.number().int(),
});

export type Job = z.infer<typeof jobSchema>;

export class ErroDefinitivo extends Error {}

export async function pegarJob(db: Pool): Promise<Job | null> {
  const { rows } = await db.query(`
    update fila
    set status = 'executando', tentativas = tentativas + 1, iniciado_em = now(), erro = null
    where id = (
      select id from fila
      where status = 'pendente' and disponivel_em <= now()
      order by disponivel_em
      for update skip locked
      limit 1
    )
    returning id, escritorio_id, tipo, dados, tentativas, max_tentativas
  `);
  return rows[0] ? jobSchema.parse(rows[0]) : null;
}

export async function concluirJob(db: Pool, job: Job) {
  await db.query("update fila set status = 'concluida', concluido_em = now() where id = $1", [
    job.id,
  ]);
}

export async function registrarFalha(db: Pool, job: Job, erro: unknown) {
  const mensagem = erro instanceof Error ? erro.message : String(erro);
  const definitiva = erro instanceof ErroDefinitivo || job.tentativas >= job.max_tentativas;
  await db.query(
    `update fila
     set status = case when $2 then 'falhou'::status_fila else 'pendente'::status_fila end,
         erro = $3,
         disponivel_em = now() + make_interval(secs => 30 * $4::int),
         concluido_em = case when $2 then now() end
     where id = $1`,
    [job.id, definitiva, mensagem.slice(0, 500), job.tentativas],
  );
  return definitiva;
}

export async function devolverPresos(db: Pool) {
  const { rowCount } = await db.query(`
    update fila set status = 'pendente', disponivel_em = now()
    where status = 'executando' and iniciado_em < now() - interval '10 minutes'
  `);
  return rowCount ?? 0;
}
