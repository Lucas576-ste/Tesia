export function TituloAutenticacao({ titulo, descricao }: { titulo: string; descricao?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold">{titulo}</h1>
      {descricao && <p className="text-sm text-texto-secundario">{descricao}</p>}
    </div>
  );
}
