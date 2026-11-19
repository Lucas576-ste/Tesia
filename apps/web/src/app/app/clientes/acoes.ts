"use server";

import { fasesDoRito, normalizarNome } from "@tesia/shared";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dadosClienteSchema, type DadosCliente } from "@/lib/cliente-tipos";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

type Resultado = { ok: true; id?: string } | { erro: string };

function atualizar(clienteId?: string) {
  revalidatePath("/app/clientes");
  if (clienteId) revalidatePath(`/app/clientes/${clienteId}`);
  revalidatePath("/app/processos", "layout");
}

function colunas(dados: z.output<typeof dadosClienteSchema>) {
  return {
    nome: dados.nome,
    nome_normalizado: normalizarNome(dados.nome),
    documento: dados.documento || null,
    contato: { telefone: dados.telefone || undefined, email: dados.email || undefined },
  };
}

export async function criarCliente(entrada: DadosCliente): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  const dados = dadosClienteSchema.safeParse(entrada);
  if (!dados.success) return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("clientes")
    .insert({ ...colunas(dados.data), escritorio_id: usuario.escritorio_id })
    .select("id")
    .single();
  const linha = z.object({ id: z.uuid() }).safeParse(data);
  if (error || !linha.success) return { erro: "Não foi possível cadastrar o cliente." };
  atualizar();
  return { ok: true, id: linha.data.id };
}

export async function editarCliente(id: string, entrada: DadosCliente): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(id).success) return { erro: "Cliente não encontrado." };
  const dados = dadosClienteSchema.safeParse(entrada);
  if (!dados.success) return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("clientes")
    .update(colunas(dados.data))
    .eq("id", id)
    .select("id");
  if (error || !data?.length) return { erro: "Não foi possível salvar." };
  atualizar(id);
  return { ok: true };
}

export async function juntarClientes(manterId: string, removerId: string): Promise<Resultado> {
  const usuario = await usuarioAtual();
  const ids = z.tuple([z.uuid(), z.uuid()]).safeParse([manterId, removerId]);
  if (!usuario || !ids.success || manterId === removerId)
    return { erro: "Escolha dois clientes diferentes." };
  const supabase = await criarClienteServidor();
  const { data: destino } = await supabase
    .from("clientes")
    .select("id")
    .eq("id", manterId)
    .maybeSingle();
  if (!destino) return { erro: "Cliente não encontrado." };
  const { error: erroProcessos } = await supabase
    .from("processos")
    .update({ cliente_id: manterId })
    .eq("cliente_id", removerId);
  if (erroProcessos) return { erro: "Não foi possível mover os processos." };
  const { error } = await supabase.from("clientes").delete().eq("id", removerId);
  if (error) return { erro: "Os processos foram movidos, mas o cliente antigo não foi apagado." };
  atualizar(manterId);
  return { ok: true, id: manterId };
}

export async function trocarClienteDoProcesso(
  processoId: string,
  clienteId: string | null,
): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(processoId).success)
    return { erro: "Processo não encontrado." };
  if (clienteId && !z.uuid().safeParse(clienteId).success) return { erro: "Cliente inválido." };
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("processos")
    .update({ cliente_id: clienteId })
    .eq("id", processoId)
    .select("id");
  if (error || !data?.length) return { erro: "Não foi possível trocar o cliente." };
  atualizar(clienteId ?? undefined);
  revalidatePath(`/app/processos/${processoId}`);
  return { ok: true };
}

export async function corrigirFase(processoId: string, fase: string): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(processoId).success)
    return { erro: "Processo não encontrado." };
  const supabase = await criarClienteServidor();
  const { data: processo } = await supabase
    .from("processos")
    .select("rito")
    .eq("id", processoId)
    .maybeSingle();
  const rito = z.object({ rito: z.string().nullable() }).safeParse(processo).data?.rito ?? null;
  if (!fasesDoRito(rito).some((item) => item.codigo === fase))
    return { erro: "Fase inválida para este processo." };
  const { error } = await supabase
    .from("processos")
    .update({
      fase,
      fase_origem: "manual",
      fase_atualizada_em: new Date().toISOString(),
      encerrado_em: fase === "arquivado" ? new Date().toISOString() : null,
    })
    .eq("id", processoId);
  if (error) return { erro: "Não foi possível corrigir a fase." };
  atualizar();
  revalidatePath(`/app/processos/${processoId}`);
  return { ok: true };
}

export async function encerrarProcesso(processoId: string, encerrado: boolean): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(processoId).success)
    return { erro: "Processo não encontrado." };
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("processos")
    .update({ encerrado_em: encerrado ? new Date().toISOString() : null })
    .eq("id", processoId);
  if (error) return { erro: "Não foi possível atualizar o processo." };
  atualizar();
  revalidatePath(`/app/processos/${processoId}`);
  return { ok: true };
}
