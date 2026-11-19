import { z } from "zod";

export const dadosClienteSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome.").max(200),
  documento: z.string().trim().max(20).optional().default(""),
  telefone: z.string().trim().max(30).optional().default(""),
  email: z
    .union([z.email("E-mail inválido."), z.literal("")])
    .optional()
    .default(""),
});

export type DadosCliente = z.input<typeof dadosClienteSchema>;
