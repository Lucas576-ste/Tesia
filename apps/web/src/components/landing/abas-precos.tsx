"use client";

import { Check, Clock } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { track } from "@/lib/medicao";
import { cn } from "@/lib/utils";

type Plano = {
  nome: string;
  mensal: string;
  anual: string;
  publico: string;
  itens: string[];
  chegando?: string[];
  botao?: string;
  destaque?: boolean;
  emBreve?: boolean;
};

const planos: Plano[] = [
  {
    nome: "Start",
    mensal: "R$ 79/mês",
    anual: "R$ 790/ano",
    publico: "Para quem atua em uma área",
    itens: [
      "15 peças por mês",
      "1 área de atuação",
      "1 usuário",
      "Análise de intimações ilimitada",
      "Resumo e pontos que podem ser atacados",
      "Prazo com a conta e o fundamento legal",
      "Painel de prazos e alertas por e-mail",
      "Rascunho no seu estilo, aprendido das suas peças",
      "Pendências destacadas para conferir",
      ".docx com o seu timbrado",
      "Exportação dos seus dados",
    ],
    botao: "Começar",
  },
  {
    nome: "Pro",
    mensal: "R$ 129/mês",
    anual: "R$ 1.290/ano",
    publico: "Para quem quer tudo, sem limite apertado",
    itens: ["50 peças por mês", "Todas as áreas de atuação", "1 usuário", "Tudo do Start"],
    chegando: ["Alertas no WhatsApp", "Busca automática de intimações"],
    botao: "Começar",
    destaque: true,
  },
  {
    nome: "Plus",
    mensal: "+ R$ 49/mês",
    anual: "+ R$ 490/ano",
    publico: "Complemento para quem quer presença no Instagram",
    itens: [
      "20 posts por mês",
      "Calendário de conteúdo",
      "Textos dentro das regras de publicidade da OAB",
    ],
    emBreve: true,
  },
  {
    nome: "Empresas",
    mensal: "Valor em breve",
    anual: "Valor em breve",
    publico: "Para escritórios e equipes",
    itens: [
      "Vários usuários no mesmo escritório",
      "Mais peças por mês",
      "Tudo do Pro",
      "Distribuição de tarefas",
    ],
    botao: "Entrar na lista",
    emBreve: true,
  },
];

type Periodo = "mensal" | "anual";

function ListaRecursos({ itens, chegando }: Pick<Plano, "itens" | "chegando">) {
  return (
    <div className="flex flex-1 flex-col gap-3 text-sm">
      <ul className="flex flex-col gap-1.5">
        {itens.map((item) => (
          <li key={item} className="flex gap-2">
            <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-sucesso" />
            {item}
          </li>
        ))}
      </ul>
      {chegando && (
        <div>
          <p className="text-xs font-semibold text-texto-secundario">Em breve no plano</p>
          <ul className="mt-1 flex flex-col gap-1.5 text-texto-secundario">
            {chegando.map((item) => (
              <li key={item} className="flex gap-2">
                <Clock aria-hidden className="mt-0.5 size-4 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function GradePlanos({ periodo }: { periodo: Periodo }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {planos.map((plano) => (
        <Card key={plano.nome} className={cn(plano.destaque && "border-2 border-primaria")}>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">{plano.nome}</CardTitle>
              {plano.destaque && (
                <Badge className="border-transparent bg-destaque text-menu">Recomendado</Badge>
              )}
              {plano.emBreve && <Badge variant="secondary">Em breve</Badge>}
            </div>
            <CardDescription>{plano.publico}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <p className="font-serif text-2xl font-semibold tabular-nums">{plano[periodo]}</p>
            <ListaRecursos itens={plano.itens} chegando={plano.chegando} />
            {plano.botao ? (
              <Button asChild variant={plano.destaque ? "default" : "outline"} className="w-full">
                <a href="#fundador">{plano.botao}</a>
              </Button>
            ) : (
              <Button disabled variant="outline" className="w-full">
                Em breve
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AbasPrecos() {
  const [periodo, setPeriodo] = useState<Periodo>("mensal");

  function aoTrocar(valor: string) {
    const novo = valor as Periodo;
    setPeriodo(novo);
    if (novo === "anual") track("preco_toggle_anual");
  }

  return (
    <Tabs value={periodo} onValueChange={aoTrocar}>
      <TabsList>
        <TabsTrigger value="mensal">Mensal</TabsTrigger>
        <TabsTrigger value="anual">Anual (2 meses grátis)</TabsTrigger>
      </TabsList>
      <TabsContent value="mensal">
        <GradePlanos periodo="mensal" />
      </TabsContent>
      <TabsContent value="anual">
        <GradePlanos periodo="anual" />
      </TabsContent>
    </Tabs>
  );
}
