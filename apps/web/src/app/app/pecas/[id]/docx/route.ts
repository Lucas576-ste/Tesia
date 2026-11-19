import { limitar, MENSAGEM_LIMITE } from "@/lib/limite";
import { montarDocx, nomeArquivoDocx } from "@tesia/documentos";
import type { NoDocumento } from "@tesia/shared";
import { BUCKET_MODELOS, TIPO_DOCX } from "@/lib/modelo-docx";
import { buscarPeca } from "@/lib/peca";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

function naoEncontrado() {
  return new Response("Peça não encontrada", { status: 404 });
}

export async function GET(_requisicao: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await usuarioAtual();
  if (!usuario) return naoEncontrado();
  if (!(await limitar(`docx:${usuario.id}`, 60, 3600))) {
    return new Response(MENSAGEM_LIMITE, { status: 429, headers: { "Retry-After": "3600" } });
  }
  const estado = await buscarPeca(id);
  if (estado?.status !== "pronta") return naoEncontrado();

  let modelo: Uint8Array | null = null;
  if (usuario.modelo_docx_path) {
    const supabase = await criarClienteServidor();
    const { data } = await supabase.storage.from(BUCKET_MODELOS).download(usuario.modelo_docx_path);
    if (data) modelo = new Uint8Array(await data.arrayBuffer());
  }

  let arquivo: Uint8Array;
  try {
    arquivo = montarDocx(modelo, estado.peca.documento as NoDocumento);
  } catch {
    arquivo = montarDocx(null, estado.peca.documento as NoDocumento);
  }
  const { tipo, partes } = estado.peca;
  const nome = nomeArquivoDocx(
    partes.includes(tipo) ? [partes.replace(/\s·\s/g, " - ")] : [tipo, partes],
  );
  return new Response(Buffer.from(arquivo), {
    headers: {
      "Content-Type": TIPO_DOCX,
      "Content-Disposition": `attachment; filename="peca.docx"; filename*=UTF-8''${encodeURIComponent(nome)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
