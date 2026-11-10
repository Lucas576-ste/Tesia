import { NextResponse, type NextRequest } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function GET(request: NextRequest) {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.redirect(new URL("/login?erro=sessao", request.url));
}
