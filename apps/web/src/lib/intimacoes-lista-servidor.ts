import { podeGerenciarTermos, somenteDigitos } from "@tesia/shared";
import { z } from "zod";
import {
  linhaDaIntimacao,
  linhaRpcSchema,
  TAMANHO_PAGINA_INTIMACOES,
  type FiltrosIntimacoes,
  type PaginaIntimacoes,
} from "@/lib/intimacoes-lista";
import { lerOabDaBusca } from "@/lib/busca-oab";
import { contaTemBusca } from "@/lib/busca-oab-servidor";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

function parametrosDaConsulta(filtros: FiltrosIntimacoes, tamanho: number, pagina: number) {
  const digitos = somenteDigitos(filtros.busca);
  return {
    p_busca: filtros.busca,
    p_digitos: digitos.length >= 7 ? digitos : "",
    p_uf: filtros.uf ?? null,
    p_de: filtros.de ?? null,
    p_ate: filtros.ate ?? null,
    p_tipo: filtros.tipo ?? null,
    p_termo: filtros.termo ?? null,
    p_tratamento: filtros.status ?? null,
    p_aguardando: filtros.aguardando,
    p_pagina: pagina,
    p_tamanho: tamanho,
  };
}

export async function listarIntimacoesPagina(
  filtros: FiltrosIntimacoes,
): Promise<PaginaIntimacoes> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.rpc(
    "listar_intimacoes",
    parametrosDaConsulta(filtros, TAMANHO_PAGINA_INTIMACOES, filtros.pagina),
  );
  const lidas = z.array(linhaRpcSchema).safeParse(data).data ?? [];
  const total = lidas[0]?.total ?? 0;
  return {
    linhas: lidas.map(linhaDaIntimacao),
    total,
    pagina: filtros.pagina,
    paginas: Math.max(1, Math.ceil(total / TAMANHO_PAGINA_INTIMACOES)),
  };
}

export async function listarIntimacoesParaExportar(filtros: FiltrosIntimacoes, limite: number) {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.rpc("listar_intimacoes", {
    ...parametrosDaConsulta(filtros, limite, 1),
    p_aguardando: filtros.aguardando,
  });
  const lidas = z.array(linhaRpcSchema).safeParse(data).data ?? [];
  return { linhas: lidas.map(linhaDaIntimacao), total: lidas[0]?.total ?? 0 };
}

const opcoesSchema = z.array(
  z.object({ uf: z.string().nullable(), tipo_publicacao: z.string().nullable() }),
);
const termoSchema = z.array(
  z.object({
    id: z.uuid(),
    nome: z.string().nullable(),
    oab_numero: z.string().nullable(),
    oab_uf: z.string().nullable(),
  }),
);

export async function opcoesDeFiltro() {
  const supabase = await criarClienteServidor();
  const [{ data: publicacoes }, { data: termos }] = await Promise.all([
    supabase.from("intimacoes").select("uf, tipo_publicacao").is("excluido_em", null).limit(2000),
    supabase.from("termos_monitorados").select("id, nome, oab_numero, oab_uf").order("criado_em"),
  ]);
  const linhas = opcoesSchema.safeParse(publicacoes).data ?? [];
  const ordenar = (valores: (string | null)[]) =>
    [...new Set(valores.filter((valor): valor is string => Boolean(valor)))].sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    );
  return {
    ufs: ordenar(linhas.map(({ uf }) => uf)),
    tipos: ordenar(linhas.map(({ tipo_publicacao }) => tipo_publicacao)),
    termos: (termoSchema.safeParse(termos).data ?? []).map((termo) => ({
      id: termo.id,
      nome: termo.nome ?? `OAB ${termo.oab_numero}/${termo.oab_uf}`,
    })),
  };
}

const bannerSchema = z.array(
  z.object({
    status: z.string(),
    ultima_sincronizacao_em: z.string().nullable(),
    ultimo_erro: z.string().nullable(),
  }),
);

export type BannerSincronizacao = {
  aceitou: boolean;
  temOab: boolean;
  podeGerenciar: boolean;
  temPlano: boolean;
  comFalha: boolean;
  ultimaBusca: string | null;
};

export async function bannerSincronizacao(): Promise<BannerSincronizacao | null> {
  const usuario = await usuarioAtual();
  if (!usuario) return null;
  const oab = lerOabDaBusca(usuario.oab_numero, usuario.oab_uf);
  const base = {
    aceitou: Boolean(usuario.busca_oab_aceita_em),
    temOab: oab !== null,
    podeGerenciar: podeGerenciarTermos(usuario.papel),
    temPlano: await contaTemBusca(),
  };
  if (!oab || !base.aceitou) return { ...base, comFalha: false, ultimaBusca: null };
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("termos_monitorados")
    .select("status, ultima_sincronizacao_em, ultimo_erro")
    .eq("tipo", "advogado")
    .eq("oab_numero", oab.numero)
    .eq("oab_uf", oab.uf);
  const termos = bannerSchema.safeParse(data).data ?? [];
  const buscas = termos
    .map(({ ultima_sincronizacao_em }) => ultima_sincronizacao_em)
    .filter((valor): valor is string => Boolean(valor))
    .sort();
  return {
    ...base,
    comFalha: termos.some(
      ({ status, ultimo_erro }) => status === "falha_autenticacao" || Boolean(ultimo_erro),
    ),
    ultimaBusca: buscas.at(-1) ?? null,
  };
}
