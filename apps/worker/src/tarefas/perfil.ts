import { perfilGravadoSchema } from "@tesia/shared";

export function lerPerfil(guia: unknown) {
  return perfilGravadoSchema.safeParse(guia).data ?? null;
}
