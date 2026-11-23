import { z } from "zod";
import { ordenarItens, type ItemCalendario } from "@/lib/calendario-proprio";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const feriadoSchema = z.object({
  id: z.uuid(),
  data: z.string(),
  nome: z.string(),
  tribunal: z.string().nullable(),
});

const suspensaoSchema = z.object({
  id: z.uuid(),
  data_inicio: z.string(),
  data_fim: z.string(),
  motivo: z.string(),
  tribunal: z.string().nullable(),
});

export async function listarCalendarioProprio(): Promise<ItemCalendario[]> {
  const supabase = await criarClienteServidor();
  const [{ data: feriados }, { data: suspensoes }] = await Promise.all([
    supabase.from("feriados").select("id, data, nome, tribunal").not("escritorio_id", "is", null),
    supabase
      .from("suspensoes_tribunal")
      .select("id, data_inicio, data_fim, motivo, tribunal")
      .not("escritorio_id", "is", null),
  ]);
  const dias = (z.array(feriadoSchema).safeParse(feriados).data ?? []).map(
    (linha): ItemCalendario => ({
      id: linha.id,
      tipo: "dia",
      data: linha.data,
      ate: null,
      descricao: linha.nome,
      tribunal: linha.tribunal,
    }),
  );
  const periodos = (z.array(suspensaoSchema).safeParse(suspensoes).data ?? []).map(
    (linha): ItemCalendario => ({
      id: linha.id,
      tipo: "periodo",
      data: linha.data_inicio,
      ate: linha.data_fim,
      descricao: linha.motivo,
      tribunal: linha.tribunal,
    }),
  );
  return ordenarItens([...dias, ...periodos]);
}

export async function tribunaisDoEscritorio(): Promise<string[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("processos")
    .select("tribunal")
    .is("excluido_em", null)
    .not("tribunal", "is", null);
  const lidos = z.array(z.object({ tribunal: z.string() })).safeParse(data).data ?? [];
  return [...new Set(lidos.map(({ tribunal }) => tribunal.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}
