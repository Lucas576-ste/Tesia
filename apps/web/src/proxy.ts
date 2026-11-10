import type { NextRequest } from "next/server";
import { atualizarSessao, redirecionarComSessao } from "@/lib/supabase/proxy";

const PROTEGIDAS = ["/app", "/onboarding"];
const SO_SEM_LOGIN = ["/login", "/cadastro"];

function dentroDe(caminho: string, base: string) {
  return caminho === base || caminho.startsWith(`${base}/`);
}

export async function proxy(request: NextRequest) {
  const { resposta, logado } = await atualizarSessao(request);
  const { pathname, search } = request.nextUrl;

  if (!logado && PROTEGIDAS.some((base) => dentroDe(pathname, base))) {
    const destino = new URL("/login", request.url);
    destino.searchParams.set("proximo", `${pathname}${search}`);
    return redirecionarComSessao(destino, resposta);
  }

  if (logado && SO_SEM_LOGIN.includes(pathname)) {
    return redirecionarComSessao(new URL("/app", request.url), resposta);
  }

  return resposta;
}

export const config = {
  matcher: ["/app/:path*", "/onboarding/:path*", "/login", "/cadastro", "/recuperar-senha/:path*"],
};
