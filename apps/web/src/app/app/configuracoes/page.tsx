import type { Metadata } from "next";
import { headers } from "next/headers";
import { BotaoSair } from "@/components/autenticacao/botao-sair";
import { TelaConfiguracoes } from "@/components/configuracoes/tela-configuracoes";
import { Badge } from "@/components/ui/badge";
import { abaConfiguracoesSchema } from "@/lib/conta-exemplo";
import { exigirUsuario } from "@/lib/sessao";

export const metadata: Metadata = { title: "Configurações · Tesia" };

type ConfiguracoesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ConfiguracoesPage({ searchParams }: ConfiguracoesPageProps) {
  const { aba } = await searchParams;
  const usuario = await exigirUsuario();
  const cabecalhos = await headers();
  const host = cabecalhos.get("x-forwarded-host") ?? cabecalhos.get("host") ?? "localhost:3000";
  const protocolo =
    cabecalhos.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h1 className="text-3xl font-semibold text-titulo">Configurações</h1>
        <Badge variant="secondary">Dados de exemplo</Badge>
        <div className="ml-auto">
          <BotaoSair />
        </div>
      </header>
      <TelaConfiguracoes
        abaInicial={abaConfiguracoesSchema.parse(aba)}
        agenda={{ token: usuario.calendario_token, origem: `${protocolo}://${host}` }}
        modelo={{
          escritorioId: usuario.escritorio_id,
          usuarioId: usuario.id,
          temModelo: Boolean(usuario.modelo_docx_path),
        }}
      />
    </div>
  );
}
