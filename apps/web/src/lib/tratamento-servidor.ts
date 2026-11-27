import {
  analiseGravadaSchema,
  htmlParaTexto,
  nomePartes,
  normalizarCnj,
  formatarCnj,
} from "@tesia/shared";
import { criarCalendario, inicioProvavelContagem } from "@tesia/prazos";
import { z } from "zod";
import { buscarCalendario } from "@/lib/analise";
import { avisoDeCalendario } from "@/lib/cobertura-calendario";
import { isoParaData } from "@/lib/prazo-interno";
import { AREAS_ATUACAO, CODIGO_AREA } from "@/lib/onboarding";
import type { DadosTratamento } from "@/lib/tratamento-dados";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const nomeSchema = z
  .union([z.object({ nome: z.string() }), z.array(z.object({ nome: z.string() }))])
  .nullable()
  .transform((valor) => (Array.isArray(valor) ? (valor[0] ?? null) : valor));

const termoSchema = z
  .union([
    z.object({
      nome: z.string().nullable(),
      oab_numero: z.string().nullable(),
      oab_uf: z.string().nullable(),
    }),
    z.array(
      z.object({
        nome: z.string().nullable(),
        oab_numero: z.string().nullable(),
        oab_uf: z.string().nullable(),
      }),
    ),
  ])
  .nullable()
  .transform((valor) => (Array.isArray(valor) ? (valor[0] ?? null) : valor));

const processoSchema = z
  .union([
    z.object({
      id: z.uuid(),
      numero_cnj: z.string(),
      partes: z.string().nullable(),
      parte_contraria: z.string().nullable(),
      tribunal: z.string().nullable(),
      uf: z.string().nullable(),
      municipio: z.string().nullable(),
      rito: z.string().nullable(),
    }),
    z.array(z.never()),
  ])
  .nullable()
  .transform((valor) => (valor && !Array.isArray(valor) ? valor : null));

const linhaSchema = z.object({
  id: z.uuid(),
  status: z.enum(["recebida", "processando", "analisada", "erro"]),
  texto: z.string().nullable(),
  tratamento: z.enum(["pendente", "concluida", "ignorada"]),
  concluida_em: z.string().nullable(),
  responsavel_id: z.uuid().nullable(),
  tarefa_id: z.uuid().nullable(),
  numero_processo: z.string().nullable(),
  tribunal: z.string().nullable(),
  tipo_publicacao: z.string().nullable(),
  fonte: z.enum(["diario", "eletronico"]).nullable(),
  data_disponibilizacao: z.string().nullable(),
  publicada_em: z.string().nullable(),
  extracao: z.unknown(),
  termos_monitorados: termoSchema,
  responsavel: nomeSchema,
  tratador: nomeSchema,
  processos: processoSchema,
});

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

function areaDaAnalise(area: string | null | undefined) {
  const nome = AREAS_ATUACAO.find((titulo) => CODIGO_AREA[titulo] === area);
  return nome ?? "Cível e consumidor";
}

export async function buscarTratamento(id: string): Promise<DadosTratamento | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("intimacoes")
    .select(
      "id, status, texto, tratamento, concluida_em, responsavel_id, tarefa_id, numero_processo, tribunal, tipo_publicacao, fonte, data_disponibilizacao, publicada_em, extracao, termos_monitorados(nome, oab_numero, oab_uf), responsavel:usuarios!intimacoes_responsavel_id_fkey(nome), tratador:usuarios!intimacoes_tratada_por_fkey(nome), processos(id, numero_cnj, partes, parte_contraria, tribunal, uf, municipio, rito)",
    )
    .eq("id", id)
    .is("excluido_em", null)
    .maybeSingle();
  const linha = linhaSchema.safeParse(data);
  if (!linha.success) return null;
  const l = linha.data;
  const analise = analiseGravadaSchema.safeParse(l.extracao);
  const dados = analise.data?.dados;

  const disponibilizada = [
    l.data_disponibilizacao,
    l.publicada_em,
    dados?.data_disponibilizacao,
  ].find((valor): valor is string => Boolean(valor && DATA_ISO.test(valor)));
  const fonte = l.fonte ?? (dados?.forma_intimacao === "portal" ? "eletronico" : "diario");
  let inicioProvavel: DadosTratamento["inicioProvavel"] = null;
  if (disponibilizada && dados?.forma_intimacao !== "citacao") {
    const calendario = await buscarCalendario(
      supabase,
      l.processos,
      l.processos?.rito ?? dados?.rito ?? "comum",
    );
    const resultado = inicioProvavelContagem(
      { fonte, disponibilizadaEm: disponibilizada },
      criarCalendario(calendario),
    );
    inicioProvavel = {
      inicioIso: resultado.inicio,
      memoria: resultado.memoria,
      avisoCalendario: avisoDeCalendario(calendario.cobertura, [disponibilizada, resultado.inicio]),
    };
  }

  const { data: confirmado } = await supabase
    .from("prazos")
    .select("data_vencimento")
    .eq("intimacao_id", id)
    .eq("status", "confirmado")
    .order("data_vencimento")
    .limit(1);
  const prazoConfirmado =
    z.array(z.object({ data_vencimento: z.string() })).safeParse(confirmado).data?.[0]
      ?.data_vencimento ?? null;

  const digitos = normalizarCnj(l.numero_processo ?? dados?.numero_processo);
  const termo = l.termos_monitorados;
  return {
    id: l.id,
    status: l.status,
    tratamento: l.tratamento,
    tratadaEm: l.concluida_em,
    tratadaPor: l.tratador?.nome ?? null,
    responsavelId: l.responsavel_id,
    responsavelNome: l.responsavel?.nome ?? null,
    tarefaId: l.tarefa_id,
    prazoConfirmado,
    texto: htmlParaTexto(l.texto ?? ""),
    fonte: l.fonte,
    tribunal: l.tribunal ?? dados?.tribunal ?? null,
    tipoPublicacao: l.tipo_publicacao,
    termo: termo ? (termo.nome ?? `OAB ${termo.oab_numero}/${termo.oab_uf}`) : null,
    numeroProcesso: digitos,
    publicadaEm: l.publicada_em ? isoParaData(l.publicada_em) : null,
    processo: l.processos
      ? {
          id: l.processos.id,
          cnj: l.processos.numero_cnj,
          partes: l.processos.partes ?? l.processos.parte_contraria ?? l.processos.numero_cnj,
        }
      : null,
    inicioProvavel,
    sugestaoProcesso: {
      cnj: digitos ? formatarCnj(digitos) : "",
      partes: dados ? nomePartes(dados.partes) : "",
      area: areaDaAnalise(dados?.area),
      tribunal: l.tribunal ?? dados?.tribunal ?? "",
      vara: dados?.orgao ?? "",
    },
  };
}
