"use server";

import { podeGerenciarTermos, somenteDigitos } from "@tesia/shared";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { registrarAuditoria } from "@/lib/auditoria";
import { usuarioAtual, type UsuarioSessao } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { termoEntradaSchema, type TermoEntrada } from "@/lib/termos";

type Resultado = { ok: true } | { erro: string };

const SEM_PERMISSAO = "Só o dono e os advogados do escritório gerenciam os termos.";

async function autorizado(): Promise<UsuarioSessao | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  if (!podeGerenciarTermos(usuario.papel)) return { erro: SEM_PERMISSAO };
  return usuario;
}

function aposMudar() {
  revalidatePath("/app/configuracoes");
}

export async function criarTermo(entrada: TermoEntrada): Promise<Resultado> {
  const usuario = await autorizado();
  if ("erro" in usuario) return usuario;
  const dados = termoEntradaSchema.safeParse(entrada);
  if (!dados.success) return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  const { tipo, oabNumero, oabUf, documento, nome, ufs, responsavelId } = dados.data;

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("termos_monitorados")
    .insert({
      escritorio_id: usuario.escritorio_id,
      responsavel_id: responsavelId,
      tipo,
      oab_numero: tipo === "advogado" ? somenteDigitos(oabNumero ?? "").replace(/^0+/, "") : null,
      oab_uf: tipo === "advogado" ? oabUf : null,
      documento: tipo === "advogado" ? null : somenteDigitos(documento ?? ""),
      nome: nome || null,
      ufs,
      status: "sincronizando",
    })
    .select("id")
    .single();
  if (error?.code === "23505") return { erro: "Este termo já está cadastrado." };
  const linha = z.object({ id: z.uuid() }).safeParse(data);
  if (error || !linha.success) return { erro: "Não foi possível cadastrar o termo." };
  await registrarAuditoria(usuario, "termo_criado", "termos_monitorados", linha.data.id);
  aposMudar();
  return { ok: true };
}

const alteracaoSchema = z.object({
  id: z.uuid(),
  nome: z.string().trim().max(120).nullable(),
  ufs: termoEntradaSchema.shape.ufs,
  responsavelId: z.uuid(),
});

export async function alterarTermo(entrada: z.input<typeof alteracaoSchema>): Promise<Resultado> {
  const usuario = await autorizado();
  if ("erro" in usuario) return usuario;
  const dados = alteracaoSchema.safeParse(entrada);
  if (!dados.success) return { erro: "Dados inválidos." };
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("termos_monitorados")
    .update({
      nome: dados.data.nome,
      ufs: dados.data.ufs,
      responsavel_id: dados.data.responsavelId,
    })
    .eq("id", dados.data.id)
    .select("id");
  if (error || !data?.length) return { erro: "Não foi possível salvar o termo." };
  await registrarAuditoria(usuario, "termo_alterado", "termos_monitorados", dados.data.id);
  aposMudar();
  return { ok: true };
}

export async function mudarSituacaoTermo(
  id: string,
  acao: "pausar" | "retomar" | "sincronizar",
): Promise<Resultado> {
  const usuario = await autorizado();
  if ("erro" in usuario) return usuario;
  if (!z.uuid().safeParse(id).success) return { erro: "Pedido inválido." };
  const supabase = await criarClienteServidor();
  const alteracao =
    acao === "pausar"
      ? { status: "inativo" as const }
      : { status: "sincronizando" as const, buscado_ate: null };
  const { data, error } = await supabase
    .from("termos_monitorados")
    .update(alteracao)
    .eq("id", id)
    .select("id");
  if (error || !data?.length) return { erro: "Não foi possível atualizar o termo." };
  await registrarAuditoria(usuario, `termo_${acao}`, "termos_monitorados", id);
  aposMudar();
  return { ok: true };
}

export async function excluirTermo(id: string): Promise<Resultado> {
  const usuario = await autorizado();
  if ("erro" in usuario) return usuario;
  if (!z.uuid().safeParse(id).success) return { erro: "Pedido inválido." };
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("termos_monitorados")
    .delete()
    .eq("id", id)
    .select("id");
  if (error || !data?.length) return { erro: "Não foi possível excluir o termo." };
  await registrarAuditoria(usuario, "termo_excluido", "termos_monitorados", id);
  aposMudar();
  return { ok: true };
}
