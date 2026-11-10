import { NextResponse, type NextRequest } from "next/server";
import { destinoSeguro } from "@/lib/autenticacao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function GET(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get("code");
  const proximo = destinoSeguro(request.nextUrl.searchParams.get("proximo"));

  if (codigo) {
    const supabase = await criarClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) return NextResponse.redirect(new URL(proximo, request.url));
  }

  return NextResponse.redirect(new URL("/login?erro=link", request.url));
}
