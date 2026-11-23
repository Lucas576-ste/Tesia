"use client";

import { ESTADOS_CIVIS, GENEROS, PAPEIS } from "@tesia/shared";
import { useWatch } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SelectNativo } from "@/components/ui/select-nativo";
import { CampoCliente, type FormularioCliente } from "./campo-cliente";

type SecaoProps = {
  form: FormularioCliente;
  representantes: { id: string; nome: string }[];
  idAtual?: string;
  aoMudarCep: (valor: string) => void;
};

function mascararCep(valor: string) {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}

function CampoSelecao({
  form,
  nome,
  rotulo,
  opcoes,
  vazio,
  desabilitado,
}: {
  form: FormularioCliente;
  nome: "genero" | "estado_civil" | "papel" | "representante_id";
  rotulo: string;
  opcoes: { valor: string; rotulo: string }[];
  vazio?: string;
  desabilitado?: boolean;
}) {
  return (
    <FormField
      control={form.control}
      name={nome}
      render={({ field }) => (
        <FormItem className="min-w-0">
          <FormLabel>{rotulo}</FormLabel>
          <FormControl>
            <SelectNativo {...field} value={field.value ?? ""} disabled={desabilitado}>
              {vazio !== undefined && <option value="">{vazio}</option>}
              {opcoes.map(({ valor, rotulo: texto }) => (
                <option key={valor} value={valor}>
                  {texto}
                </option>
              ))}
            </SelectNativo>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SecaoDadosAdicionais({ form, representantes, idAtual, aoMudarCep }: SecaoProps) {
  const tipo = useWatch({ control: form.control, name: "tipo_pessoa" });
  const origem = useWatch({ control: form.control, name: "origem" });
  const ehParteContraria = origem === "parte_contraria";

  return (
    <div className="flex flex-col gap-4 border-t pt-4">
      {tipo === "pf" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <CampoCliente
            form={form}
            nome="data_nascimento"
            rotulo="Data de nascimento"
            tipo="date"
          />
          <CampoSelecao
            form={form}
            nome="genero"
            rotulo="Gênero"
            vazio="Não informado"
            opcoes={Object.entries(GENEROS).map(([valor, rotulo]) => ({ valor, rotulo }))}
          />
          <CampoSelecao
            form={form}
            nome="estado_civil"
            rotulo="Estado civil"
            vazio="Não informado"
            opcoes={Object.entries(ESTADOS_CIVIS).map(([valor, rotulo]) => ({ valor, rotulo }))}
          />
          <CampoCliente form={form} nome="profissao" rotulo="Profissão" />
          <CampoCliente form={form} nome="nacionalidade" rotulo="Nacionalidade" />
          <CampoCliente form={form} nome="rg" rotulo="RG" />
          <CampoCliente form={form} nome="rg_orgao" rotulo="Órgão emissor" placeholder="SSP/DF" />
        </div>
      ) : (
        <CampoCliente form={form} nome="nome_fantasia" rotulo="Nome fantasia" />
      )}
      <fieldset className="grid gap-3 sm:grid-cols-6">
        <legend className="mb-2 text-sm font-semibold">Endereço</legend>
        <CampoCliente
          form={form}
          nome="cep"
          rotulo="CEP"
          modoEntrada="numeric"
          mascara={mascararCep}
          aoMudar={aoMudarCep}
          className="sm:col-span-2"
        />
        <CampoCliente form={form} nome="logradouro" rotulo="Logradouro" className="sm:col-span-4" />
        <CampoCliente form={form} nome="numero" rotulo="Número" className="sm:col-span-2" />
        <CampoCliente
          form={form}
          nome="complemento"
          rotulo="Complemento"
          className="sm:col-span-4"
        />
        <CampoCliente form={form} nome="bairro" rotulo="Bairro" className="sm:col-span-2" />
        <CampoCliente form={form} nome="cidade" rotulo="Cidade" className="sm:col-span-3" />
        <CampoCliente
          form={form}
          nome="uf"
          rotulo="UF"
          mascara={(valor) => valor.toUpperCase().slice(0, 2)}
          className="sm:col-span-1"
        />
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <CampoSelecao
          form={form}
          nome="papel"
          rotulo="Papel"
          desabilitado={ehParteContraria}
          opcoes={
            ehParteContraria
              ? [{ valor: "parte_contraria", rotulo: PAPEIS.parte_contraria }]
              : [
                  { valor: "cliente", rotulo: PAPEIS.cliente },
                  { valor: "testemunha", rotulo: PAPEIS.testemunha },
                ]
          }
        />
        <CampoSelecao
          form={form}
          nome="representante_id"
          rotulo="Representante legal"
          vazio="Nenhum"
          opcoes={representantes
            .filter(({ id }) => id !== idAtual)
            .map(({ id, nome }) => ({ valor: id, rotulo: nome }))}
        />
      </div>
      <FormField
        control={form.control}
        name="observacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notas</FormLabel>
            <FormControl>
              <textarea
                {...field}
                value={field.value ?? ""}
                rows={4}
                maxLength={5000}
                placeholder="Anotações livres. Use #hashtags para organizar e buscar, como #vip."
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
