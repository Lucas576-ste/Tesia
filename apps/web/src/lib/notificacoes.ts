import { z } from "zod";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type Notificacao = {
  id: string;
  titulo: string;
  texto: string | null;
  href: string | null;
  lida: boolean;
  criadaEm: string;
};

const linhaSchema = z.object({
  id: z.uuid(),
  titulo: z.string(),
  texto: z.string().nullable(),
  href: z.string().nullable(),
  lida_em: z.string().nullable(),
  criado_em: z.string(),
});

export async function listarNotificacoes(): Promise<Notificacao[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("notificacoes")
    .select("id, titulo, texto, href, lida_em, criado_em")
    .order("criado_em", { ascending: false })
    .limit(20);
  const linhas = z.array(linhaSchema).safeParse(data);
  if (!linhas.success) return [];
  return linhas.data.map((linha) => ({
    id: linha.id,
    titulo: linha.titulo,
    texto: linha.texto,
    href: linha.href?.startsWith("/app") ? linha.href : null,
    lida: linha.lida_em !== null,
    criadaEm: linha.criado_em,
  }));
}
