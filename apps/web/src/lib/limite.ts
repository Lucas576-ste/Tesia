import { headers } from "next/headers";
import { z } from "zod";

export const MENSAGEM_LIMITE = "Muitas tentativas. Espere alguns minutos e tente de novo.";

export async function ipDaRequisicao() {
  const cabecalhos = await headers();
  const encaminhado = cabecalhos.get("x-forwarded-for")?.split(",")[0]?.trim();
  return encaminhado || cabecalhos.get("x-real-ip") || "desconhecido";
}

export async function limitar(chave: string, maximo: number, segundos: number) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const segredo = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !segredo) return true;
  try {
    const resposta = await fetch(`${url}/rest/v1/rpc/consumir_limite`, {
      method: "POST",
      headers: {
        apikey: segredo,
        Authorization: `Bearer ${segredo}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_chave: chave, p_maximo: maximo, p_segundos: segundos }),
      cache: "no-store",
    });
    if (!resposta.ok) return true;
    return z
      .boolean()
      .catch(true)
      .parse(await resposta.json());
  } catch {
    return true;
  }
}

export async function limitarAutenticacao(email: string) {
  const ip = await ipDaRequisicao();
  const [porIp, porEmail] = await Promise.all([
    limitar(`auth:ip:${ip}`, 10, 600),
    limitar(`auth:email:${email.trim().toLowerCase()}`, 10, 600),
  ]);
  return porIp && porEmail;
}
