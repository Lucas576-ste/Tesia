import { z } from "zod";
import { registrarAuditoria } from "@/lib/auditoria";
import { planoTemBusca, type OabDaBusca } from "@/lib/busca-oab";
import type { UsuarioSessao } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type ResultadoBusca = { ok: true } | { erro: string };

const assinaturaSchema = z.object({
  status: z.string(),
  plano_codigo: z.string().nullable(),
});

export async function contaTemBusca() {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("assinaturas").select("status, plano_codigo").maybeSingle();
  const linha = assinaturaSchema.safeParse(data).data;
  return planoTemBusca(linha?.status ?? null, linha?.plano_codigo ?? null);
}

export async function ativarBuscaDaOab(
  usuario: UsuarioSessao,
  oab: OabDaBusca,
): Promise<ResultadoBusca> {
  const supabase = await criarClienteServidor();
  const { data: gravado, error: erroAceite } = await supabase
    .from("usuarios")
    .update({ busca_oab_aceita_em: new Date().toISOString() })
    .eq("id", usuario.id)
    .is("busca_oab_aceita_em", null)
    .select("id");
  if (erroAceite) return { erro: "Não foi possível ativar a busca agora." };
  const novoAceite = Boolean(gravado?.length);

  const { data, error } = await supabase
    .from("termos_monitorados")
    .insert({
      escritorio_id: usuario.escritorio_id,
      responsavel_id: usuario.id,
      tipo: "advogado",
      oab_numero: oab.numero,
      oab_uf: oab.uf,
      ufs: [],
      status: "sincronizando",
    })
    .select("id")
    .single();
  const jaExistia = error?.code === "23505";
  const linha = z.object({ id: z.uuid() }).safeParse(data);
  if (!jaExistia && (error || !linha.success)) {
    if (novoAceite) {
      await supabase.from("usuarios").update({ busca_oab_aceita_em: null }).eq("id", usuario.id);
    }
    return { erro: "Não foi possível ativar a busca agora." };
  }
  if (novoAceite) {
    await registrarAuditoria(
      usuario,
      "busca_oab_aceita",
      "termos_monitorados",
      linha.success ? linha.data.id : undefined,
    );
  }
  return { ok: true };
}

export async function encerrarBuscaDaOab(
  usuario: UsuarioSessao,
  oab: OabDaBusca | null,
): Promise<ResultadoBusca> {
  const supabase = await criarClienteServidor();
  const { error: erroDoResponsavel } = await supabase
    .from("termos_monitorados")
    .delete()
    .eq("tipo", "advogado")
    .eq("responsavel_id", usuario.id);
  if (erroDoResponsavel) return { erro: "Não foi possível parar a busca agora." };
  if (oab) {
    const { error } = await supabase
      .from("termos_monitorados")
      .delete()
      .eq("tipo", "advogado")
      .eq("oab_numero", oab.numero)
      .eq("oab_uf", oab.uf);
    if (error) return { erro: "Não foi possível parar a busca agora." };
  }
  const { error } = await supabase
    .from("usuarios")
    .update({ busca_oab_aceita_em: null })
    .eq("id", usuario.id);
  if (error) return { erro: "Não foi possível parar a busca agora." };
  await registrarAuditoria(usuario, "busca_oab_encerrada", "usuarios", usuario.id);
  return { ok: true };
}
