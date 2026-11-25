import {
  ehErroDefinitivoDaApi,
  escolherPeca,
  extrairDados,
  lerDocumento,
  RespostaInvalidaDaIa,
  resumirIntimacao,
  transcreverPdf,
} from "@tesia/ia";
import { htmlParaTexto, type AnaliseGravada } from "@tesia/shared";
import { z } from "zod";
import { buscarCalendario, buscarOpcoes, gravarAnalise, registrarUso } from "../analise/banco.js";
import {
  calcularPrazoSugerido,
  corrigirRito,
  hojeEmBrasilia,
  montarCalendario,
  motivoSemPrazo,
  nomeDaPeca,
  opcoesParaIa,
  regraDaPeca,
  siglaTribunal,
} from "../analise/montar.js";
import { ErroDefinitivo, type Job } from "../fila.js";
import type { Contexto, Tarefa } from "./tipos.js";

const dadosSchema = z.object({ intimacao_id: z.uuid() });
const linhaSchema = z.object({ arquivo_path: z.string().nullable(), texto: z.string().nullable() });

function intimacaoDoJob(job: Job) {
  const resultado = dadosSchema.safeParse(job.dados);
  if (!resultado.success) throw new ErroDefinitivo("Job sem intimacao_id válido");
  return resultado.data.intimacao_id;
}

async function comIa<T>(chamada: () => Promise<T>): Promise<T> {
  try {
    return await chamada();
  } catch (erro) {
    if (erro instanceof RespostaInvalidaDaIa || ehErroDefinitivoDaApi(erro)) {
      throw new ErroDefinitivo(erro instanceof Error ? erro.message : String(erro));
    }
    throw erro;
  }
}

async function obterTexto(job: Job, intimacaoId: string, contexto: Contexto) {
  const { db, supabase, ia, registrar } = contexto;
  const { rows } = await db.query(
    `update intimacoes set status = 'processando'
     where id = $1 and escritorio_id = $2 and excluido_em is null
     returning arquivo_path, texto`,
    [intimacaoId, job.escritorio_id],
  );
  const linha = linhaSchema.safeParse(rows[0]);
  if (!linha.success) throw new ErroDefinitivo("Intimação ou arquivo não encontrado");
  if (linha.data.texto) return htmlParaTexto(linha.data.texto);
  if (!linha.data.arquivo_path) throw new ErroDefinitivo("Intimação sem texto e sem arquivo");

  const { data, error } = await supabase.storage
    .from("intimacoes")
    .download(linha.data.arquivo_path);
  if (error || !data) throw new Error(`Falha ao baixar o arquivo: ${error?.message ?? "vazio"}`);

  const pdf = new Uint8Array(await data.arrayBuffer());
  const cabecalho = Buffer.from(pdf.subarray(0, 5)).toString("latin1");
  if (!cabecalho.startsWith("%PDF")) throw new ErroDefinitivo("O arquivo não é um PDF válido");

  const leitura = await comIa(() =>
    lerDocumento(pdf, { transcrever: (arquivo) => transcreverPdf(ia, arquivo) }),
  );
  if (leitura.origem === "ia")
    await registrarUso(db, job, { etapa: "transcricao", ...leitura.transcricao });
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
  return leitura.texto;
}

async function executar(job: Job, contexto: Contexto) {
  const { db, ia, registrar } = contexto;
  const intimacaoId = intimacaoDoJob(job);
  const texto = await obterTexto(job, intimacaoId, contexto);

  const extracao = await comIa(() => extrairDados(ia, texto));
  await registrarUso(db, job, { etapa: "extracao", ...extracao });
  const dados = {
    ...extracao.resultado,
    rito: corrigirRito(
      extracao.resultado.numero_processo,
      extracao.resultado.rito,
    ) as typeof extracao.resultado.rito,
  };

  const opcoes = await buscarOpcoes(db, dados.area, dados.rito, dados.tipo_ato);
  const escolha = await comIa(() => escolherPeca(ia, dados, opcoesParaIa(opcoes)));
  await registrarUso(db, job, { etapa: "escolha_peca", ...escolha });
  const recomendada = escolha.resultado.recomendada.codigo;
  const regra = regraDaPeca(opcoes, recomendada);

  const tribunal = siglaTribunal(dados.numero_processo, dados.tribunal);
  const { feriados, suspensoes } = await buscarCalendario(
    db,
    job.escritorio_id,
    tribunal,
    dados.uf,
    dados.municipio,
  );
  const calendario = montarCalendario(feriados, suspensoes, dados.rito);
  const prazo = calcularPrazoSugerido(regra, dados, calendario, hojeEmBrasilia());

  const resumo = await comIa(() => resumirIntimacao(ia, texto, dados));
  await registrarUso(db, job, { etapa: "resumo", ...resumo });

  const analise: AnaliseGravada = {
    versao: 1,
    dados,
    resumo: resumo.resultado,
    pecas: [
      { ...escolha.resultado.recomendada, recomendada: true },
      ...escolha.resultado.alternativas.map((alternativa) => ({
        ...alternativa,
        recomendada: false,
      })),
    ].map((peca) => ({ ...peca, nome: nomeDaPeca(opcoes, peca.codigo) })),
    prazo: regra
      ? {
          dias: regra.dias,
          contagem: regra.contagem,
          fundamento: regra.fundamento,
          regra_revisada: regra.ativa,
          forma: prazo?.forma ?? null,
        }
      : null,
    motivo_sem_prazo: prazo ? null : motivoSemPrazo(regra, dados),
  };

  await gravarAnalise(db, {
    job,
    intimacaoId,
    analise,
    tribunal,
    prazo:
      regra && prazo
        ? {
            ...prazo,
            regraId: regra.id,
            descricao: nomeDaPeca(opcoes, recomendada),
            dias: regra.dias,
            contagem: regra.contagem,
            memoria_calculo: { linhas: prazo.memoria, regra_revisada: regra.ativa },
          }
        : null,
  });
  registrar("intimacao_analisada", {
    job_id: job.id,
    tipo_ato: dados.tipo_ato,
    com_prazo: Boolean(prazo),
    regra_revisada: regra?.ativa ?? null,
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
