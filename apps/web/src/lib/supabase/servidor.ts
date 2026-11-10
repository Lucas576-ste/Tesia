import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ambienteSupabase } from "./ambiente";

export async function criarClienteServidor() {
  const { url, chave } = ambienteSupabase();
  const cookieStore = await cookies();

  return createServerClient(url, chave, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesParaGravar) {
        try {
          cookiesParaGravar.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          return;
        }
      },
    },
  });
}
