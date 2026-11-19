import { somenteDigitos, validarCnpj, validarCpf } from "@tesia/shared";
import { z } from "zod";

export { qualificacaoSchema, type Qualificacao } from "@tesia/shared";

export const dadosClienteSchema = z
  .object({
    tipo_pessoa: z.enum(["pf", "pj"]).optional().default("pf"),
    nome: z.string().trim().min(2, "Informe o nome.").max(200),
    documento: z.string().trim().max(20).optional().default(""),
    telefone: z.string().trim().max(30).optional().default(""),
    email: z
      .union([z.email("E-mail inválido."), z.literal("")])
      .optional()
      .default(""),
  })
  .superRefine((dados, contexto) => {
    if (!dados.documento) return;
    const valido =
      dados.tipo_pessoa === "pf" ? validarCpf(dados.documento) : validarCnpj(dados.documento);
    if (!valido)
      contexto.addIssue({
        code: "custom",
        path: ["documento"],
        message: dados.tipo_pessoa === "pf" ? "CPF inválido." : "CNPJ inválido.",
      });
  })
  .transform((dados) => ({ ...dados, documento: somenteDigitos(dados.documento) }));

export const extrasClienteSchema = z.object({
  pix: z.string().trim().max(140).optional().default(""),
  observacoes: z.string().trim().max(5000).optional().default(""),
});

export type DadosCliente = z.input<typeof dadosClienteSchema>;
export type ExtrasCliente = z.input<typeof extrasClienteSchema>;
