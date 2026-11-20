import { montarPecaTeste } from "@tesia/documentos";
import { limitar, MENSAGEM_LIMITE } from "@/lib/limite";
import { BUCKET_MODELOS, TIPO_DOCX } from "@/lib/modelo-docx";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function GET() {
  const usuario = await usuarioAtual();
  if (!usuario) return new Response("Não autorizado", { status: 401 });
  if (!(await limitar(`docx:${usuario.id}`, 60, 3600))) {
    return new Response(MENSAGEM_LIMITE, { status: 429, headers: { "Retry-After": "3600" } });
  }

  let modelo: Uint8Array | null = null;
  if (usuario.modelo_docx_path) {
    const supabase = await criarClienteServidor();
    const { data } = await supabase.storage.from(BUCKET_MODELOS).download(usuario.modelo_docx_path);
    if (data) modelo = new Uint8Array(await data.arrayBuffer());
  }

  let arquivo: Uint8Array;
  try {
    arquivo = montarPecaTeste(modelo);
  } catch {
    arquivo = montarPecaTeste(null);
  }
  return new Response(Buffer.from(arquivo), {
    headers: {
      "Content-Type": TIPO_DOCX,
      "Content-Disposition": `attachment; filename="peca-de-teste.docx"`,
      "Cache-Control": "private, no-store",
    },
  });
}
