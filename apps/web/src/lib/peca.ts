import type { JSONContent } from "@tiptap/core";
import { analiseGravadaSchema, nomePartes } from "@tesia/shared";
import { z } from "zod";
import { conteudoPecaSchema, documentoDoConteudo } from "@/lib/documento-peca";
import { isoParaData } from "@/lib/prazo-interno";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type VersaoSalva = {
  numero: number;
  origem: "ia" | "usuario";
  data: string;
  pedido?: string | null;
};

export type AjustePeca = {
  usados: number;
  status: "pendente" | "processando" | "concluido" | "erro" | null;
  erro: string | null;
};

export type PecaEditor = {
  id: string;
  tipo: string;
  partes: string;
  cnj: string | null;
  vencimento: string | null;
  status: "rascunho" | "protocolada";
  documento: JSONContent;
  aviso: string | null;
  intimacaoId: string | null;
  fontes: { documento: string; secao: string }[];
  versoes: VersaoSalva[];
  ajuste: AjustePeca;
};

export type EstadoPeca =
  | { status: "gerando"; titulo: string }
  | { status: "erro"; intimacaoId: string | null }
  | { status: "pronta"; peca: PecaEditor };

const umOuNenhum = <T extends z.ZodType>(schema: T) =>
  z
    .union([schema, z.array(schema)])
    .nullable()
    .transform((valor) => (Array.isArray(valor) ? (valor[0] ?? null) : valor));

const linhaSchema = z.object({
  id: z.uuid(),
  titulo: z.string(),
  status: z.enum(["gerando", "rascunho", "revisada", "protocolada", "erro"]),
  intimacao_id: z.uuid().nullable(),
  conteudo: z.unknown(),
  fontes: z.unknown(),
  tipos_peca: umOuNenhum(z.object({ nome: z.string() })),
  processos: umOuNenhum(z.object({ numero_cnj: z.string() })),
  prazos: umOuNenhum(z.object({ data_vencimento: z.string() })),
  intimacoes: umOuNenhum(z.object({ extracao: z.unknown() })),
  ajustes_usados: z.number().int(),
  ajuste_status: z.enum(["pendente", "processando", "concluido", "erro"]).nullable(),
  ajuste_erro: z.string().nullable(),
});

const versoesSchema = z.array(
  z.object({
    versao: z.number().int(),
    origem: z.enum(["ia", "usuario"]),
    criado_em: z.string(),
    pedido: z.string().nullable(),
  }),
);
const fontesSchema = z.array(z.object({ documento: z.string(), secao: z.string() }));

function dataHora(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export async function buscarPeca(id: string): Promise<EstadoPeca | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("pecas")
    .select(
      "id, titulo, status, intimacao_id, conteudo, fontes, ajustes_usados, ajuste_status, ajuste_erro, tipos_peca(nome), processos(numero_cnj), prazos(data_vencimento), intimacoes(extracao)",
    )
    .eq("id", id)
    .is("excluido_em", null)
    .maybeSingle();
  const linha = linhaSchema.safeParse(data);
  if (!linha.success) return null;
  const peca = linha.data;
  if (peca.status === "gerando") return { status: "gerando", titulo: peca.titulo };
  if (peca.status === "erro") return { status: "erro", intimacaoId: peca.intimacao_id };

  const { data: versoes } = await supabase
    .from("pecas_versoes")
    .select("versao, origem, criado_em, pedido:conteudo->>pedido")
    .eq("peca_id", id)
    .order("versao");
  const analise = analiseGravadaSchema.safeParse(peca.intimacoes?.extracao);

  return {
    status: "pronta",
    peca: {
      id: peca.id,
      tipo: peca.tipos_peca?.nome ?? peca.titulo,
      partes: analise.success ? nomePartes(analise.data.dados.partes) : peca.titulo,
      cnj: peca.processos?.numero_cnj ?? null,
      vencimento: peca.prazos ? isoParaData(peca.prazos.data_vencimento) : null,
      status: peca.status === "protocolada" ? "protocolada" : "rascunho",
      documento: documentoDoConteudo(peca.conteudo),
      aviso: conteudoPecaSchema.safeParse(peca.conteudo).data?.aviso ?? null,
      intimacaoId: peca.intimacao_id,
      fontes: fontesSchema.safeParse(peca.fontes).data ?? [],
      versoes: (versoesSchema.safeParse(versoes).data ?? []).map(
        ({ versao, origem, criado_em, pedido }) => ({
          numero: versao,
          origem,
          data: dataHora(criado_em),
          pedido,
        }),
      ),
      ajuste: { usados: peca.ajustes_usados, status: peca.ajuste_status, erro: peca.ajuste_erro },
    },
  };
}
