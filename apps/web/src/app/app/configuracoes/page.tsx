import type { Metadata } from "next";
import { headers } from "next/headers";
import { preferenciasAlertaSchema } from "@/lib/alertas";
import { TelaConfiguracoes } from "@/components/configuracoes/tela-configuracoes";
import { listarCalendarioProprio, tribunaisDoEscritorio } from "@/lib/calendario-proprio-servidor";
import { abaConfiguracoesSchema } from "@/lib/conta-exemplo";
import { buscarPerfilConta, buscarResumoDados } from "@/lib/perfil-conta";
import { exigirUsuario } from "@/lib/sessao";

export const metadata: Metadata = { title: "Configurações · Tesia" };

type ConfiguracoesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ConfiguracoesPage({ searchParams }: ConfiguracoesPageProps) {
  const { aba } = await searchParams;
  const usuario = await exigirUsuario();
  const [conta, resumo, itensCalendario, tribunais] = await Promise.all([
    buscarPerfilConta(usuario),
    buscarResumoDados(),
    listarCalendarioProprio(),
    tribunaisDoEscritorio(),
  ]);
  const cabecalhos = await headers();
  const host = cabecalhos.get("x-forwarded-host") ?? cabecalhos.get("host") ?? "localhost:3000";
  const protocolo =
    cabecalhos.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      {process.env.NEXT_PUBLIC_CONTA_DEMO === "1" && (
        <p className="rounded-md bg-muted px-3 py-1.5 text-center text-xs text-texto-secundario">
          Conta de demonstração: os dados são de exemplo.
        </p>
      )}
      <h1 className="text-3xl font-semibold text-titulo">Configurações</h1>
      <TelaConfiguracoes
        abaInicial={abaConfiguracoesSchema.parse(aba)}
        conta={conta}
        resumo={resumo}
        calendario={{ itens: itensCalendario, tribunais }}
        agenda={{ token: usuario.calendario_token, origem: `${protocolo}://${host}` }}
        djen={{
          ativo: usuario.djen_ativo,
          buscadoAte: usuario.djen_buscado_ate,
          oab:
            usuario.oab_numero && usuario.oab_uf ? `${usuario.oab_numero}/${usuario.oab_uf}` : null,
        }}
        alertas={preferenciasAlertaSchema.parse({
          email: usuario.alerta_email,
          dias: usuario.alerta_dias,
        })}
        modelo={{
          escritorioId: usuario.escritorio_id,
          usuarioId: usuario.id,
          temModelo: Boolean(usuario.modelo_docx_path),
          status: usuario.modelo_status,
          nome: usuario.modelo_nome,
          enviadoEm: usuario.modelo_enviado_em,
          erro: usuario.modelo_erro,
        }}
      />
    </div>
  );
}
