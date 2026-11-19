import Link from "next/link";

type AvisoLimiteProps = { usadas: number; limite: number };

export function AvisoLimite({ usadas, limite }: AvisoLimiteProps) {
  if (limite <= 0 || usadas < limite * 0.8) return null;
  const esgotado = usadas >= limite;

  return (
    <div
      role="status"
      className={
        esgotado
          ? "bg-erro-fundo px-4 py-2 text-sm text-erro md:px-6"
          : "bg-atencao-fundo px-4 py-2 text-sm text-atencao md:px-6"
      }
    >
      {esgotado
        ? `Você usou as ${limite} peças de hoje. Novos rascunhos voltam amanhã; análises e prazos continuam funcionando.`
        : `Você já usou ${usadas} de ${limite} peças hoje.`}{" "}
      <Link href="/app/plano" className="font-medium underline underline-offset-2">
        Ver pacote extra ou trocar de plano
      </Link>
    </div>
  );
}
