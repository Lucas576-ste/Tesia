import type { ReactNode } from "react";
import { AreaUpload } from "@/components/area-upload";
import { CardIndicador } from "@/components/card-indicador";
import { EstadoCarregando } from "@/components/estado-carregando";
import { EstadoVazio } from "@/components/estado-vazio";
import { prazosExemplo } from "@/components/layout/dados-exemplo";
import { FaixaAlertaPrazo } from "@/components/layout/faixa-alerta-prazo";
import { UsoMes } from "@/components/layout/uso-mes";
import { SeloStatus } from "@/components/selo-status";
import { TabelaPrazos } from "@/components/tabela-prazos";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExemploEstadoErro, ExemploModal, ExemploToast } from "./exemplos-interativos";

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}

export default function ComponentesPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <h1 className="text-2xl font-semibold">Componentes</h1>

      <Secao titulo="Faixa de alerta">
        <div className="flex flex-col gap-2 overflow-hidden rounded-xl">
          <FaixaAlertaPrazo
            peca="Contestação"
            partes="Banco X x Maria Souza"
            prazo="em 2 dias úteis (06/11)"
            href="/app/intimacoes/1"
          />
          <FaixaAlertaPrazo
            variante="hoje"
            peca="Manifestação sobre cálculos"
            partes="João Lima x Construtora Y"
            prazo="hoje (04/11)"
            href="/app/intimacoes/2"
          />
        </div>
      </Secao>

      <Secao titulo="Botões">
        <div className="flex flex-wrap gap-2">
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="outline">Contorno</Button>
          <Button variant="ghost">Discreto</Button>
          <Button variant="destructive">Destrutivo</Button>
          <Button disabled>Desativado</Button>
          <Button disabled variant="destructive">
            Destrutivo desativado
          </Button>
        </div>
      </Secao>

      <Secao titulo="Cards">
        <div className="grid gap-3 sm:grid-cols-3">
          <CardIndicador
            tipo="vencimento"
            rotulo="Vencem em até 3 dias"
            valor={3}
            href="/app?periodo=3-dias"
          />
          <CardIndicador
            tipo="rascunho"
            rotulo="Rascunhos para revisar"
            valor={2}
            href="/app?status=rascunho_pronto"
          />
          <CardIndicador
            tipo="protocolado"
            rotulo="Protocolados no mês"
            valor={12}
            href="/app?status=protocolado"
          />
        </div>
      </Secao>

      <Secao titulo="Uso do mês">
        <div className="flex flex-wrap gap-6">
          <UsoMes usadas={32} limite={50} />
          <UsoMes usadas={40} limite={50} />
          <UsoMes usadas={50} limite={50} />
        </div>
      </Secao>

      <Secao titulo="Selos de status">
        <div className="flex flex-wrap gap-2">
          <SeloStatus status="nao_iniciado" />
          <SeloStatus status="rascunho_pronto" />
          <SeloStatus status="protocolado" />
        </div>
      </Secao>

      <Secao titulo="Tabela">
        <Card className="gap-0 py-0">
          <TabelaPrazos prazos={prazosExemplo} />
        </Card>
      </Secao>

      <Secao titulo="Área de upload">
        <AreaUpload />
      </Secao>

      <Secao titulo="Modal">
        <div>
          <ExemploModal />
        </div>
      </Secao>

      <Secao titulo="Toast">
        <ExemploToast />
      </Secao>

      <Secao titulo="Estado de carregando">
        <EstadoCarregando />
      </Secao>

      <Secao titulo="Estado vazio">
        <EstadoVazio
          titulo="Envie sua primeira intimação"
          descricao="Os prazos confirmados aparecem aqui."
          acao={<Button>Nova intimação</Button>}
        />
      </Secao>

      <Secao titulo="Estado de erro">
        <ExemploEstadoErro />
      </Secao>
    </div>
  );
}
