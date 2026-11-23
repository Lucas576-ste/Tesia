"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { adicionarFeriado, removerFeriado } from "@/app/app/configuracoes/calendario-acoes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import {
  rotuloDoEscopo,
  rotuloDoItem,
  textoAvisoPrazos,
  type ItemCalendario,
} from "@/lib/calendario-proprio";

type AbaCalendarioProps = { itens: ItemCalendario[]; tribunais: string[] };
type Erro = { texto: string; campo?: "data" | "ate" };

export function AbaCalendario({ itens, tribunais }: AbaCalendarioProps) {
  const [data, setData] = useState("");
  const [ate, setAte] = useState("");
  const [tribunal, setTribunal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState<Erro | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [removendo, setRemovendo] = useState<ItemCalendario | null>(null);
  const [salvando, salvar] = useTransition();
  const [apagando, apagar] = useTransition();

  function adicionar(evento: FormEvent) {
    evento.preventDefault();
    setAviso(null);
    salvar(async () => {
      const resultado = await adicionarFeriado({ data, ate, tribunal, descricao });
      if ("erro" in resultado) {
        setErro({ texto: resultado.erro, campo: resultado.campo });
        return;
      }
      setErro(null);
      setData("");
      setAte("");
      setTribunal("");
      setDescricao("");
      setAviso(textoAvisoPrazos(resultado.afetados));
      toast.success("Adicionado. Os próximos cálculos já usam essa data.");
    });
  }

  function remover() {
    const alvo = removendo;
    if (!alvo) return;
    apagar(async () => {
      const resultado = await removerFeriado(alvo.id, alvo.tipo);
      setRemovendo(null);
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      setAviso(null);
      toast.success("Removido. Os próximos cálculos voltam a ignorar essa data.");
    });
  }

  return (
    <Card className="flex flex-col gap-4 p-4">
      <p className="text-sm text-texto-secundario">
        Feriados e suspensões do seu tribunal que não estão na lista da Tesia. Valem nos próximos
        cálculos de prazo. Para uma suspensão de vários dias, preencha também a data final.
      </p>
      <form noValidate onSubmit={adicionar} className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="feriado-data">Data</Label>
          <Input
            id="feriado-data"
            type="date"
            value={data}
            aria-invalid={erro?.campo === "data"}
            onChange={(evento) => setData(evento.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="feriado-ate">Até (só se for um período)</Label>
          <Input
            id="feriado-ate"
            type="date"
            value={ate}
            min={data || undefined}
            aria-invalid={erro?.campo === "ate"}
            onChange={(evento) => setAte(evento.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="feriado-tribunal">Vale para</Label>
          <SelectNativo
            id="feriado-tribunal"
            value={tribunal}
            onChange={(evento) => setTribunal(evento.target.value)}
          >
            <option value="">Todos os meus processos</option>
            {tribunais.map((nome) => (
              <option key={nome} value={nome}>
                Só processos do {nome}
              </option>
            ))}
          </SelectNativo>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="feriado-descricao">Descrição</Label>
          <Input
            id="feriado-descricao"
            value={descricao}
            maxLength={120}
            onChange={(evento) => setDescricao(evento.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" variant="outline" disabled={salvando}>
            {salvando ? "Salvando..." : "Adicionar"}
          </Button>
        </div>
      </form>
      {erro && (
        <p role="alert" className="text-sm text-erro">
          {erro.texto}
        </p>
      )}
      {aviso && (
        <p
          role="status"
          className="rounded-md border border-atencao/40 bg-atencao-fundo/40 p-3 text-sm"
        >
          {aviso}{" "}
          <Link href="/app/prazos" className="font-medium text-primaria hover:underline">
            Ver prazos
          </Link>
        </p>
      )}
      {itens.length === 0 ? (
        <p className="text-sm text-texto-secundario">Nenhum feriado próprio cadastrado.</p>
      ) : (
        <ul className="rounded-md border">
          {itens.map((item) => (
            <li
              key={`${item.tipo}-${item.id}`}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b p-2 text-sm last:border-b-0"
            >
              <span className="shrink-0 tabular-nums sm:w-44">{rotuloDoItem(item)}</span>
              <span className="order-last w-full break-words sm:order-none sm:min-w-0 sm:w-auto sm:flex-1">
                {item.descricao}
              </span>
              <Badge variant="secondary" className="ml-auto shrink-0 sm:ml-0">
                {rotuloDoEscopo(item.tribunal)}
              </Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remover ${item.descricao}`}
                onClick={() => setRemovendo(item)}
              >
                <X aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={Boolean(removendo)} onOpenChange={(aberto) => !aberto && setRemovendo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover {removendo?.descricao}?</DialogTitle>
            <DialogDescription>
              Os próximos cálculos deixam de contar essa data. Prazos já calculados não mudam
              sozinhos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemovendo(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={remover} disabled={apagando}>
              {apagando ? "Removendo..." : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
