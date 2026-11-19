"use client";

import {
  ESTADOS_CIVIS,
  mascararCpf,
  qualificacaoSchema,
  somenteDigitos,
  textoQualificacao,
  type Qualificacao,
} from "@tesia/shared";
import { useState, useTransition } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";

type FormularioQualificacaoProps = {
  cliente: {
    nome: string;
    documento: string | null;
    tipo_pessoa: "pf" | "pj";
    qualificacao: unknown;
  };
  aoSalvar: (dados: Qualificacao) => Promise<boolean>;
};

type Endereco = Qualificacao["endereco"];

const viaCepSchema = z.object({
  logradouro: z.string(),
  bairro: z.string(),
  localidade: z.string(),
  uf: z.string(),
  erro: z.unknown().optional(),
});

function Campo({
  id,
  rotulo,
  valor,
  aoMudar,
  className,
  ...resto
}: {
  id: string;
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  className?: string;
  placeholder?: string;
  inputMode?: "numeric";
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <Label htmlFor={id}>{rotulo}</Label>
      <Input id={id} value={valor} onChange={(evento) => aoMudar(evento.target.value)} {...resto} />
    </div>
  );
}

export function FormularioQualificacao({ cliente, aoSalvar }: FormularioQualificacaoProps) {
  const inicial = qualificacaoSchema.parse(cliente.qualificacao ?? {});
  const [dados, setDados] = useState<Qualificacao>({
    ...inicial,
    nacionalidade: inicial.nacionalidade || (cliente.tipo_pessoa === "pf" ? "brasileiro(a)" : ""),
  });
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [salvando, iniciar] = useTransition();
  const pf = cliente.tipo_pessoa === "pf";

  const mudar = <K extends keyof Qualificacao>(chave: K, valor: Qualificacao[K]) =>
    setDados((atual) => ({ ...atual, [chave]: valor }));
  const mudarEndereco = (chave: keyof Endereco, valor: string) =>
    setDados((atual) => ({ ...atual, endereco: { ...atual.endereco, [chave]: valor } }));

  async function buscarCep(valor: string) {
    const digitos = somenteDigitos(valor).slice(0, 8);
    mudarEndereco("cep", digitos.replace(/(\d{5})(\d)/, "$1-$2"));
    if (digitos.length !== 8) return;
    setBuscandoCep(true);
    const json = await fetch(`https://viacep.com.br/ws/${digitos}/json/`)
      .then((resposta) => resposta.json())
      .then((corpo) => viaCepSchema.safeParse(corpo))
      .catch(() => null);
    setBuscandoCep(false);
    if (!json?.success || json.data.erro) return;
    setDados((atual) => ({
      ...atual,
      endereco: {
        ...atual.endereco,
        logradouro: json.data.logradouro || atual.endereco.logradouro,
        bairro: json.data.bairro || atual.endereco.bairro,
        cidade: json.data.localidade,
        uf: json.data.uf,
      },
    }));
  }

  const e = dados.endereco;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(evento) => {
        evento.preventDefault();
        iniciar(async () => {
          await aoSalvar(dados);
        });
      }}
    >
      {pf ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo id="q-rg" rotulo="RG" valor={dados.rg} aoMudar={(v) => mudar("rg", v)} />
          <Campo
            id="q-rg-orgao"
            rotulo="Órgão emissor"
            placeholder="SSP/DF"
            valor={dados.rg_orgao}
            aoMudar={(v) => mudar("rg_orgao", v)}
          />
          <Campo
            id="q-nacionalidade"
            rotulo="Nacionalidade"
            valor={dados.nacionalidade}
            aoMudar={(v) => mudar("nacionalidade", v)}
          />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="q-estado-civil">Estado civil</Label>
            <SelectNativo
              id="q-estado-civil"
              value={dados.estado_civil}
              onChange={(evento) =>
                mudar("estado_civil", evento.target.value as Qualificacao["estado_civil"])
              }
            >
              <option value="">Escolha</option>
              {Object.entries(ESTADOS_CIVIS).map(([valor, texto]) => (
                <option key={valor} value={valor}>
                  {texto}
                </option>
              ))}
            </SelectNativo>
          </div>
          <Campo
            id="q-profissao"
            rotulo="Profissão"
            className="sm:col-span-2"
            valor={dados.profissao}
            aoMudar={(v) => mudar("profissao", v)}
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo
            id="q-fantasia"
            rotulo="Nome fantasia"
            className="sm:col-span-2"
            valor={dados.nome_fantasia}
            aoMudar={(v) => mudar("nome_fantasia", v)}
          />
          <Campo
            id="q-rep-nome"
            rotulo="Representante legal"
            className="sm:col-span-2"
            valor={dados.representante_nome}
            aoMudar={(v) => mudar("representante_nome", v)}
          />
          <Campo
            id="q-rep-cpf"
            rotulo="CPF do representante"
            inputMode="numeric"
            valor={dados.representante_cpf}
            aoMudar={(v) => mudar("representante_cpf", mascararCpf(v))}
          />
          <Campo
            id="q-rep-cargo"
            rotulo="Cargo"
            placeholder="sócio-administrador"
            valor={dados.representante_cargo}
            aoMudar={(v) => mudar("representante_cargo", v)}
          />
        </div>
      )}
      <fieldset className="grid gap-3 sm:grid-cols-6">
        <legend className="mb-2 text-sm font-semibold">
          {pf ? "Endereço" : "Endereço da sede"}
        </legend>
        <Campo
          id="q-cep"
          rotulo={buscandoCep ? "CEP (buscando...)" : "CEP"}
          inputMode="numeric"
          className="sm:col-span-2"
          valor={e.cep}
          aoMudar={buscarCep}
        />
        <Campo
          id="q-logradouro"
          rotulo="Logradouro"
          className="sm:col-span-4"
          valor={e.logradouro}
          aoMudar={(v) => mudarEndereco("logradouro", v)}
        />
        <Campo
          id="q-numero"
          rotulo="Número"
          className="sm:col-span-2"
          valor={e.numero}
          aoMudar={(v) => mudarEndereco("numero", v)}
        />
        <Campo
          id="q-complemento"
          rotulo="Complemento"
          className="sm:col-span-4"
          valor={e.complemento}
          aoMudar={(v) => mudarEndereco("complemento", v)}
        />
        <Campo
          id="q-bairro"
          rotulo="Bairro"
          className="sm:col-span-2"
          valor={e.bairro}
          aoMudar={(v) => mudarEndereco("bairro", v)}
        />
        <Campo
          id="q-cidade"
          rotulo="Cidade"
          className="sm:col-span-3"
          valor={e.cidade}
          aoMudar={(v) => mudarEndereco("cidade", v)}
        />
        <Campo
          id="q-uf"
          rotulo="UF"
          valor={e.uf}
          aoMudar={(v) => mudarEndereco("uf", v.toUpperCase().slice(0, 2))}
        />
      </fieldset>
      <div className="rounded-lg bg-muted p-3 text-sm">
        <p className="mb-1 text-xs font-semibold text-texto-secundario">Como vai sair na peça</p>
        <p>{textoQualificacao({ ...cliente, qualificacao: dados })}</p>
      </div>
      <Button type="submit" disabled={salvando} className="self-end">
        {salvando ? "Salvando..." : "Salvar qualificação"}
      </Button>
    </form>
  );
}
