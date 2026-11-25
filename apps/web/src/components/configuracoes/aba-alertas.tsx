"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { salvarAlertas } from "@/app/app/configuracoes/alertas-acoes";
import { GrupoOpcoes } from "@/components/onboarding/grupo-opcoes";
import { usePlano } from "@/components/plano/provedor-plano";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MOMENTOS_ALERTA, type MomentoAlerta, type PreferenciasAlerta } from "@/lib/alertas";
import { CampoLeitura, Chips } from "./campo-leitura";
import { CartaoEditavel } from "./cartao-editavel";

const CANAIS = ["E-mail"] as const;
const ROTULOS = Object.values(MOMENTOS_ALERTA);
type Rotulo = (typeof ROTULOS)[number];
const codigoDoRotulo = Object.fromEntries(
  Object.entries(MOMENTOS_ALERTA).map(([codigo, rotulo]) => [rotulo, codigo]),
) as Record<Rotulo, MomentoAlerta>;

type EdicaoAlertasProps = {
  atual: PreferenciasAlerta;
  aoSalvar: (novas: PreferenciasAlerta) => void;
  aoCancelar: () => void;
};

function EdicaoAlertas({ atual, aoSalvar, aoCancelar }: EdicaoAlertasProps) {
  const [canais, setCanais] = useState<(typeof CANAIS)[number][]>(atual.email ? ["E-mail"] : []);
  const [dias, setDias] = useState<Rotulo[]>(atual.dias.map((codigo) => MOMENTOS_ALERTA[codigo]));
  const [salvando, iniciar] = useTransition();
  const { id } = usePlano();
  const planoStart = id === "start";
  const semAlerta = canais.length === 0 || dias.length === 0;

  function salvar() {
    const novas = {
      email: canais.includes("E-mail"),
      dias: dias.map((rotulo) => codigoDoRotulo[rotulo]),
    };
    iniciar(async () => {
      const resultado = await salvarAlertas(novas);
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      toast.success("Alertas salvos. O resumo chega por e-mail às 7h.");
      aoSalvar(novas);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <GrupoOpcoes
        legenda="Canais"
        opcoes={CANAIS}
        emBreve={planoStart ? [] : ["WhatsApp"]}
        valor={canais}
        aoMudar={setCanais}
      />
      {planoStart && (
        <p className="text-sm text-texto-secundario">
          Alertas por WhatsApp fazem parte do plano Pro.
        </p>
      )}
      <GrupoOpcoes legenda="Quando avisar" opcoes={ROTULOS} valor={dias} aoMudar={setDias} />
      {semAlerta && (
        <p role="status" className="rounded-md bg-atencao-fundo px-3 py-2 text-sm text-atencao">
          Sem canal ou antecedência, você não recebe aviso de prazo.
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={aoCancelar} disabled={salvando}>
          Cancelar
        </Button>
        <Button onClick={salvar} disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}

export function AbaAlertas({
  alertas,
  aoAbrirTermos,
}: {
  alertas: PreferenciasAlerta;
  aoAbrirTermos: () => void;
}) {
  const [atual, setAtual] = useState(alertas);
  const { plano } = usePlano();
  const semAlerta = !atual.email || atual.dias.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <CartaoEditavel
        titulo="Alertas de prazo"
        leitura={
          <div className="flex flex-col gap-3">
            <dl className="flex flex-col gap-3">
              <CampoLeitura rotulo="Canais">
                <Chips itens={atual.email ? ["E-mail"] : []} vazio="Nenhum canal ligado" />
              </CampoLeitura>
              <CampoLeitura rotulo="Quando avisar">
                <Chips
                  itens={atual.dias.map((codigo) => MOMENTOS_ALERTA[codigo])}
                  vazio="Nenhuma antecedência escolhida"
                />
              </CampoLeitura>
            </dl>
            {semAlerta ? (
              <p
                role="status"
                className="rounded-md bg-atencao-fundo px-3 py-2 text-sm text-atencao"
              >
                Sem canal ou antecedência, você não recebe aviso de prazo.
              </p>
            ) : (
              <p className="text-sm text-texto-secundario">O resumo chega por e-mail às 7h.</p>
            )}
            {plano.equipe && (
              <p className="rounded-md bg-primaria-fundo px-3 py-2 text-sm">
                Rede de segurança: se um prazo seguir aberto na véspera do prazo fatal, os dois
                advogados são avisados.
              </p>
            )}
          </div>
        }
        edicao={(fechar) => (
          <EdicaoAlertas
            atual={atual}
            aoCancelar={fechar}
            aoSalvar={(novas) => {
              setAtual(novas);
              fechar();
            }}
          />
        )}
      />
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex max-w-xl flex-col gap-1">
          <h3 className="text-base font-semibold">Busca de intimações nos diários</h3>
          <p className="text-sm text-texto-secundario">
            A busca da sua OAB e de outros nomes fica em Termos monitorados. Lá você liga, pausa e
            escolhe quem recebe cada intimação.
          </p>
        </div>
        <Button variant="outline" onClick={aoAbrirTermos}>
          Abrir termos monitorados
        </Button>
      </Card>
    </div>
  );
}
