export type EventoMedicao =
  | "cta_hero_click"
  | "ver_como_funciona"
  | "scroll_50"
  | "scroll_90"
  | "faq_open"
  | "preco_toggle_anual"
  | "fundador_form_start"
  | "fundador_form_submit"
  | "whatsapp_click";

export function track(evento: EventoMedicao, dados?: Record<string, string>) {
  console.info("[medicao]", evento, dados ?? {});
}
