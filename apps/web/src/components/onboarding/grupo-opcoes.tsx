"use client";

type GrupoOpcoesProps<T extends string> = {
  legenda: string;
  opcoes: readonly T[];
  emBreve?: string[];
  valor: T[];
  aoMudar: (valor: T[]) => void;
};

const estiloOpcao =
  "flex min-h-11 items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50";

export function GrupoOpcoes<T extends string>({
  legenda,
  opcoes,
  emBreve = [],
  valor,
  aoMudar,
}: GrupoOpcoesProps<T>) {
  function alternar(opcao: T) {
    aoMudar(valor.includes(opcao) ? valor.filter((item) => item !== opcao) : [...valor, opcao]);
  }

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-medium">{legenda}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {opcoes.map((opcao) => (
          <label
            key={opcao}
            className={`${estiloOpcao} cursor-pointer has-checked:border-primaria has-checked:bg-primaria-fundo`}
          >
            <input
              type="checkbox"
              checked={valor.includes(opcao)}
              onChange={() => alternar(opcao)}
              className="accent-primaria"
            />
            {opcao}
          </label>
        ))}
        {emBreve.map((opcao) => (
          <label key={opcao} className={`${estiloOpcao} text-texto-secundario`}>
            <input type="checkbox" disabled />
            {opcao} (em breve)
          </label>
        ))}
      </div>
    </fieldset>
  );
}
