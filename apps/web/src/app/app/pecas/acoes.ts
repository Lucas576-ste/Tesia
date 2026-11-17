"use server";

import type { JSONContent } from "@tiptap/core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  documentoDoConteudo,
  documentoSchema,
  pendenciasDoDocumento,
  TAMANHO_MAXIMO_DOCUMENTO,
} from "@/lib/documento-peca";
import { usuarioAtual } from "@/lib/sessao";
import { buscarUsoPecas } from "@/lib/uso-pecas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

type Resultado<T> = ({ ok: true } & T) | { erro: string };

const pecaSchema = z.object({ status: z.string(), prazo_id: z.uuid().nullable() });

async function pecaDoUsuario(id: string) {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(id).success) return null;
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("pecas")
    .select("status, prazo_id")
    .eq("id", id)
    .maybeSingle();
  const peca = pecaSchema.safeParse(data);
  return peca.success ? { supabase, peca: peca.data } : null;
}

export async function salvarVersao(
  id: string,
  documento: JSONContent,
): Promise<Resultado<{ versao: number }>> {
  const contexto = await pecaDoUsuario(id);
  if (!contexto) return { erro: "Peça não encontrada." };
  if (contexto.peca.status !== "rascunho") return { erro: "Reabra a peça para editar." };
  const doc = documentoSchema.safeParse(documento);
  if (!doc.success || JSON.stringify(documento).length > TAMANHO_MAXIMO_DOCUMENTO) {
    return { erro: "O texto da peça é inválido ou grande demais." };
  }

  const { supabase } = contexto;
  const { data: ultimas } = await supabase
    .from("pecas_versoes")
    .select("versao")
    .eq("peca_id", id)
    .order("versao", { ascending: false })
    .limit(1);
  const atual =
    z.array(z.object({ versao: z.number().int() })).safeParse(ultimas).data?.[0]?.versao ?? 0;
  const versao = atual + 1;

  const { data: dono } = await supabase.from("pecas").select("escritorio_id").eq("id", id).single();
  const escritorio = z.object({ escritorio_id: z.uuid() }).safeParse(dono);
  if (!escritorio.success) return { erro: "Peça não encontrada." };

  const { error: erroVersao } = await supabase.from("pecas_versoes").insert({
    escritorio_id: escritorio.data.escritorio_id,
    peca_id: id,
    versao,
    conteudo: { doc: documento },
    origem: "usuario",
  });
  if (erroVersao) return { erro: "Não foi possível salvar a versão. Tente de novo." };

  const { error } = await supabase
    .from("pecas")
    .update({
      conteudo: { doc: documento, aviso: null },
      versao,
      pendencias: pendenciasDoDocumento(documento),
    })
    .eq("id", id);
  if (error) return { erro: "Não foi possível salvar a peça." };
  revalidatePath(`/app/pecas/${id}`);
  return { ok: true, versao };
}

export async function buscarVersao(
  id: string,
  numero: number,
): Promise<Resultado<{ documento: JSONContent }>> {
  const contexto = await pecaDoUsuario(id);
  if (!contexto || !Number.isInteger(numero) || numero < 1)
    return { erro: "Versão não encontrada." };
  const { data } = await contexto.supabase
    .from("pecas_versoes")
    .select("conteudo")
    .eq("peca_id", id)
    .eq("versao", numero)
    .maybeSingle();
  const linha = z.object({ conteudo: z.unknown() }).safeParse(data);
  if (!linha.success) return { erro: "Versão não encontrada." };
  return { ok: true, documento: documentoDoConteudo(linha.data.conteudo) };
}

export async function marcarProtocolada(
  id: string,
  protocolada: boolean,
): Promise<Resultado<object>> {
  const contexto = await pecaDoUsuario(id);
  if (!contexto) return { erro: "Peça não encontrada." };
  const { supabase, peca } = contexto;
  const { error } = await supabase
    .from("pecas")
    .update({ status: protocolada ? "protocolada" : "rascunho" })
    .eq("id", id);
  if (error) return { erro: "Não foi possível atualizar a peça." };
  if (peca.prazo_id) {
    await supabase
      .from("prazos")
      .update({ status: protocolada ? "cumprido" : "confirmado" })
      .eq("id", peca.prazo_id)
      .in("status", ["confirmado", "cumprido"]);
  }
  revalidatePath("/app");
  revalidatePath(`/app/pecas/${id}`);
  return { ok: true };
}

const AJUSTES_SEM_CUSTO = 3;

const ajusteSchema = z.object({
  status: z.string(),
  ajuste_status: z.string().nullable(),
  ajustes_usados: z.number().int(),
});

const assinaturaSchema = z.object({
  status: z.string(),
  planos: z
    .union([z.object({ recursos: z.unknown() }), z.array(z.object({ recursos: z.unknown() }))])
    .nullable()
    .transform((valor) => (Array.isArray(valor) ? (valor[0] ?? null) : valor)),
});

export async function pedirAjuste(
  id: string,
  pedido: string,
): Promise<Resultado<object> | { limite: true }> {
  const usuario = await usuarioAtual();
  const texto = pedido.trim();
  if (!usuario || !z.uuid().safeParse(id).success) return { erro: "Peça não encontrada." };
  if (texto.length < 5) return { erro: "Descreva o ajuste em pelo menos algumas palavras." };
  if (texto.length > 500) return { erro: "O pedido pode ter no máximo 500 caracteres." };

  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("pecas")
    .select("status, ajuste_status, ajustes_usados")
    .eq("id", id)
    .maybeSingle();
  const peca = ajusteSchema.safeParse(data);
  if (!peca.success) return { erro: "Peça não encontrada." };
  if (peca.data.status !== "rascunho") return { erro: "Reabra a peça para pedir ajustes." };
  if (peca.data.ajuste_status === "pendente" || peca.data.ajuste_status === "processando") {
    return { erro: "Já existe um ajuste em andamento nesta peça." };
  }

  const { data: linhaAssinatura } = await supabase
    .from("assinaturas")
    .select("status, planos(recursos)")
    .maybeSingle();
  const assinatura = assinaturaSchema.safeParse(linhaAssinatura).data;
  const recursos = z
    .object({ ajustes_ia: z.boolean().optional() })
    .safeParse(assinatura?.planos?.recursos).data;
  if (assinatura?.status !== "trial" && !recursos?.ajustes_ia) {
    return { erro: "Ajustes pela Lia fazem parte do plano Pro." };
  }

  if (peca.data.ajustes_usados >= AJUSTES_SEM_CUSTO) {
    const uso = await buscarUsoPecas();
    if (uso.usadas >= uso.limite) return { limite: true };
  }

  const { error } = await supabase
    .from("pecas")
    .update({ ajuste_pedido: texto, ajuste_status: "pendente", ajuste_erro: null })
    .eq("id", id);
  if (error) return { erro: "Não foi possível pedir o ajuste agora." };
  revalidatePath(`/app/pecas/${id}`);
  return { ok: true };
}
