const formatador = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

export function dataCurta(iso: string | null) {
  if (!iso) return "";
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? "" : formatador.format(data);
}
