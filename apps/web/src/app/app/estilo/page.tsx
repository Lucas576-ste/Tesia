import type { Metadata } from "next";
import { TelaEstilo } from "@/components/estilo/tela-estilo";
import {
  buscarAprenderRevisoes,
  buscarExemplo,
  buscarPerfilEstilo,
  contarNovidadesEstilo,
  listarPecasEstilo,
} from "@/lib/estilo-servidor";
import { exigirUsuario } from "@/lib/sessao";

export const metadata: Metadata = { title: "Meu estilo · Tesia" };

export default async function EstiloPage() {
  const usuario = await exigirUsuario();
  const [pecas, perfil, aprenderRevisoes, exemplo] = await Promise.all([
    listarPecasEstilo(usuario.id),
    buscarPerfilEstilo(usuario.id),
    buscarAprenderRevisoes(usuario.id),
    buscarExemplo(usuario.id),
  ]);
  const geradoEm =
    perfil.estado === "pronto"
      ? perfil.atualizadoEm
      : perfil.estado === "atualizando"
        ? (perfil.anterior?.atualizadoEm ?? null)
        : null;
  const novidades = await contarNovidadesEstilo(usuario.id, geradoEm);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-titulo">Meu estilo</h1>
        <p className="text-sm text-texto-secundario">
          A Lia usa suas peças para escrever os rascunhos do seu jeito.
        </p>
      </header>
      <TelaEstilo
        escritorioId={usuario.escritorio_id}
        usuarioId={usuario.id}
        pecasIniciais={pecas}
        perfil={perfil}
        novidades={novidades}
        aprenderRevisoes={aprenderRevisoes}
        exemplo={exemplo}
      />
    </div>
  );
}
