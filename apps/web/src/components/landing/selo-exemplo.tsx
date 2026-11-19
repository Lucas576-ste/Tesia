export function SeloExemplo({ ativo }: { ativo: boolean }) {
  if (!ativo) return null;
  return (
    <span className="rounded-sm bg-amber-200 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-menu uppercase">
      exemplo
    </span>
  );
}
