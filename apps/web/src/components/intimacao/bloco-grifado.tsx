import type { Grifo } from "@/lib/formatar-publicacao";

export function BlocoGrifado({ texto, grifo }: { texto: string; grifo?: Grifo }) {
  if (!grifo) return texto;
  return (
    <>
      {texto.slice(0, grifo.de)}
      <mark className="rounded-sm bg-destaque text-menu">{texto.slice(grifo.de, grifo.ate)}</mark>
      {texto.slice(grifo.ate)}
    </>
  );
}
