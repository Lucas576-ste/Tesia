"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { track } from "@/lib/medicao";
import { cn } from "@/lib/utils";
import { CTA_TESTE } from "./cta";

type Plano = {
  nome: string;
  mensal: string;
  anual: string;
  publico: string;
  inclui?: string;
  itens: string[];
  destaque?: boolean;
};

const planos: Plano[] = [
  {
    nome: "Teste grátis",
    mensal: "R$ 0",
    anual: "R$ 0",
    publico: "11 dias com tudo do Individual liberado. Sem cartão.",
    itens: [
      "11 dias grátis",
      "7 peças por dia",
      "Tudo do plano Individual",
      "Sem cartão e sem cobrança automática no fim",
      "Escolha um plano só se gostar",
    ],
  },
  {
    nome: "Individual",
    mensal: "R$ 129/mês",
    anual: "R$ 1.290/ano",
    publico: "Para o advogado que trabalha sozinho.",
    itens: [
      "7 peças por dia",
      "100 processos monitorados (push)",
      "1 advogado",
      "Intimações automáticas pelo DJEN e envio de PDF",
      "Prazo com a conta, prazo interno e fatal",
      "Rascunho no seu estilo, com pontos a conferir",
      ".docx com o seu timbrado",
      "Clientes e processos fase a fase",
      "Painel, quadro, alertas e agenda no celular",
      "8 áreas de atuação",
    ],
    destaque: true,
  },
  {
    nome: "Sócio",
    mensal: "R$ 219/mês",
    anual: "R$ 2.190/ano",
    publico: "Para dois advogados que dividem o trabalho. R$ 109,50 por advogado.",
    inclui: "Tudo do Individual, para 2 advogados:",
    itens: [
      "15 peças por dia",
      "300 processos monitorados (push)",
      "2 advogados",
      "Estilo próprio para cada advogado",
      'Responsável por prazo e "Meus prazos"',
      "Se um prazo ficar para trás, os dois são avisados",
    ],
  },
];

type Periodo = "mensal" | "anual";

function CardPlano({ plano, periodo }: { plano: Plano; periodo: Periodo }) {
  return (
    <Card className={cn(plano.destaque && "border-2 border-primaria")}>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-xl">{plano.nome}</CardTitle>
          {plano.destaque && (
            <Badge className="brilho-selo border-transparent bg-destaque text-menu">
              Mais escolhido
            </Badge>
          )}
        </div>
        <CardDescription>{plano.publico}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="font-serif text-2xl font-semibold tabular-nums">{plano[periodo]}</p>
        <div className="flex flex-1 flex-col gap-3 text-sm">
          {plano.inclui && <p className="font-semibold">{plano.inclui}</p>}
          <ul className="flex flex-col gap-1.5">
            {plano.itens.map((item) => (
              <li key={item} className="flex gap-2">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-sucesso" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Button asChild variant={plano.destaque ? "default" : "outline"} className="w-full">
          <a href={CTA_TESTE.href} onClick={() => track("cta_teste_click")}>
            {CTA_TESTE.texto}
          </a>
        </Button>
      </CardContent>
    </Card>
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
      {(["mensal", "anual"] as const).map((valor) => (
        <TabsContent key={valor} value={valor}>
          <div className="grid gap-4 lg:grid-cols-3">
            {planos.map((plano) => (
              <CardPlano key={plano.nome} plano={plano} periodo={valor} />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
