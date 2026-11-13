import { ehErroDefinitivoDaApi, gerarPerfilEstilo, RespostaInvalidaDaIa } from "@tesia/ia";
import { z } from "zod";
import { registrarUso } from "../analise/banco.js";
import { ErroDefinitivo, type Job } from "../fila.js";
import type { Contexto, Tarefa } from "./tipos.js";

const dadosSchema = z.object({ usuario_id: z.uuid() });
const pecasSchema = z.array(z.object({ nome: z.string(), texto: z.string() }));

function usuarioDoJob(job: Job) {
  const resultado = dadosSchema.safeParse(job.dados);
  if (!resultado.success) throw new ErroDefinitivo("Job sem usuario_id válido");
  return resultado.data.usuario_id;
}

async function salvar(
  contexto: Contexto,
  job: Job,
  usuarioId: string,
  valores: { guia: unknown; frases: string[]; pecas: number },
) {
  await contexto.db.query(
    `update perfis_estilo
     set guia = $3, resumo_exibicao = $4, atualizado_com = $5, gerado_em = now()
     where usuario_id = $1 and escritorio_id = $2`,
    [usuarioId, job.escritorio_id, JSON.stringify(valores.guia), valores.frases, valores.pecas],
  );
}

async function executar(job: Job, contexto: Contexto) {
  const { db, ia, registrar } = contexto;
  const usuarioId = usuarioDoJob(job);
  const { rows } = await db.query(
    `select coalesce(nullif(nome_arquivo, ''), 'peca') as nome, texto from estilo_documentos
     where usuario_id = $1 and escritorio_id = $2 and status = 'lido' and texto is not null
     order by criado_em`,
    [usuarioId, job.escritorio_id],
  );
  const pecas = pecasSchema.parse(rows);

  if (pecas.length === 0) {
    await salvar(contexto, job, usuarioId, { guia: {}, frases: [], pecas: 0 });
    registrar("perfil_estilo_limpo", { job_id: job.id });
    return;
  }

  try {
    const resultado = await gerarPerfilEstilo(ia, pecas);
    await registrarUso(db, job, { etapa: "perfil_estilo", ...resultado });
    await salvar(contexto, job, usuarioId, {
      guia: resultado.perfil,
      frases: resultado.perfil.frases_exibicao,
      pecas: pecas.length,
    });
    registrar("perfil_estilo_gerado", {
      job_id: job.id,
      pecas: pecas.length,
      custo: resultado.uso.custoEstimado,
    });
  } catch (erro) {
    if (erro instanceof RespostaInvalidaDaIa || ehErroDefinitivoDaApi(erro)) {
      throw new ErroDefinitivo(erro instanceof Error ? erro.message : String(erro));
    }
    throw erro;
  }
}

async function aoFalhar(job: Job, { db }: Contexto) {
  const resultado = dadosSchema.safeParse(job.dados);
  if (!resultado.success) return;
  await db.query(
    "update perfis_estilo set gerado_em = now() where usuario_id = $1 and escritorio_id = $2",
    [resultado.data.usuario_id, job.escritorio_id],
  );
}

export const gerarPerfilEstiloTarefa: Tarefa = { executar, aoFalhar };
