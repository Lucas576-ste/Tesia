import { ipDaRequisicao } from "@/lib/limite";
import type { UsuarioSessao } from "@/lib/sessao";

export async function registrarAuditoria(
  usuario: Pick<UsuarioSessao, "id" | "escritorio_id">,
  acao: string,
  entidade: string,
  entidadeId?: string,
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const segredo = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !segredo) return;
  const ip = await ipDaRequisicao();
  try {
    await fetch(`${url}/rest/v1/auditoria`, {
      method: "POST",
      headers: {
        apikey: segredo,
        Authorization: `Bearer ${segredo}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        escritorio_id: usuario.escritorio_id,
        usuario_id: usuario.id,
        acao,
        entidade,
        entidade_id: entidadeId ?? null,
        ip: /^[0-9a-f.:]+$/i.test(ip) ? ip : null,
      }),
      cache: "no-store",
    });
  } catch {
    return;
  }
}
