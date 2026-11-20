import { ehErroDefinitivoDaApi, gerarExemploEstilo, RespostaInvalidaDaIa } from "@tesia/ia";
import { perfilGravadoSchema } from "@tesia/shared";
import { z } from "zod";
import { registrarUso } from "../analise/banco.js";
import { ErroDefinitivo, type Job } from "../fila.js";
import type { Contexto, Tarefa } from "./tipos.js";

const dadosSchema = z.object({ usuario_id: z.uuid() });
const linhaSchema = z.object({ guia: z.unknown(), exemplo: z.string().nullable() });

async function executar(job: Job, { db, ia, registrar }: Contexto) {
  const dados = dadosSchema.safeParse(job.dados);
  if (!dados.success) throw new ErroDefinitivo("Job sem usuario_id válido");
  const usuarioId = dados.data.usuario_id;

  const { rows } = await db.query(
    "select guia, exemplo from perfis_estilo where usuario_id = $1 and escritorio_id = $2",
    [usuarioId, job.escritorio_id],
  );
  const linha = linhaSchema.safeParse(rows[0]);
  const perfil = linha.success ? perfilGravadoSchema.safeParse(linha.data.guia).data : undefined;
  if (!linha.success || !perfil) throw new ErroDefinitivo("Perfil de estilo ainda não existe");

  try {
    const etapa = await gerarExemploEstilo(ia, perfil, {
      tipo: perfil.estrutura_por_tipo[0]?.tipo ?? "Contestação",
      anterior: linha.data.exemplo ?? undefined,
    });
    await registrarUso(db, job, { etapa: "exemplo_estilo", ...etapa });
    await db.query(
      `update perfis_estilo set exemplo = $3, exemplo_gerado_em = now(), exemplo_erro = false
       where usuario_id = $1 and escritorio_id = $2`,
      [usuarioId, job.escritorio_id, etapa.resultado],
    );
    registrar("exemplo_estilo_gerado", { job_id: job.id, custo: etapa.uso.custoEstimado });
  } catch (erro) {
    if (erro instanceof RespostaInvalidaDaIa || ehErroDefinitivoDaApi(erro)) {
      throw new ErroDefinitivo(erro instanceof Error ? erro.message : String(erro));
    }
    throw erro;
  }
}

async function aoFalhar(job: Job, { db }: Contexto) {
  const dados = dadosSchema.safeParse(job.dados);
  if (!dados.success) return;
  await db.query(
    `update perfis_estilo set exemplo_gerado_em = now(), exemplo_erro = true
     where usuario_id = $1 and escritorio_id = $2`,
    [dados.data.usuario_id, job.escritorio_id],
  );
}

export const gerarExemploEstiloTarefa: Tarefa = { executar, aoFalhar };
