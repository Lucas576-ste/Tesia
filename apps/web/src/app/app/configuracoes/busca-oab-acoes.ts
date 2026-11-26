"use server";

import { podeGerenciarTermos } from "@tesia/shared";
import { revalidatePath } from "next/cache";
import { lerOabDaBusca, podeBuscarAgora } from "@/lib/busca-oab";
import {
  ativarBuscaDaOab,
  contaTemBusca,
  encerrarBuscaDaOab,
  type ResultadoBusca,
} from "@/lib/busca-oab-servidor";
import { usuarioAtual, type UsuarioSessao } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const SEM_PERMISSAO = "Só o dono e os advogados do escritório gerenciam a busca da OAB.";

async function autorizado(): Promise<UsuarioSessao | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  if (!podeGerenciarTermos(usuario.papel)) return { erro: SEM_PERMISSAO };
  return usuario;
}

function aposMudar() {
  revalidatePath("/app/configuracoes");
  revalidatePath("/app/intimacoes");
}

export async function aceitarBuscaDaOab(): Promise<ResultadoBusca> {
  const usuario = await autorizado();
  if ("erro" in usuario) return usuario;
  const oab = lerOabDaBusca(usuario.oab_numero, usuario.oab_uf);
  if (!oab) return { erro: "Informe a OAB e a UF no perfil para ativar a busca." };
  if (!(await contaTemBusca())) return { erro: "A busca automática é do plano Pro." };
  const resultado = await ativarBuscaDaOab(usuario, oab);
  if ("ok" in resultado) aposMudar();
  return resultado;
}

export async function pararBuscaDaOab(): Promise<ResultadoBusca> {
  const usuario = await autorizado();
  if ("erro" in usuario) return usuario;
  const resultado = await encerrarBuscaDaOab(
    usuario,
    lerOabDaBusca(usuario.oab_numero, usuario.oab_uf),
  );
  if ("ok" in resultado) aposMudar();
  return resultado;
}

export async function buscarAgora(): Promise<ResultadoBusca> {
  if (!podeBuscarAgora(process.env.NODE_ENV)) return { erro: "Disponível só em desenvolvimento." };
  const usuario = await autorizado();
  if ("erro" in usuario) return usuario;
  const oab = lerOabDaBusca(usuario.oab_numero, usuario.oab_uf);
  if (!oab) return { erro: "Informe a OAB e a UF no perfil." };
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("termos_monitorados")
    .update({ status: "sincronizando", buscado_ate: null })
    .eq("tipo", "advogado")
    .eq("oab_numero", oab.numero)
    .eq("oab_uf", oab.uf)
    .select("id");
  if (error || !data?.length) return { erro: "Não foi possível pedir a busca agora." };
  aposMudar();
  return { ok: true };
}
