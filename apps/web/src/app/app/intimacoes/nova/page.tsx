import type { Metadata } from "next";
import { EnvioIntimacao } from "@/components/intimacao/envio-intimacao";
import { BalaoLia } from "@/components/lia/balao-lia";
import { exigirUsuario } from "@/lib/sessao";

export const metadata: Metadata = { title: "Nova intimação · Tesia" };

export default async function NovaIntimacaoPage() {
  const usuario = await exigirUsuario();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <h1 className="text-3xl font-semibold text-titulo">Nova intimação</h1>
      <BalaoLia className="text-sm">
        Envie o PDF da intimação ou da decisão. Eu leio e separo o que importa para você.
      </BalaoLia>
      <p className="rounded-md bg-atencao-fundo px-3 py-2 text-xs text-atencao">
        O arquivo é recebido e conferido. A leitura pela IA entra nos próximos dias.
      </p>
      <EnvioIntimacao escritorioId={usuario.escritorio_id} />
    </div>
  );
}
