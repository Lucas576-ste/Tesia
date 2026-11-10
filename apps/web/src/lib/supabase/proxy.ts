import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ambienteSupabase } from "./ambiente";

export async function atualizarSessao(request: NextRequest) {
  const { url, chave } = ambienteSupabase();
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(url, chave, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesParaGravar, cabecalhos) {
        cookiesParaGravar.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        cookiesParaGravar.forEach(({ name, value, options }) =>
          resposta.cookies.set(name, value, options),
        );
        Object.entries(cabecalhos).forEach(([nome, valor]) => resposta.headers.set(nome, valor));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  return { resposta, logado: Boolean(data?.claims) };
}

const CABECALHOS_CACHE = ["cache-control", "expires", "pragma"];

export function redirecionarComSessao(destino: URL, resposta: NextResponse) {
  const redirecionamento = NextResponse.redirect(destino);
  resposta.cookies.getAll().forEach((cookie) => redirecionamento.cookies.set(cookie));
  CABECALHOS_CACHE.forEach((nome) => {
    const valor = resposta.headers.get(nome);
    if (valor) redirecionamento.headers.set(nome, valor);
  });
  return redirecionamento;
}
