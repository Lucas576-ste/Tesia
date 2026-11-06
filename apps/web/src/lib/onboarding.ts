import { z } from "zod";
import { REGEX_WHATSAPP, UFS } from "@/lib/lead";

export const AREAS_ATUACAO = [
  "Cível e consumidor",
  "Trabalhista",
  "Previdenciário",
  "Família",
] as const;

export const AREAS_EM_BREVE = ["Criminal", "Tributário"];

export const OUTRO_TRIBUNAL = "Outro tribunal";

export const TRIBUNAIS = ["TJDFT", "TRF1 / SJDF", "TRT10", OUTRO_TRIBUNAL] as const;

export const perfilSchema = z.object({
  nome: z.string().trim().max(120).optional(),
  oab: z.string().trim().min(1, "Informe o número da OAB.").max(12),
  uf: z.enum(UFS, { error: "Escolha a UF." }),
  areas: z.array(z.enum(AREAS_ATUACAO)).min(1, "Escolha pelo menos uma área."),
  tribunais: z.array(z.enum(TRIBUNAIS)),
  whatsapp: z
    .string()
    .trim()
    .regex(REGEX_WHATSAPP, "Informe o WhatsApp com DDD.")
    .or(z.literal("")),
});

export type Perfil = z.infer<typeof perfilSchema>;
