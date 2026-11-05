type SecaoDocumento = {
  titulo: string;
  paragrafos: string[];
};

type DocumentoLegalProps = {
  titulo: string;
  secoes: SecaoDocumento[];
};

export function DocumentoLegal({ titulo, secoes }: DocumentoLegalProps) {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8">
      <h1 className="text-3xl font-semibold">{titulo}</h1>
      <p role="note" className="rounded-md bg-atencao-fundo px-3 py-2 text-sm text-atencao">
        Texto provisório, ainda sem revisão de advogado. Não vale como documento final.
      </p>
      {secoes.map((secao) => (
        <section key={secao.titulo} className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{secao.titulo}</h2>
          {secao.paragrafos.map((paragrafo) => (
            <p key={paragrafo} className="text-sm text-texto-secundario">
              {paragrafo}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
