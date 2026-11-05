import { z } from "zod";

export const UFS = [
  "AC",
  "AL",
  "AM",
  "AP",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MG",
  "MS",
  "MT",
  "PA",
  "PB",
  "PE",
  "PI",
  "PR",
  "RJ",
  "RN",
  "RO",
  "RR",
  "RS",
  "SC",
  "SE",
  "SP",
  "TO",
] as const;

export const AREAS = [
  "Cível e consumidor",
  "Trabalhista",
  "Previdenciário",
  "Família",
  "Outra",
  "Plano Empresas (lista de espera)",
] as const;

export const leadSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome.").max(120),
  email: z.email("Informe um e-mail válido."),
  oab: z.string().trim().min(1, "Informe o número da OAB.").max(12),
  uf: z.enum(UFS, { error: "Escolha a UF." }),
  area: z.enum(AREAS, { error: "Escolha a área principal." }),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\(?\d{2}\)?[\s-]?9?\d{4}[\s-]?\d{4}$/, "Informe o WhatsApp com DDD."),
});

export const CAMPOS_UTM = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export const envioLeadSchema = leadSchema.extend({
  utms: z.partialRecord(z.enum(CAMPOS_UTM), z.string().max(200)),
});

export type Lead = z.infer<typeof leadSchema>;
