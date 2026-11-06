import { toast } from "sonner";

export async function copiarTexto(texto: string, mensagem: string) {
  try {
    await navigator.clipboard.writeText(texto);
    toast.success(mensagem);
  } catch {
    toast.error("Não foi possível copiar. Selecione o texto e copie manualmente.");
  }
}
