import { formatarOabDaBusca, lerOabDaBusca } from "@/lib/busca-oab";

type ConferenciaOabProps = {
  numero: string;
  uf: string | undefined;
};

export function ConferenciaOab({ numero, uf }: ConferenciaOabProps) {
  const oab = lerOabDaBusca(numero, uf ?? null);
  if (!oab) return null;
  return (
    <p role="status" className="-mt-2 text-sm text-texto-secundario">
      Confira: OAB {formatarOabDaBusca(oab)}. Um dígito errado traz publicações de outra pessoa.
    </p>
  );
}
