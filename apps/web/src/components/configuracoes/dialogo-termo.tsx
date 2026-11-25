"use client";

import { mascararDocumento, somenteDigitos } from "@tesia/shared";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { consultarCnpj } from "@/app/app/clientes/acoes";
import { alterarTermo, criarTermo } from "@/app/app/configuracoes/termos-acoes";
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
import { UFS } from "@/lib/lead";
import {
  TIPOS_TERMO,
  termoEntradaSchema,
  type Responsavel,
  type Termo,
  type TipoTermo,
} from "@/lib/termos";
import { cn } from "@/lib/utils";

type DialogoTermoProps = {
  aberto: boolean;
  termo: Termo | null;
  responsaveis: Responsavel[];
  responsavelPadrao: string;
  aoFechar: () => void;
};

function SeletorUfs({ valor, aoMudar }: { valor: string[]; aoMudar: (ufs: string[]) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>Estados dos diários oficiais</Label>
      <div className="flex flex-wrap gap-1">
        {UFS.map((uf) => {
          const marcada = valor.includes(uf);
          return (
            <button
              key={uf}
              type="button"
              aria-pressed={marcada}
              onClick={() =>
                aoMudar(marcada ? valor.filter((item) => item !== uf) : [...valor, uf])
              }
              className={cn(
                "rounded-md border px-2 py-1 text-xs font-medium",
                marcada ? "border-primaria bg-primaria-fundo" : "bg-card text-texto-secundario",
              )}
            >
              {uf}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-texto-secundario">
        Sem nenhum estado marcado, a Tesia busca em todos os tribunais.
      </p>
    </div>
  );
}

export function DialogoTermo({
  aberto,
  termo,
  responsaveis,
  responsavelPadrao,
  aoFechar,
}: DialogoTermoProps) {
  const [tipo, setTipo] = useState<TipoTermo>(termo?.tipo ?? "advogado");
  const [oabNumero, setOabNumero] = useState("");
  const [oabUf, setOabUf] = useState("");
  const [documento, setDocumento] = useState("");
  const [nome, setNome] = useState(termo?.nome ?? "");
  const [ufs, setUfs] = useState<string[]>(termo?.ufs ?? []);
  const [responsavelId, setResponsavelId] = useState(termo?.responsavelId ?? responsavelPadrao);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();
  const [consultando, consultar] = useTransition();
  const edicao = termo !== null;
  const ehPessoa = tipo !== "advogado";

  function buscarCnpj() {
    consultar(async () => {
      const resultado = await consultarCnpj(documento);
      if ("erro" in resultado) {
        setErro(resultado.erro);
        return;
      }
      setErro(null);
      setNome(resultado.dados.nome);
    });
  }

  function salvar() {
    setErro(null);
    iniciar(async () => {
      if (termo) {
        const resultado = await alterarTermo({
          id: termo.id,
          nome: nome.trim() || null,
          ufs: ufs as never,
          responsavelId,
        });
        if ("erro" in resultado) return setErro(resultado.erro);
        toast.success("Termo atualizado.");
        return aoFechar();
      }
      const entrada = termoEntradaSchema.safeParse({
        tipo,
        oabNumero,
        oabUf: oabUf || undefined,
        documento,
        nome,
        ufs,
        responsavelId,
      });
      if (!entrada.success) return setErro(entrada.error.issues[0]?.message ?? "Dados inválidos.");
      const resultado = await criarTermo(entrada.data);
      if ("erro" in resultado) return setErro(resultado.erro);
      toast.success("Termo cadastrado. A busca começa em alguns minutos.");
      aoFechar();
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={(valor) => !valor && aoFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{edicao ? "Editar termo" : "Novo termo monitorado"}</DialogTitle>
          <DialogDescription>
            A Tesia procura publicações com este termo nos diários oficiais e traz as intimações
            para você.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {!edicao && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tipo-termo">Tipo</Label>
              <SelectNativo
                id="tipo-termo"
                value={tipo}
                onChange={(evento) => setTipo(evento.target.value as TipoTermo)}
              >
                {Object.entries(TIPOS_TERMO).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>
                    {rotulo}
                  </option>
                ))}
              </SelectNativo>
            </div>
          )}
          {!edicao && !ehPessoa && (
            <div className="grid grid-cols-[1fr_6rem] gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="oab-numero">Número da OAB</Label>
                <Input
                  id="oab-numero"
                  inputMode="numeric"
                  value={oabNumero}
                  onChange={(evento) => setOabNumero(evento.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="oab-uf">UF</Label>
                <SelectNativo
                  id="oab-uf"
                  value={oabUf}
                  onChange={(evento) => setOabUf(evento.target.value)}
                >
                  <option value="">--</option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </SelectNativo>
              </div>
            </div>
          )}
          {!edicao && ehPessoa && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="documento-termo">{tipo === "pf" ? "CPF" : "CNPJ"}</Label>
              <div className="flex gap-2">
                <Input
                  id="documento-termo"
                  inputMode="numeric"
                  value={mascararDocumento(documento, tipo as "pf" | "pj")}
                  onChange={(evento) => setDocumento(somenteDigitos(evento.target.value))}
                />
                {tipo === "pj" && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={consultando || somenteDigitos(documento).length !== 14}
                    onClick={buscarCnpj}
                  >
                    {consultando ? "Buscando..." : "Buscar dados"}
                  </Button>
                )}
              </div>
            </div>
          )}
          {(ehPessoa || edicao) && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome-termo">Nome usado na busca</Label>
              <Input
                id="nome-termo"
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
              />
              {ehPessoa && (
                <p className="text-xs text-texto-secundario">
                  O diário oficial não permite buscar por CPF ou CNPJ, então a busca é pelo nome.
                  Nomes comuns podem trazer publicações de homônimos.
                </p>
              )}
            </div>
          )}
          <SeletorUfs valor={ufs} aoMudar={setUfs} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="responsavel-termo">Responsável pelas intimações</Label>
            <SelectNativo
              id="responsavel-termo"
              value={responsavelId}
              onChange={(evento) => setResponsavelId(evento.target.value)}
            >
              {responsaveis.map(({ id, nome: nomeResponsavel }) => (
                <option key={id} value={id}>
                  {nomeResponsavel}
                </option>
              ))}
            </SelectNativo>
          </div>
          {erro && (
            <p role="alert" className="text-sm text-erro">
              {erro}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
