"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { criarCliente, trocarClienteDoProcesso } from "@/app/app/clientes/acoes";
import { Button } from "@/components/ui/button";
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

type EscolherClienteProps = {
  processoId: string;
  clienteAtual: string | null;
  clientes: { id: string; nome: string }[];
  rotulo?: string;
};

const NOVO = "__novo__";

export function EscolherCliente({
  processoId,
  clienteAtual,
  clientes,
  rotulo = "Trocar cliente",
}: EscolherClienteProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [escolha, setEscolha] = useState(clienteAtual ?? clientes[0]?.id ?? NOVO);
  const [nome, setNome] = useState("");
  const [salvando, iniciar] = useTransition();

  function salvar() {
    iniciar(async () => {
      let clienteId = escolha;
      if (escolha === NOVO) {
        const criado = await criarCliente({ nome, origem: "outro" });
        if ("erro" in criado || !criado.id) {
          toast.error("erro" in criado ? criado.erro : "Não foi possível cadastrar.");
          return;
        }
        clienteId = criado.id;
      }
      const resultado = await trocarClienteDoProcesso(processoId, clienteId);
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      toast.success("Cliente do processo atualizado.");
      setAberto(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setAberto(true)}>
        {rotulo}
      </Button>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>De qual cliente é este processo?</DialogTitle>
            <DialogDescription>
              Escolha um cliente que você já tem ou cadastre um novo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="escolha-cliente">Cliente</Label>
              <SelectNativo
                id="escolha-cliente"
                value={escolha}
                onChange={(evento) => setEscolha(evento.target.value)}
              >
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
                <option value={NOVO}>+ Novo cliente</option>
              </SelectNativo>
            </div>
            {escolha === NOVO && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nome-novo-cliente">Nome do novo cliente</Label>
                <Input
                  id="nome-novo-cliente"
                  value={nome}
                  onChange={(evento) => setNome(evento.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={salvar}
              disabled={salvando || (escolha === NOVO && nome.trim().length < 2)}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
