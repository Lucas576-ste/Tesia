import type { Metadata } from "next";
import { TelaEstilo } from "@/components/estilo/tela-estilo";
import { listarPecasEstilo } from "@/lib/estilo-servidor";
import { exigirUsuario } from "@/lib/sessao";

export const metadata: Metadata = { title: "Meu estilo · Tesia" };

export default async function EstiloPage() {
  const usuario = await exigirUsuario();
  const pecas = await listarPecasEstilo(usuario.id);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-titulo">Meu estilo</h1>
        <p className="text-sm text-texto-secundario">
          A Lia usa estas peças para escrever os rascunhos do seu jeito.
        </p>
      </header>
      <TelaEstilo
        escritorioId={usuario.escritorio_id}
        usuarioId={usuario.id}
        pecasIniciais={pecas}
      />
    </div>
  );
}
