import { createClient } from "@supabase/supabase-js";
import { criarClienteIa } from "@tesia/ia";
import pg from "pg";
import { ambiente } from "./ambiente.js";
import { enviarAlertas, horaBrasilia, hojeBrasilia } from "./alertas/enviar.js";
import { concluirJob, devolverPresos, pegarJob, registrarFalha, type Job } from "./fila.js";
import { analisarIntimacao } from "./tarefas/analisar-intimacao.js";
import { ajustarPecaTarefa } from "./tarefas/ajustar-peca.js";
import { gerarPecaTarefa } from "./tarefas/gerar-peca.js";
import { gerarPerfilEstiloTarefa } from "./tarefas/gerar-perfil-estilo.js";
import { processarPecaEstilo } from "./tarefas/processar-peca-estilo.js";
import type { Contexto, Tarefa } from "./tarefas/tipos.js";

const tarefas: Record<string, Tarefa> = {
  analisar_intimacao: analisarIntimacao,
  processar_peca_estilo: processarPecaEstilo,
  gerar_perfil_estilo: gerarPerfilEstiloTarefa,
  gerar_peca: gerarPecaTarefa,
  ajustar_peca: ajustarPecaTarefa,
};

function registrar(evento: string, dados: Record<string, unknown>) {
  console.log(JSON.stringify({ evento, ...dados, em: new Date().toISOString() }));
}

const contexto: Contexto = {
  db: new pg.Pool({ connectionString: ambiente.DATABASE_URL, max: 3 }),
  supabase: createClient(ambiente.NEXT_PUBLIC_SUPABASE_URL, ambiente.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  }),
  ia: criarClienteIa(ambiente.ANTHROPIC_API_KEY),
  chaveEmbeddings: ambiente.EMBEDDINGS_API_KEY,
  registrar,
};

let ativo = true;

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
  let ultimaConferenciaAlertas = 0;
  let diaAlertas = "";
  while (ativo) {
    try {
      if (Date.now() - ultimaConferenciaAlertas > 3_600_000 || ultimaConferenciaAlertas === 0) {
        ultimaConferenciaAlertas = Date.now();
        const hoje = hojeBrasilia();
        if (hoje !== diaAlertas && horaBrasilia() >= ambiente.HORA_ALERTAS) {
          await enviarAlertas(contexto.db, {
            chaveResend: ambiente.RESEND_API_KEY,
            remetente: ambiente.ALERTA_REMETENTE,
            urlApp: ambiente.URL_APP,
            registrar,
          });
          diaAlertas = hoje;
        }
      }
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
