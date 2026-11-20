import { ACEITOS_PECA_ESTILO, MAXIMO_PECAS_ESTILO, MINIMO_PECAS_ESTILO } from "@/lib/estilo";
import { ZonaUpload } from "@/components/zona-upload";

function Ilustracao() {
  return (
    <svg aria-hidden viewBox="0 0 160 110" className="h-28 w-40" fill="none">
      <rect
        x="22"
        y="22"
        width="64"
        height="80"
        rx="6"
        className="fill-card stroke-borda"
        strokeWidth="2"
      />
      <rect
        x="44"
        y="12"
        width="64"
        height="80"
        rx="6"
        className="fill-card stroke-borda"
        strokeWidth="2"
      />
      <rect
        x="66"
        y="6"
        width="64"
        height="80"
        rx="6"
        className="fill-card stroke-primaria"
        strokeWidth="2"
      />
      <path
        d="M78 26h40M78 38h40M78 50h28M78 62h34"
        className="stroke-primaria/50"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="132" cy="82" r="15" className="fill-destaque" />
      <path
        d="M132 73l2.6 6.4 6.4 2.6-6.4 2.6-2.6 6.4-2.6-6.4-6.4-2.6 6.4-2.6z"
        className="fill-menu"
      />
    </svg>
  );
}

export function EstadoVazioEstilo({ aoEscolher }: { aoEscolher: (arquivos: File[]) => void }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 py-6 text-center">
      <Ilustracao />
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-titulo">Ensine a Lia a escrever como você</h2>
        <p className="text-texto-secundario">
          Envie de {MINIMO_PECAS_ESTILO} a {MAXIMO_PECAS_ESTILO} peças suas. Quanto mais variadas,
          melhor o rascunho.
        </p>
      </div>
      <ZonaUpload
        titulo="Arraste as peças aqui ou clique para escolher"
        descricao="PDF ou Word (.docx), até 20 MB cada"
        accept={ACEITOS_PECA_ESTILO}
        aoEscolher={aoEscolher}
        className="w-full gap-2 p-10 [&_span:first-of-type]:text-base"
      />
    </div>
  );
}
