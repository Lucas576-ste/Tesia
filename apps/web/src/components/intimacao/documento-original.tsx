import type { Analise } from "@/lib/analise";
import type { Grifo } from "@/lib/formatar-publicacao";
import { TextoDaPublicacao } from "./texto-da-publicacao";

type DocumentoOriginalProps = {
  analise: Analise;
  destaque: Grifo[];
};

export function DocumentoOriginal({ analise, destaque }: DocumentoOriginalProps) {
  return (
    <TextoDaPublicacao
      blocos={analise.documento}
      textoOriginal={analise.textoOriginal}
      destaque={destaque}
      vazio="O texto do documento não está disponível."
    />
  );
}
