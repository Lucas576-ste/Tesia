import { somenteDigitos } from "@tesia/shared";
import { z } from "zod";

const respostaSchema = z.object({
  logradouro: z.string().optional().default(""),
  bairro: z.string().optional().default(""),
  localidade: z.string().optional().default(""),
  uf: z.string().optional().default(""),
  erro: z.unknown().optional(),
});

export type EnderecoPorCep = { logradouro: string; bairro: string; cidade: string; uf: string };

export async function consultarCep(cep: string): Promise<EnderecoPorCep | null> {
  const digitos = somenteDigitos(cep);
  if (digitos.length !== 8) return null;
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`, {
      signal: AbortSignal.timeout(6000),
    });
    const lida = respostaSchema.safeParse(await resposta.json());
    if (!lida.success || lida.data.erro) return null;
    return {
      logradouro: lida.data.logradouro,
      bairro: lida.data.bairro,
      cidade: lida.data.localidade,
      uf: lida.data.uf,
    };
  } catch {
    return null;
  }
}
