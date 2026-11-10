import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { ambiente } from "./ambiente.js";
import { concluirJob, devolverPresos, pegarJob, registrarFalha, type Job } from "./fila.js";
import { analisarIntimacao } from "./tarefas/analisar-intimacao.js";
import type { Contexto, Tarefa } from "./tarefas/tipos.js";

const tarefas: Record<string, Tarefa> = {
  analisar_intimacao: analisarIntimacao,
};

const contexto: Contexto = {
  db: new pg.Pool({ connectionString: ambiente.DATABASE_URL, max: 3 }),
  supabase: createClient(ambiente.NEXT_PUBLIC_SUPABASE_URL, ambiente.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  }),
};

let ativo = true;

function registrar(evento: string, dados: Record<string, unknown>) {
  console.log(JSON.stringify({ evento, ...dados, em: new Date().toISOString() }));
}

async function processar(job: Job) {
  const inicio = Date.now();
  const tarefa = tarefas[job.tipo];
  try {
    if (!tarefa) throw new Error(`Tipo de job desconhecido: ${job.tipo}`);
    await tarefa.executar(job, contexto);
    await concluirJob(contexto.db, job);
    registrar("job_concluido", { job_id: job.id, tipo: job.tipo, ms: Date.now() - inicio });
  } catch (erro) {
    const definitiva = await registrarFalha(contexto.db, job, erro);
    if (definitiva && tarefa) await tarefa.aoFalhar(job, contexto);
    registrar(definitiva ? "job_falhou" : "job_reagendado", {
      job_id: job.id,
      tipo: job.tipo,
      escritorio_id: job.escritorio_id,
      tentativa: job.tentativas,
      erro: erro instanceof Error ? erro.message : String(erro),
    });
  }
}

async function laco() {
  let ultimaLimpeza = 0;
  while (ativo) {
    try {
      if (Date.now() - ultimaLimpeza > 60_000) {
        const devolvidos = await devolverPresos(contexto.db);
        if (devolvidos > 0) registrar("jobs_devolvidos", { quantidade: devolvidos });
        ultimaLimpeza = Date.now();
      }
      const job = await pegarJob(contexto.db);
      if (job) {
        await processar(job);
        continue;
      }
    } catch (erro) {
      registrar("erro_fila", { erro: erro instanceof Error ? erro.message : String(erro) });
    }
    await new Promise((resolver) => setTimeout(resolver, ambiente.INTERVALO_FILA_MS));
  }
  await contexto.db.end();
  registrar("worker_encerrado", {});
}

for (const sinal of ["SIGINT", "SIGTERM"] as const) {
  process.on(sinal, () => {
    ativo = false;
  });
}

registrar("worker_iniciado", { tarefas: Object.keys(tarefas) });
await laco();
