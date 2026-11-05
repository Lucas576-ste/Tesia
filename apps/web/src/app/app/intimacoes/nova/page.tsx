import type { Metadata } from "next";
import { z } from "zod";
import { EnvioIntimacao } from "@/components/intimacao/envio-intimacao";
import { processosExemplo } from "@/components/layout/dados-exemplo";
import { BalaoLia } from "@/components/lia/balao-lia";

export const metadata: Metadata = { title: "Nova intimação · Tesia" };

const parametrosSchema = z.object({ processo: z.string().optional().catch(undefined) });

type NovaIntimacaoPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NovaIntimacaoPage({ searchParams }: NovaIntimacaoPageProps) {
  const { processo } = parametrosSchema.parse(await searchParams);
  const processoInicial = processosExemplo.some(({ id }) => id === processo) ? processo : "";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <h1 className="text-3xl font-semibold text-titulo">Nova intimação</h1>
      <BalaoLia className="text-sm">
        Envie o PDF da intimação ou da decisão. Eu leio e separo o que importa para você.
      </BalaoLia>
      <p className="rounded-md bg-atencao-fundo px-3 py-2 text-xs text-atencao">
        Demonstração: o arquivo não sai do seu navegador nem é lido. A análise mostrada é sempre um
        exemplo.
      </p>
      <EnvioIntimacao key={processoInicial} processoInicial={processoInicial} />
    </div>
  );
}
