import { somenteDigitos } from "@tesia/shared";
import { z } from "zod";
import { UFS } from "@/lib/lead";

export const MENSAGEM_OAB_INVALIDA =
  "Número de OAB inválido. Use até 6 dígitos, por exemplo 12345.";

const FORMATO_OAB = /^[\d.\s]+(-?\s*[A-Za-z])?$/;

export const numeroOabSchema = z
  .string()
  .trim()
  .regex(FORMATO_OAB, MENSAGEM_OAB_INVALIDA)
  .transform((valor) => somenteDigitos(valor).replace(/^0+/, ""))
  .pipe(z.string().min(1, MENSAGEM_OAB_INVALIDA).max(6, MENSAGEM_OAB_INVALIDA));

export const oabDaBuscaSchema = z.object({
  numero: numeroOabSchema,
  uf: z.enum(UFS, { error: "Escolha a UF da OAB." }),
});

export type OabDaBusca = z.infer<typeof oabDaBuscaSchema>;

export function lerOabDaBusca(numero: string | null, uf: string | null): OabDaBusca | null {
  const resultado = oabDaBuscaSchema.safeParse({ numero: numero ?? "", uf });
  return resultado.success ? resultado.data : null;
}

export function formatarOabDaBusca({ numero, uf }: OabDaBusca) {
  return `${numero}/${uf}`;
}

export const LINK_BUSCA_OAB = "/app/configuracoes?aba=perfil#busca-intimacoes";

const PLANOS_COM_BUSCA = ["pro", "sociedade", "fundador"];

export function planoTemBusca(status: string | null, planoCodigo: string | null) {
  if (status === "trial") return true;
  return status === "ativa" && PLANOS_COM_BUSCA.includes(planoCodigo ?? "");
}

export type EstadoBanner = "convite" | "completarOab" | "semPlano" | "monitorando" | "falha";

const entradaBannerSchema = z.object({
  aceitou: z.boolean(),
  temOab: z.boolean(),
  comFalha: z.boolean(),
  ultimaBusca: z.string().nullable(),
  podeGerenciar: z.boolean(),
  temPlano: z.boolean(),
});

export function estadoBanner(entrada: z.input<typeof entradaBannerSchema>): EstadoBanner | null {
  const { aceitou, temOab, comFalha, podeGerenciar, temPlano } = entradaBannerSchema.parse(entrada);
  if (!temPlano) return podeGerenciar ? "semPlano" : null;
  if (aceitou) return comFalha ? "falha" : "monitorando";
  if (!podeGerenciar) return null;
  return temOab ? "convite" : "completarOab";
}

export function podeBuscarAgora(ambiente: string | undefined) {
  return z.string().optional().parse(ambiente) !== "production";
}
