import { somenteDigitos, validarCnpj, validarCpf } from "@tesia/shared";
import { z } from "zod";
import { UFS } from "@/lib/lead";

export const TIPOS_TERMO = {
  advogado: "Advogado (OAB)",
  pf: "Pessoa física",
  pj: "Pessoa jurídica",
} as const;

export const STATUS_TERMO = {
  sincronizando: "Sincronizando",
  monitorando: "Monitorando",
  falha_autenticacao: "Falha de acesso",
  inativo: "Pausado",
} as const;

export type TipoTermo = keyof typeof TIPOS_TERMO;
export type StatusTermo = keyof typeof STATUS_TERMO;

export type Termo = {
  id: string;
  tipo: TipoTermo;
  oab: string | null;
  documento: string | null;
  nome: string | null;
  ufs: string[];
  status: StatusTermo;
  ultimaSincronizacao: string | null;
  ultimoErro: string | null;
  responsavelId: string | null;
  responsavelNome: string | null;
};

export type Responsavel = { id: string; nome: string };

export const termoLinhaSchema = z.object({
  id: z.uuid(),
  tipo: z.enum(["advogado", "pf", "pj"]),
  oab_numero: z.string().nullable(),
  oab_uf: z.string().nullable(),
  documento: z.string().nullable(),
  nome: z.string().nullable(),
  ufs: z.array(z.string()),
  status: z.enum(["sincronizando", "monitorando", "falha_autenticacao", "inativo"]),
  ultima_sincronizacao_em: z.string().nullable(),
  ultimo_erro: z.string().nullable(),
  responsavel_id: z.uuid().nullable(),
  usuarios: z
    .union([z.object({ nome: z.string() }), z.array(z.object({ nome: z.string() }))])
    .nullable(),
});

export const termoEntradaSchema = z
  .object({
    tipo: z.enum(["advogado", "pf", "pj"]),
    oabNumero: z.string().trim().optional(),
    oabUf: z.enum(UFS).optional(),
    documento: z.string().trim().optional(),
    nome: z.string().trim().max(120).optional(),
    ufs: z.array(z.enum(UFS)).max(27),
    responsavelId: z.uuid({ error: "Escolha o responsável." }),
  })
  .superRefine((dados, contexto) => {
    if (dados.tipo === "advogado") {
      const numero = somenteDigitos(dados.oabNumero ?? "");
      if (numero.length < 1 || numero.length > 8) {
        contexto.addIssue({
          code: "custom",
          path: ["oabNumero"],
          message: "Informe o número da OAB.",
        });
      }
      if (!dados.oabUf) {
        contexto.addIssue({ code: "custom", path: ["oabUf"], message: "Escolha a UF da OAB." });
      }
      return;
    }
    const digitos = somenteDigitos(dados.documento ?? "");
    const valido = dados.tipo === "pf" ? validarCpf(digitos) : validarCnpj(digitos);
    if (!valido) {
      contexto.addIssue({
        code: "custom",
        path: ["documento"],
        message: dados.tipo === "pf" ? "CPF inválido." : "CNPJ inválido.",
      });
    }
    if (!dados.nome || dados.nome.length < 3) {
      contexto.addIssue({
        code: "custom",
        path: ["nome"],
        message: "Informe o nome para a busca.",
      });
    }
  });

export type TermoEntrada = z.infer<typeof termoEntradaSchema>;

export function montarTermo(linha: z.infer<typeof termoLinhaSchema>): Termo {
  const usuario = Array.isArray(linha.usuarios) ? linha.usuarios[0] : linha.usuarios;
  return {
    id: linha.id,
    tipo: linha.tipo,
    oab: linha.oab_numero && linha.oab_uf ? `${linha.oab_numero}/${linha.oab_uf}` : null,
    documento: linha.documento,
    nome: linha.nome,
    ufs: linha.ufs,
    status: linha.status,
    ultimaSincronizacao: linha.ultima_sincronizacao_em,
    ultimoErro: linha.ultimo_erro,
    responsavelId: linha.responsavel_id,
    responsavelNome: usuario?.nome ?? null,
  };
}
