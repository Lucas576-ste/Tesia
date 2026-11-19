"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { track } from "@/lib/medicao";
import { cn } from "@/lib/utils";
import { CTA_TESTE } from "./cta";

type Plano = {
  nome: string;
  mensal: string;
  anual: string;
  publico: string;
  numeros: { valor: string; rotulo: string }[];
  itens: string[];
  botao: string;
  destaque?: boolean;
  teste?: boolean;
};

const comuns = [
  "Intimações automáticas pelo DJEN e envio de PDF",
  "Prazo com a conta, prazo interno e fatal",
  "Rascunho no seu estilo, com pontos a conferir",
  ".docx com o seu timbrado",
  "Clientes e processos fase a fase",
  "Painel, quadro, alertas e agenda no celular",
  "8 áreas de atuação",
];

const planos: Plano[] = [
  {
    nome: "Teste grátis",
    mensal: "R$ 0",
    anual: "R$ 0",
    publico: "11 dias com tudo do Individual liberado. Sem cartão.",
    numeros: [
      { valor: "11", rotulo: "dias grátis" },
      { valor: "7", rotulo: "peças por dia" },
      { valor: "0", rotulo: "cartão de crédito" },
    ],
    itens: [
      "Tudo do plano Individual",
      "Sem cobrança automática no fim",
      "Escolha um plano só se gostar",
    ],
    botao: CTA_TESTE.texto,
    teste: true,
  },
  {
    nome: "Individual",
    mensal: "R$ 129/mês",
    anual: "R$ 1.290/ano",
    publico: "Para o advogado que trabalha sozinho.",
    numeros: [
      { valor: "7", rotulo: "peças por dia" },
      { valor: "100", rotulo: "processos com push" },
      { valor: "1", rotulo: "advogado" },
    ],
    itens: comuns,
    botao: CTA_TESTE.texto,
    destaque: true,
  },
  {
    nome: "Sócio",
    mensal: "R$ 219/mês",
    anual: "R$ 2.190/ano",
    publico: "Para dois advogados que dividem o trabalho. R$ 109,50 por advogado.",
    numeros: [
      { valor: "15", rotulo: "peças por dia" },
      { valor: "300", rotulo: "processos com push" },
      { valor: "2", rotulo: "advogados" },
    ],
    itens: [
      "Tudo do Individual, para 2 advogados",
      "Estilo próprio para cada advogado",
      'Responsável por prazo e "Meus prazos"',
      "Se um prazo ficar para trás, os dois são avisados",
    ],
    botao: CTA_TESTE.texto,
  },
];

type Periodo = "mensal" | "anual";

function CardPlano({ plano, periodo }: { plano: Plano; periodo: Periodo }) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-sm",
        plano.destaque && "border-2 border-primary shadow-lg",
        plano.teste && "bg-primaria-fundo",
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-2xl font-bold">{plano.nome}</h3>
          {plano.destaque && (
            <Badge className="brilho-selo border-transparent bg-destaque text-menu">
              Mais escolhido
            </Badge>
          )}
        </div>
        <p className="text-base text-texto-secundario">{plano.publico}</p>
      </div>
      <p className="text-4xl font-extrabold tabular-nums">{plano[periodo]}</p>
      <dl className="grid grid-cols-3 gap-2 rounded-xl bg-fundo/70 p-3 text-center">
        {plano.numeros.map(({ valor, rotulo }) => (
          <div key={rotulo} className="flex flex-col">
            <dd className="order-1 text-2xl font-extrabold text-primaria tabular-nums">{valor}</dd>
            <dt className="order-2 text-xs leading-tight font-medium text-texto-secundario">
              {rotulo}
            </dt>
          </div>
        ))}
      </dl>
      <ul className="flex flex-1 flex-col gap-2 text-base">
        {plano.itens.map((item) => (
          <li key={item} className="flex gap-2">
            <Check aria-hidden className="mt-1 size-4 shrink-0 text-sucesso" />
            {item}
          </li>
        ))}
      </ul>
      <Button
        asChild
        size="lg"
        variant={plano.destaque || plano.teste ? "default" : "outline"}
        className="w-full"
      >
        <a href={CTA_TESTE.href} onClick={() => track("cta_teste_click")}>
          {plano.botao}
        </a>
      </Button>
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
      {(["mensal", "anual"] as const).map((valor) => (
        <TabsContent key={valor} value={valor} className="pt-2">
          <div className="grid gap-5 lg:grid-cols-3">
            {planos.map((plano) => (
              <CardPlano key={plano.nome} plano={plano} periodo={valor} />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
