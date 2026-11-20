"use client";

import { useEffect, useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { presetsDePrazo, sugerirPrazo } from "@/app/app/acoes-prazos";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import { isoParaData } from "@/lib/prazo-interno";
import { rotuloPreset, type PrazoManual, type PresetPrazo } from "@/lib/prazo-manual";

type Forma = "diario" | "portal";
type Sugestao = { inicio: string; vencimento: string; memoria: string[] };
type Resposta = { chave: string; sugestao: Sugestao | null; erro: string };

const OUTRO = "outro";

function diaDaSemana(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long" });
}

export function CalculoPrazo({
  form,
  processoId,
  hoje,
}: {
  form: UseFormReturn<PrazoManual>;
  processoId: string;
  hoje: string;
}) {
  const [presets, setPresets] = useState<PresetPrazo[]>([]);
  const [forma, setForma] = useState<Forma>("diario");
  const [marco, setMarco] = useState("");
  const [abertura, setAbertura] = useState("");
  const [escolha, setEscolha] = useState("");
  const [diasOutro, setDiasOutro] = useState("15");
  const [contagemOutro, setContagemOutro] = useState<"uteis" | "corridos">("uteis");
  const [resposta, setResposta] = useState<Resposta | null>(null);
  const dataFatal = useWatch({ control: form.control, name: "data" });

  useEffect(() => {
    let ativo = true;
    presetsDePrazo().then((lista) => {
      if (ativo) setPresets(lista);
    });
    return () => {
      ativo = false;
    };
  }, []);

  const preset = presets.find(({ id }) => id === escolha);
  const dias = Number(diasOutro);
  const outro = escolha === OUTRO;
  const regraDias = outro ? (Number.isInteger(dias) && dias > 0 ? dias : 0) : (preset?.dias ?? 0);
  const regraContagem = outro ? contagemOutro : (preset?.contagem ?? "uteis");
  const regraFundamento = outro ? "" : (preset?.fundamento ?? "");
  const regraId = outro ? "" : (preset?.id ?? "");
  const aberturaUsada = forma === "portal" ? abertura : "";
  const pronto = Boolean(marco) && regraDias > 0;
  const chave = pronto
    ? JSON.stringify([forma, marco, aberturaUsada, regraDias, regraContagem, regraId, processoId])
    : "";

  useEffect(() => {
    if (!pronto) return;
    let ativo = true;
    const entrada = {
      forma,
      marco,
      abertura: aberturaUsada,
      dias: regraDias,
      contagem: regraContagem,
      fundamento: regraFundamento,
      regraId,
    };
    const espera = setTimeout(async () => {
      const resultado = await sugerirPrazo({ ...entrada, processoId });
      if (!ativo) return;
      if ("erro" in resultado) {
        setResposta({ chave, sugestao: null, erro: resultado.erro });
        form.setValue("calculo", undefined);
        return;
      }
      setResposta({ chave, sugestao: resultado, erro: "" });
      form.setValue("data", resultado.vencimento, { shouldValidate: true });
      form.setValue("inicio", resultado.inicio);
      form.setValue("calculo", entrada);
    }, 300);
    return () => {
      ativo = false;
      clearTimeout(espera);
    };
  }, [
    pronto,
    chave,
    forma,
    marco,
    aberturaUsada,
    regraDias,
    regraContagem,
    regraFundamento,
    regraId,
    processoId,
    form,
  ]);

  const atual = resposta && resposta.chave === chave ? resposta : null;
  const calculando = Boolean(chave) && !atual;
  const sugestao = atual?.sugestao ?? null;
  const alterada = Boolean(sugestao) && dataFatal !== sugestao?.vencimento;
  const jaVenceu = Boolean(sugestao) && (sugestao?.vencimento ?? "") < hoje;

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="calculo-forma">Como foi intimado</Label>
          <SelectNativo
            id="calculo-forma"
            value={forma}
            onChange={(evento) => setForma(evento.target.value as Forma)}
          >
            <option value="diario">Diário de Justiça</option>
            <option value="portal">Portal do tribunal (PJe, e-SAJ)</option>
          </SelectNativo>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="calculo-marco">
            {forma === "diario" ? "Data da publicação" : "Data do envio"}
          </Label>
          <Input
            id="calculo-marco"
            type="date"
            value={marco}
            onChange={(evento) => setMarco(evento.target.value)}
          />
        </div>
        {forma === "portal" && (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="calculo-abertura">Data em que você abriu a intimação (opcional)</Label>
            <Input
              id="calculo-abertura"
              type="date"
              value={abertura}
              onChange={(evento) => setAbertura(evento.target.value)}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="calculo-atalho">Prazo</Label>
        <SelectNativo
          id="calculo-atalho"
          value={escolha}
          onChange={(evento) => setEscolha(evento.target.value)}
        >
          <option value="">Escolha um atalho</option>
          {presets.map((item) => (
            <option key={item.id} value={item.id}>
              {rotuloPreset(item)}
            </option>
          ))}
          <option value={OUTRO}>Outro prazo (informar os dias)</option>
        </SelectNativo>
        {preset && !preset.revisada && (
          <p className="text-xs text-atencao">
            Regra em validação com advogado. Confira o resultado.
          </p>
        )}
      </div>
      {escolha === OUTRO && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="calculo-dias">Dias</Label>
            <Input
              id="calculo-dias"
              type="number"
              min={1}
              max={365}
              value={diasOutro}
              onChange={(evento) => setDiasOutro(evento.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="calculo-contagem">Contagem</Label>
            <SelectNativo
              id="calculo-contagem"
              value={contagemOutro}
              onChange={(evento) => setContagemOutro(evento.target.value as "uteis" | "corridos")}
            >
              <option value="uteis">Dias úteis</option>
              <option value="corridos">Dias corridos</option>
            </SelectNativo>
          </div>
        </div>
      )}
      <div aria-live="polite" className="text-sm">
        {calculando && <p className="text-texto-secundario">Calculando...</p>}
        {atual?.erro && <p className="text-erro">{atual.erro}</p>}
        {sugestao && (
          <div className="flex flex-col gap-1">
            <p className="font-medium">
              Sugestão de vencimento: {isoParaData(sugestao.vencimento)} (
              {diaDaSemana(sugestao.vencimento)})
            </p>
            {alterada && (
              <p className="text-xs text-atencao">
                Você alterou a sugestão de {isoParaData(sugestao.vencimento)}. Vamos gravar a sua
                data.
              </p>
            )}
            {jaVenceu && (
              <p className="text-xs text-erro">
                Esse prazo já venceu em {isoParaData(sugestao.vencimento)}.
              </p>
            )}
            <details className="text-xs text-texto-secundario">
              <summary className="cursor-pointer font-medium text-primaria">Ver a conta</summary>
              <ul className="mt-1 list-disc pl-4">
                {sugestao.memoria.map((linha) => (
                  <li key={linha}>{linha}</li>
                ))}
              </ul>
            </details>
          </div>
        )}
        {!processoId && (
          <p className="mt-1 text-xs text-texto-secundario">
            Sem processo escolhido, uso os feriados nacionais e o recesso. Escolha o processo para
            incluir os feriados do tribunal.
          </p>
        )}
      </div>
    </div>
  );
}
