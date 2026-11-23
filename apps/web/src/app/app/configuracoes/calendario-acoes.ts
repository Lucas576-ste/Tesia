"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { entradaCalendarioSchema, type EntradaCalendario } from "@/lib/calendario-proprio";
import { tribunaisDoEscritorio } from "@/lib/calendario-proprio-servidor";
import { limitar, MENSAGEM_LIMITE } from "@/lib/limite";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

type Supabase = Awaited<ReturnType<typeof criarClienteServidor>>;

async function contarPrazosAfetados(supabase: Supabase, desde: string, tribunal: string | null) {
  let consulta = supabase
    .from("prazos")
    .select("id, processos!inner(tribunal)", { count: "exact", head: true })
    .in("status", ["sugerido", "confirmado"])
    .gte("data_vencimento", desde);
  if (tribunal) consulta = consulta.eq("processos.tribunal", tribunal);
  const { count } = await consulta;
  return count ?? 0;
}

export async function adicionarFeriado(
  entrada: EntradaCalendario,
): Promise<{ ok: true; afetados: number } | { erro: string; campo?: "data" | "ate" }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  const dados = entradaCalendarioSchema.safeParse(entrada);
  if (!dados.success) {
    const problema = dados.error.issues[0];
    const campo = problema?.path[0];
    return {
      erro: problema?.message ?? "Confira os dados.",
      campo: campo === "data" || campo === "ate" ? campo : undefined,
    };
  }
  if (!(await limitar(`calendario:${usuario.id}`, 30, 60))) return { erro: MENSAGEM_LIMITE };
  const { data, ate, descricao, tribunal } = dados.data;

  if (tribunal && !(await tribunaisDoEscritorio()).includes(tribunal)) {
    return { erro: "Escolha um tribunal da lista." };
  }

  const supabase = await criarClienteServidor();
  const { error } = ate
    ? await supabase.from("suspensoes_tribunal").insert({
        escritorio_id: usuario.escritorio_id,
        tribunal,
        data_inicio: data,
        data_fim: ate,
        motivo: descricao,
      })
    : await supabase.from("feriados").insert({
        escritorio_id: usuario.escritorio_id,
        data,
        nome: descricao,
        abrangencia: "tribunal",
        tribunal,
      });
  if (error) {
    if (error.code === "23505") {
      return {
        erro: ate ? "Essa suspensão já está cadastrada." : "Esse feriado já está cadastrado.",
      };
    }
    return { erro: "Não foi possível salvar. Tente de novo." };
  }
  revalidatePath("/app/configuracoes");
  return { ok: true, afetados: await contarPrazosAfetados(supabase, data, tribunal) };
}

export async function removerFeriado(
  id: string,
  tipo: "dia" | "periodo",
): Promise<{ ok: true } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  if (!z.uuid().safeParse(id).success || (tipo !== "dia" && tipo !== "periodo")) {
    return { erro: "Item não encontrado." };
  }
  const supabase = await criarClienteServidor();
  const { error, count } = await supabase
    .from(tipo === "dia" ? "feriados" : "suspensoes_tribunal")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("escritorio_id", usuario.escritorio_id);
  if (error) return { erro: "Não foi possível remover." };
  if (!count) return { erro: "Item não encontrado." };
  revalidatePath("/app/configuracoes");
  return { ok: true };
}
