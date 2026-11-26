import { analiseGravadaSchema, formatarCnj, nomePartes, normalizarCnj } from "@tesia/shared";
import { z } from "zod";
import { UFS } from "@/lib/lead";
import { isoParaData } from "@/lib/prazo-interno";
import type { SituacaoIntimacao } from "@/lib/situacao-intimacao";

export const TAMANHO_PAGINA_INTIMACOES = 25;
export const LIMITE_EXPORTACAO = 5000;

export const filtrosIntimacoesSchema = z.object({
  busca: z.string().trim().max(100).catch(""),
  uf: z.enum(UFS).optional().catch(undefined),
  de: z.iso.date().optional().catch(undefined),
  ate: z.iso.date().optional().catch(undefined),
  tipo: z.string().trim().min(1).max(80).optional().catch(undefined),
  termo: z.uuid().optional().catch(undefined),
  status: z.enum(["pendente", "concluida", "ignorada"]).optional().catch(undefined),
  aguardando: z
    .union([z.literal("1"), z.undefined()])
    .transform((valor) => valor === "1")
    .catch(false),
  pagina: z.coerce.number().int().min(1).max(10000).catch(1),
});

export type FiltrosIntimacoes = z.infer<typeof filtrosIntimacoesSchema>;

export const SEM_FILTROS: Pick<
  FiltrosIntimacoes,
  "busca" | "uf" | "de" | "ate" | "tipo" | "termo" | "status" | "aguardando" | "pagina"
> = {
  busca: "",
  uf: undefined,
  de: undefined,
  ate: undefined,
  tipo: undefined,
  termo: undefined,
  status: undefined,
  aguardando: false,
  pagina: 1,
};

export function parametrosDosFiltros(filtros: FiltrosIntimacoes) {
  const busca = new URLSearchParams();
  if (filtros.busca) busca.set("busca", filtros.busca);
  if (filtros.uf) busca.set("uf", filtros.uf);
  if (filtros.de) busca.set("de", filtros.de);
  if (filtros.ate) busca.set("ate", filtros.ate);
  if (filtros.tipo) busca.set("tipo", filtros.tipo);
  if (filtros.termo) busca.set("termo", filtros.termo);
  if (filtros.status) busca.set("status", filtros.status);
  if (filtros.aguardando) busca.set("aguardando", "1");
  if (filtros.pagina > 1) busca.set("pagina", String(filtros.pagina));
  return busca;
}

export function urlDasIntimacoes(
  filtros: FiltrosIntimacoes,
  mudar: Partial<FiltrosIntimacoes> = {},
) {
  const texto = parametrosDosFiltros({ ...filtros, ...mudar }).toString();
  return texto ? `/app/intimacoes?${texto}` : "/app/intimacoes";
}

export function filtrosIntimacoesDaUrl(parametros: Record<string, string | string[] | undefined>) {
  const texto = (chave: string) => {
    const valor = parametros[chave];
    return typeof valor === "string" ? valor : undefined;
  };
  const antigo = texto("filtro") === "aguardando" ? "1" : undefined;
  return filtrosIntimacoesSchema.parse({
    busca: texto("busca") ?? "",
    uf: texto("uf"),
    de: texto("de"),
    ate: texto("ate"),
    tipo: texto("tipo"),
    termo: texto("termo"),
    status: texto("status"),
    aguardando: texto("aguardando") ?? antigo,
    pagina: texto("pagina"),
  });
}

export function contarFiltrosAtivos(filtros: FiltrosIntimacoes) {
  return [filtros.uf, filtros.de, filtros.ate, filtros.tipo, filtros.termo, filtros.status].filter(
    Boolean,
  ).length;
}

export const linhaRpcSchema = z.object({
  id: z.uuid(),
  status: z.enum(["recebida", "processando", "analisada", "erro"]),
  origem: z.string(),
  criado_em: z.string(),
  publicada_em: z.string().nullable(),
  tratamento: z.enum(["pendente", "concluida", "ignorada"]),
  concluida_em: z.string().nullable(),
  numero_processo: z.string().nullable(),
  processo_id: z.uuid().nullable(),
  tribunal: z.string().nullable(),
  uf: z.string().nullable(),
  tipo_publicacao: z.string().nullable(),
  termo_id: z.uuid().nullable(),
  termo_nome: z.string().nullable(),
  responsavel_id: z.uuid().nullable(),
  responsavel_nome: z.string().nullable(),
  dados: z.unknown(),
  pecas: z.unknown(),
  prazo_confirmado: z.boolean(),
  total: z.coerce.number(),
});

export type LinhaRpc = z.infer<typeof linhaRpcSchema>;

export type LinhaIntimacao = {
  id: string;
  partes: string;
  cnj: string | null;
  peca: string | null;
  tribunal: string | null;
  uf: string | null;
  tipo: string | null;
  termo: string | null;
  responsavelId: string | null;
  responsavelNome: string | null;
  processoId: string | null;
  data: string;
  situacao: SituacaoIntimacao;
  tratamento: "pendente" | "concluida" | "ignorada";
  djen: boolean;
};

export type PaginaIntimacoes = {
  linhas: LinhaIntimacao[];
  total: number;
  pagina: number;
  paginas: number;
};

const dadosSchema = analiseGravadaSchema.shape.dados;
const pecasSchema = analiseGravadaSchema.shape.pecas;

function situacaoDaLinha(linha: LinhaRpc): SituacaoIntimacao {
  if (linha.status === "recebida") return "fila";
  if (linha.status === "processando") return "lendo";
  if (linha.status === "erro") return "erro";
  if (linha.tratamento === "ignorada") return "ignorada";
  if (linha.tratamento === "concluida") return "concluida";
  return linha.prazo_confirmado ? "confirmado" : "aguardando";
}

function dataLocal(iso: string) {
  return isoParaData(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(iso)),
  );
}

export function linhaDaIntimacao(linha: LinhaRpc): LinhaIntimacao {
  const dados = dadosSchema.safeParse(linha.dados);
  const pecas = pecasSchema.safeParse(linha.pecas);
  const digitos = normalizarCnj(linha.numero_processo ?? dados.data?.numero_processo);
  return {
    id: linha.id,
    partes: dados.success ? nomePartes(dados.data.partes) : "Ainda não identificadas",
    cnj: digitos ? formatarCnj(digitos) : (dados.data?.numero_processo ?? null),
    peca: pecas.data?.find((peca) => peca.recomendada)?.nome ?? null,
    tribunal: linha.tribunal,
    uf: linha.uf,
    tipo: linha.tipo_publicacao,
    termo: linha.termo_nome,
    responsavelId: linha.responsavel_id,
    responsavelNome: linha.responsavel_nome,
    processoId: linha.processo_id,
    data: linha.publicada_em ? isoParaData(linha.publicada_em) : dataLocal(linha.criado_em),
    situacao: situacaoDaLinha(linha),
    tratamento: linha.tratamento,
    djen: linha.origem === "djen",
  };
}
