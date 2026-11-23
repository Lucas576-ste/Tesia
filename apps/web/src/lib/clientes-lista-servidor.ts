import { normalizarNome, somenteDigitos } from "@tesia/shared";
import { z } from "zod";
import {
  linhaListaSchema,
  linhaSemTotalSchema,
  TAMANHO_PAGINA,
  type FiltrosLista,
  type PaginaClientes,
} from "@/lib/clientes-lista";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function listarClientesPaginado(filtros: FiltrosLista): Promise<PaginaClientes> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.rpc("listar_clientes", {
    p_busca: filtros.busca,
    p_nome_normalizado: normalizarNome(filtros.busca),
    p_digitos: somenteDigitos(filtros.busca),
    p_papel: filtros.papel,
    p_origem: filtros.origem,
    p_excluidos: filtros.excluidos,
    p_ordem: filtros.ordem,
    p_direcao: filtros.direcao,
    p_pagina: filtros.pagina,
    p_tamanho: TAMANHO_PAGINA,
    p_com_processo: filtros.processo,
    p_uf: filtros.uf,
    p_cidade: filtros.cidade,
    p_cadastro_de: filtros.de,
    p_cadastro_ate: filtros.ate,
    p_aniversario: filtros.aniversario,
  });
  const lidas = z.array(linhaListaSchema).safeParse(data).data ?? [];
  const total = lidas[0]?.total ?? 0;
  return {
    linhas: lidas.map((linha) => linhaSemTotalSchema.parse(linha)),
    total,
    pagina: filtros.pagina,
    paginas: Math.max(1, Math.ceil(total / TAMANHO_PAGINA)),
  };
}
