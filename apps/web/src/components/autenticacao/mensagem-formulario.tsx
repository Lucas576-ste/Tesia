import type { EstadoFormulario } from "@/lib/autenticacao";
import { cn } from "@/lib/utils";

export function MensagemFormulario({ estado }: { estado: EstadoFormulario }) {
  const texto = estado.erro ?? estado.sucesso;
  if (!texto) return null;

  return (
    <p
      role={estado.erro ? "alert" : "status"}
      className={cn(
        "rounded-md px-3 py-2 text-sm",
        estado.erro ? "bg-erro-fundo text-erro" : "bg-sucesso-fundo text-sucesso",
      )}
    >
      {texto}
    </p>
  );
}
