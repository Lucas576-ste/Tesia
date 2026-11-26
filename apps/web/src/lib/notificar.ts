type NovaNotificacao = {
  escritorioId: string;
  usuarioId: string;
  tipo: string;
  titulo: string;
  texto?: string;
  href?: string;
};

export async function criarNotificacao(dados: NovaNotificacao) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const segredo = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !segredo) return;
  try {
    await fetch(`${url}/rest/v1/notificacoes`, {
      method: "POST",
      headers: {
        apikey: segredo,
        Authorization: `Bearer ${segredo}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        escritorio_id: dados.escritorioId,
        usuario_id: dados.usuarioId,
        tipo: dados.tipo,
        titulo: dados.titulo,
        texto: dados.texto ?? null,
        href: dados.href ?? null,
      }),
      cache: "no-store",
    });
  } catch {
    return;
  }
}
