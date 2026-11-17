import { z } from "zod";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type PecaGerada = {
  id: string;
  titulo: string;
  status: "gerando" | "rascunho" | "revisada" | "protocolada" | "erro";
  intimacaoId: string | null;
  secoes: { titulo: string; texto: string }[];
  aviso: string | null;
  pendencias: { secao: number; titulo: string; texto: string }[];
  fontes: { documento: string; secao: string }[];
};

const linhaSchema = z.object({
  id: z.uuid(),
  titulo: z.string(),
  status: z.enum(["gerando", "rascunho", "revisada", "protocolada", "erro"]),
  intimacao_id: z.uuid().nullable(),
  conteudo: z.unknown(),
  pendencias: z.unknown(),
  fontes: z.unknown(),
});

const conteudoSchema = z.object({
  secoes: z.array(z.object({ titulo: z.string(), texto: z.string() })).default([]),
  aviso: z.string().nullable().default(null),
});

const pendenciasSchema = z.array(
  z.object({ secao: z.number().int(), titulo: z.string(), texto: z.string() }),
);
const fontesSchema = z.array(z.object({ documento: z.string(), secao: z.string() }));

export async function buscarPecaGerada(id: string): Promise<PecaGerada | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("pecas")
    .select("id, titulo, status, intimacao_id, conteudo, pendencias, fontes")
    .eq("id", id)
    .is("excluido_em", null)
    .maybeSingle();
  const linha = linhaSchema.safeParse(data);
  if (!linha.success) return null;
  const conteudo = conteudoSchema.safeParse(linha.data.conteudo).data ?? {
    secoes: [],
    aviso: null,
  };
  return {
    id: linha.data.id,
    titulo: linha.data.titulo,
    status: linha.data.status,
    intimacaoId: linha.data.intimacao_id,
    secoes: conteudo.secoes,
    aviso: conteudo.aviso,
    pendencias: pendenciasSchema.safeParse(linha.data.pendencias).data ?? [],
    fontes: fontesSchema.safeParse(linha.data.fontes).data ?? [],
  };
}
