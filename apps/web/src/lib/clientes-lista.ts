import { CODIGOS_ORIGEM, CODIGOS_PAPEL } from "@tesia/shared";
import { z } from "zod";

export const TAMANHO_PAGINA = 20;

export const filtrosListaSchema = z.object({
  busca: z.string().trim().max(100).catch(""),
  papel: z.enum(CODIGOS_PAPEL).optional().catch(undefined),
  origem: z.enum(CODIGOS_ORIGEM).optional().catch(undefined),
  excluidos: z
    .union([z.literal("1"), z.undefined()])
    .transform((valor) => valor === "1")
    .catch(false),
  processo: z.enum(["com", "sem"]).optional().catch(undefined),
  uf: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/)
    .optional()
    .catch(undefined),
  cidade: z.string().trim().min(1).max(100).optional().catch(undefined),
  de: z.iso.date().optional().catch(undefined),
  ate: z.iso.date().optional().catch(undefined),
  aniversario: z.enum(["hoje", "mes"]).optional().catch(undefined),
  ordem: z.enum(["nome", "cidade", "cadastro"]).catch("nome"),
  direcao: z.enum(["asc", "desc"]).catch("asc"),
  pagina: z.coerce.number().int().min(1).max(10000).catch(1),
});

export type FiltrosLista = z.infer<typeof filtrosListaSchema>;

export const linhaListaSchema = z.object({
  id: z.uuid(),
  nome: z.string(),
  documento: z.string().nullable(),
  tipo_pessoa: z.enum(["pf", "pj"]).catch("pf"),
  papel: z.enum(CODIGOS_PAPEL).catch("cliente"),
  origem: z.enum(CODIGOS_ORIGEM).catch("outro"),
  email: z.string().nullable(),
  telefone: z.string().nullable(),
  cidade: z.string().nullable(),
  uf: z.string().nullable(),
  criado_em: z.string(),
  excluido_em: z.string().nullable(),
  processos: z.number(),
  aniversario_hoje: z.boolean().catch(false),
  total: z.coerce.number(),
});

export const linhaSemTotalSchema = linhaListaSchema.omit({ total: true });

export type LinhaCliente = z.infer<typeof linhaSemTotalSchema>;

export type PaginaClientes = {
  linhas: LinhaCliente[];
  total: number;
  pagina: number;
  paginas: number;
};

export const FILTROS_EXTRAS = ["processo", "uf", "cidade", "de", "ate", "aniversario"] as const;

export function contarFiltrosExtras(filtros: FiltrosLista) {
  return FILTROS_EXTRAS.filter((chave) => Boolean(filtros[chave])).length;
}

export const SEM_FILTROS_EXTRAS: Pick<FiltrosLista, (typeof FILTROS_EXTRAS)[number]> = {
  processo: undefined,
  uf: undefined,
  cidade: undefined,
  de: undefined,
  ate: undefined,
  aniversario: undefined,
};

export function urlDaLista(filtros: FiltrosLista, mudar: Partial<FiltrosLista> = {}) {
  const f = { ...filtros, ...mudar };
  const busca = new URLSearchParams();
  if (f.busca) busca.set("busca", f.busca);
  if (f.papel) busca.set("papel", f.papel);
  if (f.origem) busca.set("origem", f.origem);
  if (f.processo) busca.set("processo", f.processo);
  if (f.uf) busca.set("uf", f.uf);
  if (f.cidade) busca.set("cidade", f.cidade);
  if (f.de) busca.set("de", f.de);
  if (f.ate) busca.set("ate", f.ate);
  if (f.aniversario) busca.set("aniversario", f.aniversario);
  if (f.excluidos) busca.set("excluidos", "1");
  if (f.ordem !== "nome") busca.set("ordem", f.ordem);
  if (f.direcao !== "asc") busca.set("direcao", f.direcao);
  if (f.pagina > 1) busca.set("pagina", String(f.pagina));
  const texto = busca.toString();
  return texto ? `/app/clientes?${texto}` : "/app/clientes";
}

export function filtrosDaUrl(parametros: Record<string, string | string[] | undefined>) {
  const texto = (chave: string) => {
    const valor = parametros[chave];
    return typeof valor === "string" ? valor : undefined;
  };
  return filtrosListaSchema.parse({
    busca: texto("busca") ?? "",
    papel: texto("papel"),
    origem: texto("origem"),
    processo: texto("processo"),
    uf: texto("uf"),
    cidade: texto("cidade"),
    de: texto("de"),
    ate: texto("ate"),
    aniversario: texto("aniversario"),
    excluidos: texto("excluidos"),
    ordem: texto("ordem"),
    direcao: texto("direcao"),
    pagina: texto("pagina"),
  });
}
