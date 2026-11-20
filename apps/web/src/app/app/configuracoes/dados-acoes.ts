"use server";

import { z } from "zod";
import { limitar, MENSAGEM_LIMITE } from "@/lib/limite";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const ROTULOS = { exportacao: "Exportação de dados", exclusao: "Exclusão de conta" } as const;

async function avisarSuporte(tipo: keyof typeof ROTULOS, email: string, usuarioId: string) {
  const chave = process.env.RESEND_API_KEY;
  const destino = process.env.NEXT_PUBLIC_CONTATO_EMAIL;
  if (!chave || !destino) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.ALERTA_REMETENTE ?? "Tesia <onboarding@resend.dev>",
        to: [destino],
        subject: `Pedido de ${ROTULOS[tipo].toLowerCase()}`,
        text: `${ROTULOS[tipo]} pedida por ${email} (usuário ${usuarioId}). Responder em até 15 dias, conforme a LGPD.`,
      }),
    });
  } catch {
    return;
  }
}

export async function pedirDados(tipo: string): Promise<{ ok: true } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  const resultado = z.enum(["exportacao", "exclusao"]).safeParse(tipo);
  if (!resultado.success) return { erro: "Pedido inválido." };
  if (!(await limitar(`pedido-dados:${usuario.id}`, 3, 3600))) return { erro: MENSAGEM_LIMITE };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("pedidos_dados").insert({
    escritorio_id: usuario.escritorio_id,
    usuario_id: usuario.id,
    tipo: resultado.data,
  });
  if (error) return { erro: "Não foi possível registrar o pedido agora. Tente de novo." };
  await avisarSuporte(resultado.data, usuario.email, usuario.id);
  return { ok: true };
}
