"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { avaliarAprendizado, pedirAtualizacaoEstilo } from "@/app/app/estilo/acoes";
import type { EstadoExemplo } from "@/lib/estilo-servidor";
import { MAXIMO_PECAS_ESTILO, type PecaEstilo } from "@/lib/estilo";
import type { EstadoPerfil, ItemAprendizado, PerfilPronto } from "@/lib/perfil-estilo";
import { AprendizadosLia } from "./aprendizados-lia";
import { CardAprendizadoContinuo } from "./card-aprendizado-continuo";
import { CardStatusEstilo } from "./card-status-estilo";
import { EstadoVazioEstilo } from "./estado-vazio-estilo";
import { ExemploEstilo } from "./exemplo-estilo";
import { ListaPecas } from "./lista-pecas";
import { usePecasEstilo } from "./usar-pecas-estilo";

const INTERVALO_MS = 4000;

type TelaEstiloProps = {
  escritorioId: string;
  usuarioId: string;
  pecasIniciais: PecaEstilo[];
  perfil: EstadoPerfil;
  novidades: { pecas: number; correcoes: number };
  aprenderRevisoes: boolean;
  exemplo: EstadoExemplo;
};

function verExemplo() {
  document.getElementById("exemplo-estilo")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function prontoDe(perfil: EstadoPerfil): PerfilPronto | null {
  if (perfil.estado === "pronto") return perfil;
  return perfil.estado === "atualizando" ? perfil.anterior : null;
}

export function TelaEstilo({
  escritorioId,
  usuarioId,
  pecasIniciais,
  perfil,
  novidades,
  aprenderRevisoes,
  exemplo,
}: TelaEstiloProps) {
  const { pecas, adicionar, remover, lidas } = usePecasEstilo(
    escritorioId,
    usuarioId,
    pecasIniciais,
  );
  const [pedindo, iniciar] = useTransition();
  const [salvando, setSalvando] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState<Record<string, ItemAprendizado>>({});
  const router = useRouter();
  const atualizando = perfil.estado === "atualizando";
  const anterior = useRef(perfil.estado);
  const pronto = prontoDe(perfil);

  useEffect(() => {
    if (!atualizando) return;
    const intervalo = setInterval(() => router.refresh(), INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [atualizando, router]);

  useEffect(() => {
    if (anterior.current === "atualizando" && perfil.estado === "pronto") {
      toast.success("Estilo atualizado. Os próximos rascunhos já saem assim.", {
        action: { label: "Ver exemplo", onClick: verExemplo },
      });
    }
    anterior.current = perfil.estado;
  }, [perfil.estado]);

  function atualizarEstilo() {
    iniciar(async () => {
      const resultado = await pedirAtualizacaoEstilo();
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      router.refresh();
    });
  }

  async function avaliar(item: ItemAprendizado, avaliacao: "certo" | "errado", correcao?: string) {
    const parte = pronto?.aprendizados.find((grupo) =>
      grupo.itens.some(({ id }) => id === item.id),
    )?.parte;
    if (!parte) return false;
    setSalvando(true);
    const resultado = await avaliarAprendizado({ parte, texto: item.texto, avaliacao, correcao });
    setSalvando(false);
    if ("erro" in resultado) {
      toast.error(resultado.erro);
      return false;
    }
    setAvaliacoes((atuais) => ({
      ...atuais,
      [item.id]: {
        ...item,
        avaliacao,
        correcao: avaliacao === "errado" ? (correcao ?? null) : null,
      },
    }));
    toast.success(
      avaliacao === "errado"
        ? "Anotado. A Lia vai considerar isso na próxima análise."
        : "Anotado.",
    );
    router.refresh();
    return true;
  }

  if (pecas.length === 0) return <EstadoVazioEstilo aoEscolher={adicionar} />;

  const perfilComAvaliacoes: PerfilPronto | null = pronto && {
    ...pronto,
    aprendizados: pronto.aprendizados.map((grupo) => ({
      ...grupo,
      itens: grupo.itens.map((item) => avaliacoes[item.id] ?? item),
    })),
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div className="flex min-w-0 flex-col gap-5">
        <CardStatusEstilo
          lidas={lidas}
          cheio={pecas.filter(({ status }) => status !== "erro").length >= MAXIMO_PECAS_ESTILO}
          novidades={novidades}
          atualizadoEm={pronto?.atualizadoEm ?? null}
          atualizando={atualizando}
          pedindo={pedindo}
          aoAdicionar={adicionar}
          aoAtualizar={atualizarEstilo}
        />
        <AprendizadosLia
          perfil={perfilComAvaliacoes}
          atualizando={atualizando}
          salvando={salvando}
          aoAvaliar={avaliar}
        />
        {pronto && <ExemploEstilo inicial={exemplo} perfilGeradoEm={pronto.atualizadoEm} />}
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <ListaPecas pecas={pecas} aoRemover={(id) => void remover(id)} />
        <CardAprendizadoContinuo inicial={aprenderRevisoes} />
      </div>
    </div>
  );
}
