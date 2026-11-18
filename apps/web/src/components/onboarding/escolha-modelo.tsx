import Link from "next/link";
import { EnvioModelo, type DadosModelo } from "@/components/modelo/envio-modelo";
import { Button } from "@/components/ui/button";
import { PreviaPeca } from "./previa-peca";

export function EscolhaModelo({ modelo }: { modelo: DadosModelo }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-texto-secundario">
            Se você não enviar nada, as peças saem no modelo padrão da Tesia. Dá para trocar depois
            em Configurações.
          </p>
          <EnvioModelo {...modelo} />
        </div>
        <PreviaPeca timbrado={modelo.temModelo} />
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
        <Button asChild variant="ghost" className="sm:mr-auto">
          <Link href="/onboarding/estilo">Voltar</Link>
        </Button>
        <Button asChild>
          <Link href="/app">Concluir e ir ao painel</Link>
        </Button>
      </div>
    </div>
  );
}
