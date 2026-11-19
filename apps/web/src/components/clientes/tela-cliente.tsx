"use client";

import { ArrowLeft, Mail, Pencil, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { editarCliente, juntarClientes } from "@/app/app/clientes/acoes";
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
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { DadosCliente } from "@/lib/cliente-tipos";
import type { ClienteResumo } from "@/lib/clientes";
import { mascararDocumento, tituloNome } from "@tesia/shared";
import { resumoCliente } from "@/lib/resumo-cliente";
import { AvatarCliente } from "./avatar-cliente";
import { EnviarAtualizacao } from "./enviar-atualizacao";
import { CardExtras } from "./card-extras";
import { CardProcesso } from "./card-processo";
import { CardQualificacao } from "./card-qualificacao";
import { FormularioCliente } from "./formulario-cliente";

type TelaClienteProps = {
  cliente: ClienteResumo;
  outros: { id: string; nome: string }[];
  movimentacao: { cnj: string; data: string; resumo: string } | null;
};

export function TelaCliente({ cliente, outros, movimentacao }: TelaClienteProps) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [juntando, setJuntando] = useState(false);
  const [duplicado, setDuplicado] = useState(outros[0]?.id ?? "");
  const [salvando, iniciar] = useTransition();
  const abertos = cliente.processos.filter((processo) => processo.etapa !== "encerrado");
  const encerrados = cliente.processos.filter((processo) => processo.etapa === "encerrado");

  async function salvar(dados: DadosCliente) {
    const resultado = await editarCliente(cliente.id, dados);
    if ("erro" in resultado) {
      toast.error(resultado.erro);
      return false;
    }
    toast.success("Dados do cliente salvos.");
    setEditando(false);
    router.refresh();
    return true;
  }

  function juntar() {
    iniciar(async () => {
      const resultado = await juntarClientes(cliente.id, duplicado);
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      toast.success("Clientes juntados. Os processos agora estão todos aqui.");
      setJuntando(false);
      router.refresh();
    });
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/app/clientes">
          <ArrowLeft aria-hidden />
          Voltar aos clientes
        </Link>
      </Button>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <AvatarCliente nome={cliente.nome} className="size-11 text-base" />
            <h1 className="text-2xl font-semibold text-titulo md:text-3xl">
              {tituloNome(cliente.nome)}
            </h1>
          </div>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-texto-secundario">
            {cliente.documento && (
              <span>{mascararDocumento(cliente.documento, cliente.tipo_pessoa)}</span>
            )}
            {cliente.contato?.telefone && (
              <span className="flex items-center gap-1">
                <Phone aria-hidden className="size-3.5" />
                {cliente.contato.telefone}
              </span>
            )}
            {cliente.contato?.email && (
              <span className="flex items-center gap-1">
                <Mail aria-hidden className="size-3.5" />
                {cliente.contato.email}
              </span>
            )}
            {!cliente.documento && !cliente.contato?.telefone && !cliente.contato?.email && (
              <span>Sem documento ou contato cadastrado</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <EnviarAtualizacao
            clienteId={cliente.id}
            nome={cliente.nome}
            telefone={cliente.contato?.telefone ?? null}
            movimentacao={movimentacao}
            proximoPrazo={resumoCliente(cliente).proximo?.vencimento ?? null}
          />
          <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
            <Pencil aria-hidden />
            Editar dados
          </Button>
          {outros.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setJuntando(true)}>
              Juntar com outro cliente
            </Button>
          )}
        </div>
      </header>
      <Card className="gap-3 p-4">
        <h2 className="text-lg font-semibold">
          {abertos.length === 1
            ? "1 processo em andamento"
            : `${abertos.length} processos em andamento`}
        </h2>
        {abertos.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {abertos.map((processo) => (
              <CardProcesso key={processo.id} processo={processo} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-texto-secundario">Nenhum processo em andamento.</p>
        )}
      </Card>
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <CardQualificacao cliente={cliente} />
        <CardExtras cliente={cliente} />
      </div>
      {encerrados.length > 0 && (
        <Card className="gap-3 p-4">
          <h2 className="text-lg font-semibold">Encerrados</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {encerrados.map((processo) => (
              <CardProcesso key={processo.id} processo={processo} />
            ))}
          </div>
        </Card>
      )}
      <Dialog open={editando} onOpenChange={setEditando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dados do cliente</DialogTitle>
            <DialogDescription>Usados só por você, para identificar o cliente.</DialogDescription>
          </DialogHeader>
          <FormularioCliente
            inicial={{
              tipo_pessoa: cliente.tipo_pessoa,
              nome: cliente.nome,
              documento: cliente.documento ?? "",
              telefone: cliente.contato?.telefone ?? "",
              email: cliente.contato?.email ?? "",
            }}
            aoSalvar={salvar}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={juntando} onOpenChange={setJuntando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Juntar com outro cliente</DialogTitle>
            <DialogDescription>
              Os processos do cliente escolhido passam para {cliente.nome}, e o cadastro duplicado é
              apagado.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cliente-duplicado">Cliente duplicado</Label>
            <SelectNativo
              id="cliente-duplicado"
              value={duplicado}
              onChange={(evento) => setDuplicado(evento.target.value)}
            >
              {outros.map((outro) => (
                <option key={outro.id} value={outro.id}>
                  {tituloNome(outro.nome)}
                </option>
              ))}
            </SelectNativo>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJuntando(false)}>
              Cancelar
            </Button>
            <Button onClick={juntar} disabled={salvando || !duplicado}>
              {salvando ? "Juntando..." : "Juntar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
