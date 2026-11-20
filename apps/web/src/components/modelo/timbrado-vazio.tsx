import { PaginaA4 } from "./pagina-a4";
import { PREVIA_ILUSTRATIVA } from "./previa-ilustrativa";
import { ZonaUpload } from "@/components/zona-upload";

export function TimbradoVazio({ aoEscolher }: { aoEscolher: (arquivos: File[]) => void }) {
  return (
    <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-titulo">Seu papel timbrado</h2>
        <ZonaUpload
          titulo="Arraste o arquivo aqui ou clique para escolher"
          descricao="Envie seu papel timbrado. Usamos o cabeçalho, o rodapé, as fontes e as margens dele em todas as peças."
          accept=".docx,.pdf"
          multiple={false}
          aoEscolher={aoEscolher}
          className="gap-2 p-8 md:p-12 [&_span:first-of-type]:text-base"
        />
        <p className="text-xs text-texto-secundario">
          Formato .docx, até 5 MB. Se o seu timbrado está em PDF, salve-o como .docx no Word.
        </p>
      </div>
      <div aria-hidden className="mx-auto flex flex-col items-center gap-2">
        <PaginaA4 previa={PREVIA_ILUSTRATIVA} escala={0.28} />
        <p className="text-xs text-texto-secundario">Assim fica a sua peça</p>
      </div>
    </div>
  );
}
