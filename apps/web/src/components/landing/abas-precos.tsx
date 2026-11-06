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
  inclui?: string;
  itens: string[];
  chegando?: string[];
  botao?: string;
  destaque?: boolean;
  emBreve?: boolean;
};

const recursosChegando = [
  "Busca automática de intimações",
  "Alertas no WhatsApp",
  "Agenda no Google, Apple e Outlook",
  "Relatório do mês",
  "Honorários simples",
];

const planos: Plano[] = [
  {
    nome: "Start",
    mensal: "R$ 79/mês",
    anual: "R$ 790/ano",
    publico: "O essencial para começar",
    itens: [
      "15 peças por mês",
      "1 área de atuação",
      "1 usuário",
      "Leitura da intimação, com resumo e pontos que podem ser atacados",
      "Prazo com a conta e o fundamento legal",
      "Painel em lista e alerta por e-mail",
      "Rascunho no seu estilo, com pendências destacadas",
      ".docx com o seu timbrado",
    ],
    botao: "Começar",
  },
  {
    nome: "Pro",
    mensal: "R$ 129/mês",
    anual: "R$ 1.290/ano",
    publico: "Para quem quer tudo, sem limite apertado",
    inclui: "Tudo do Start, mais:",
    itens: [
      "50 peças por mês",
      "Todas as áreas de atuação",
      "Quadro de prazos (kanban)",
      "Audiências, compromissos e prazos manuais",
      "Ajustes do rascunho pela Lia",
    ],
    chegando: recursosChegando,
    botao: "Começar",
    destaque: true,
  },
  {
    nome: "Sociedade",
    mensal: "R$ 219/mês",
    anual: "R$ 2.190/ano",
    publico: "Para dois advogados que dividem o escritório",
    inclui: "Tudo do Pro, para 2 advogados:",
    itens: [
      "2 advogados na mesma conta, com convite do sócio",
      "100 peças por mês, compartilhadas",
      "Todas as áreas de atuação",
      "Quadro e painel de prazos compartilhados",
      "Estilo próprio para cada advogado",
      "Responsável por prazo e por peça",
      'Filtro "Meus prazos", com todos os processos e prazos à vista dos dois',
    ],
    chegando: recursosChegando,
    botao: "Entrar na lista",
    emBreve: true,
  },
];

type Periodo = "mensal" | "anual";

function ListaRecursos({ inclui, itens, chegando }: Pick<Plano, "inclui" | "itens" | "chegando">) {
  return (
    <div className="flex flex-1 flex-col gap-3 text-sm">
      {inclui && <p className="font-semibold">{inclui}</p>}
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
    <div className="grid gap-4 lg:grid-cols-3">
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
            <ListaRecursos inclui={plano.inclui} itens={plano.itens} chegando={plano.chegando} />
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
