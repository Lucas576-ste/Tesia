"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { AvisoPro } from "@/components/plano/aviso-pro";
import { usePlanoDemo } from "@/components/plano/provedor-plano-demo";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ABAS_CONFIGURACOES, type AbaConfiguracoes } from "@/lib/conta-exemplo";
import { AbaAgenda } from "./aba-agenda";
import { AbaAlertas } from "./aba-alertas";
import { AbaCalendario } from "./aba-calendario";
import { AbaDados } from "./aba-dados";
import { AbaEquipe } from "./aba-equipe";
import { AbaModelo } from "./aba-modelo";
import { AbaPerfil } from "./aba-perfil";
import { AbaSeguranca } from "./aba-seguranca";

const conteudos: Record<Exclude<AbaConfiguracoes, "perfil">, React.ReactNode> = {
  alertas: <AbaAlertas />,
  agenda: <AbaAgenda />,
  equipe: <AbaEquipe />,
  modelo: <AbaModelo />,
  calendario: <AbaCalendario />,
  seguranca: <AbaSeguranca />,
  dados: <AbaDados />,
};

const atalhos = [
  { rotulo: "Plano e uso", href: "/app/plano" },
  { rotulo: "Indicar a Tesia", href: "/app/indicar" },
];

const todasAbas = Object.keys(ABAS_CONFIGURACOES) as AbaConfiguracoes[];

export function TelaConfiguracoes({ abaInicial }: { abaInicial: AbaConfiguracoes }) {
  const { id, plano } = usePlanoDemo();
  const [abaEscolhida, setAba] = useState(abaInicial);
  const abas = todasAbas.filter((chave) => chave !== "equipe" || plano.equipe);
  const aba = abas.includes(abaEscolhida) ? abaEscolhida : "perfil";

  function trocarAba(valor: string) {
    const nova = valor as AbaConfiguracoes;
    setAba(nova);
    window.history.replaceState(null, "", `/app/configuracoes?aba=${nova}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Conta" className="grid gap-2 sm:grid-cols-2 md:hidden">
        {atalhos.map(({ rotulo, href }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between rounded-md border bg-card p-3 text-sm font-medium"
          >
            {rotulo}
            <ChevronRight aria-hidden className="size-4 text-texto-secundario" />
          </Link>
        ))}
      </nav>
      <Tabs value={aba} onValueChange={trocarAba} className="min-w-0">
        <TabsList className="w-full flex-wrap justify-start md:w-fit">
          {abas.map((chave) => (
            <TabsTrigger key={chave} value={chave} className="whitespace-nowrap">
              {ABAS_CONFIGURACOES[chave]}
            </TabsTrigger>
          ))}
        </TabsList>
        {abas.map((chave) => (
          <TabsContent
            key={chave}
            value={chave}
            forceMount
            className="data-[state=inactive]:hidden"
          >
            {chave === "perfil" ? (
              <AbaPerfil key={id} />
            ) : chave === "agenda" && !plano.recursosPro ? (
              <AvisoPro
                titulo="Agenda no celular"
                descricao="Veja prazos e audiências no Google Agenda, Apple Calendário ou Outlook."
              />
            ) : (
              conteudos[chave]
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
