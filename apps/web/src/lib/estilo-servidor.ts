import { idAprendizado, perfilGravadoSchema } from "@tesia/shared";
import { z } from "zod";
import type { EstadoPerfil, PerfilPronto } from "@/lib/perfil-estilo";
import { STATUS_PECA_ESTILO, type PecaEstilo } from "@/lib/estilo";
import { isoParaData } from "@/lib/prazo-interno";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const linhaSchema = z.object({
  id: z.uuid(),
  nome_arquivo: z.string(),
  criado_em: z.string(),
  status: z.enum(STATUS_PECA_ESTILO),
  tipos_peca: z.object({ nome: z.string() }).nullable(),
  estilo_trechos: z.array(z.object({ count: z.number() })),
});

function dataEmBrasilia(iso: string) {
  return isoParaData(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(iso)),
  );
}

export function paraPecaEstilo(linha: z.infer<typeof linhaSchema>): PecaEstilo {
  return {
    id: linha.id,
    nome: linha.nome_arquivo || "Peça sem nome",
    data: dataEmBrasilia(linha.criado_em),
    criadaEm: linha.criado_em,
    tipo: linha.tipos_peca?.nome ?? null,
    status: linha.status,
    trechos: linha.estilo_trechos[0]?.count ?? 0,
  };
}

export const SELECAO_PECA_ESTILO =
  "id, nome_arquivo, criado_em, status, tipos_peca(nome), estilo_trechos(count)";

export async function listarPecasEstilo(usuarioId: string, ids?: string[]): Promise<PecaEstilo[]> {
  const supabase = await criarClienteServidor();
  let consulta = supabase
    .from("estilo_documentos")
    .select(SELECAO_PECA_ESTILO)
    .eq("usuario_id", usuarioId)
    .order("criado_em");
  if (ids) consulta = consulta.in("id", ids);
  const { data } = await consulta;
  const linhas = z.array(linhaSchema).safeParse(data);
  return linhas.success ? linhas.data.map(paraPecaEstilo) : [];
}

const perfilSchema = z.object({
  guia: z.unknown(),
  resumo_exibicao: z.array(z.string()),
  atualizado_com: z.number().int(),
  pedido_em: z.string().nullable(),
  gerado_em: z.string().nullable(),
});

const avaliacaoSchema = z.array(
  z.object({
    item_id: z.string(),
    avaliacao: z.enum(["certo", "errado"]),
    correcao: z.string().nullable(),
  }),
);

export async function buscarPerfilEstilo(usuarioId: string): Promise<EstadoPerfil> {
  const supabase = await criarClienteServidor();
  const [{ data }, { data: correcoes }] = await Promise.all([
    supabase
      .from("perfis_estilo")
      .select("guia, resumo_exibicao, atualizado_com, pedido_em, gerado_em")
      .eq("usuario_id", usuarioId)
      .maybeSingle(),
    supabase
      .from("estilo_correcoes")
      .select("item_id, avaliacao, correcao")
      .eq("usuario_id", usuarioId),
  ]);
  const linha = perfilSchema.safeParse(data);
  if (!linha.success) return { estado: "vazio" };

  const avaliacoes = new Map(
    (avaliacaoSchema.safeParse(correcoes).data ?? []).map((item) => [item.item_id, item]),
  );
  const { guia, resumo_exibicao, atualizado_com, pedido_em, gerado_em } = linha.data;
  const detalhes = perfilGravadoSchema.safeParse(guia).data ?? null;
  const pronto: PerfilPronto | null =
    resumo_exibicao.length > 0
      ? {
          estado: "pronto",
          frases: resumo_exibicao,
          pecas: atualizado_com,
          atualizadoEm: gerado_em,
          detalhes,
          aprendizados: (detalhes?.aprendizados ?? []).map(({ parte, itens }) => ({
            parte,
            itens: itens.map((texto) => {
              const id = idAprendizado(parte, texto);
              const avaliacao = avaliacoes.get(id);
              return {
                id,
                texto,
                avaliacao: avaliacao?.avaliacao ?? null,
                correcao: avaliacao?.correcao ?? null,
              };
            }),
          })),
        }
      : null;
  const atualizando = Boolean(pedido_em && (!gerado_em || pedido_em > gerado_em));
  if (atualizando) return { estado: "atualizando", anterior: pronto };
  return pronto ?? { estado: "vazio" };
}

export async function contarNovidadesEstilo(usuarioId: string, desde: string | null) {
  const supabase = await criarClienteServidor();
  let pecas = supabase
    .from("estilo_documentos")
    .select("id", { count: "exact", head: true })
    .eq("usuario_id", usuarioId)
    .eq("status", "lido");
  let correcoes = supabase
    .from("estilo_correcoes")
    .select("id", { count: "exact", head: true })
    .eq("usuario_id", usuarioId)
    .eq("avaliacao", "errado");
  if (desde) {
    pecas = pecas.gt("criado_em", desde);
    correcoes = correcoes.gt("criado_em", desde);
  }
  const [{ count: novasPecas }, { count: novasCorrecoes }] = await Promise.all([pecas, correcoes]);
  return { pecas: novasPecas ?? 0, correcoes: novasCorrecoes ?? 0 };
}

export async function buscarAprenderRevisoes(usuarioId: string) {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("usuarios")
    .select("estilo_aprender_revisoes")
    .eq("id", usuarioId)
    .maybeSingle();
  return (
    z.object({ estilo_aprender_revisoes: z.boolean() }).safeParse(data).data
      ?.estilo_aprender_revisoes ?? true
  );
}

export type EstadoExemplo = {
  texto: string | null;
  geradoEm: string | null;
  gerando: boolean;
  erro: boolean;
  expressoes: string[];
};

export const SEM_EXEMPLO: EstadoExemplo = {
  texto: null,
  geradoEm: null,
  gerando: false,
  erro: false,
  expressoes: [],
};

const exemploSchema = z.object({
  guia: z.unknown(),
  exemplo: z.string().nullable(),
  exemplo_pedido_em: z.string().nullable(),
  exemplo_gerado_em: z.string().nullable(),
  exemplo_erro: z.boolean(),
});

export async function buscarExemplo(usuarioId: string): Promise<EstadoExemplo> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("perfis_estilo")
    .select("guia, exemplo, exemplo_pedido_em, exemplo_gerado_em, exemplo_erro")
    .eq("usuario_id", usuarioId)
    .maybeSingle();
  const linha = exemploSchema.safeParse(data);
  if (!linha.success) return SEM_EXEMPLO;
  const { guia, exemplo, exemplo_pedido_em, exemplo_gerado_em, exemplo_erro } = linha.data;
  return {
    texto: exemplo,
    geradoEm: exemplo_gerado_em,
    gerando: Boolean(
      exemplo_pedido_em && (!exemplo_gerado_em || exemplo_pedido_em > exemplo_gerado_em),
    ),
    erro: exemplo_erro,
    expressoes: perfilGravadoSchema.safeParse(guia).data?.expressoes_tipicas ?? [],
  };
}
