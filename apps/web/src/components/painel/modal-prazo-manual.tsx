"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectNativo } from "@/components/ui/select-nativo";
import { Textarea } from "@/components/ui/textarea";
import {
  esquemaPrazoManual,
  hojeBrasilia,
  TIPOS_MANUAIS,
  type PrazoManual,
  type ProcessoResumo,
} from "@/lib/prazo-manual";
import { DIAS_PRAZO_INTERNO } from "@/lib/prazo-interno";
import { cn } from "@/lib/utils";
import { CalculoPrazo } from "./calculo-prazo";

const valoresIniciais: PrazoManual = {
  tipo: "prazo",
  descricao: "",
  data: "",
  hora: "",
  processoId: "",
  prazoInterno: "",
  inicio: "",
  responsavelId: "",
  observacoes: "",
};

type ModalPrazoManualProps = {
  aberto: boolean;
  processoInicial?: string;
  descricaoInicial?: string;
  tipoInicial?: PrazoManual["tipo"];
  titulo?: string;
  responsaveis?: { id: string; nome: string }[];
  responsavelInicial?: string;
  comObservacoes?: boolean;
  processos: ProcessoResumo[];
  aoFechar: () => void;
  aoSalvar: (dados: PrazoManual) => void | Promise<void>;
};

const modos = [
  { valor: "calcular", rotulo: "Calcular pela publicação" },
  { valor: "informar", rotulo: "Informar a data" },
] as const;

function FormularioPrazoManual({
  processos,
  processoInicial,
  descricaoInicial,
  tipoInicial,
  responsaveis,
  responsavelInicial,
  comObservacoes,
  aoSalvar,
}: Pick<
  ModalPrazoManualProps,
  | "processos"
  | "processoInicial"
  | "descricaoInicial"
  | "tipoInicial"
  | "responsaveis"
  | "responsavelInicial"
  | "comObservacoes"
  | "aoSalvar"
>) {
  const hoje = hojeBrasilia();
  const form = useForm<PrazoManual>({
    resolver: zodResolver(esquemaPrazoManual(hoje)),
    defaultValues: {
      ...valoresIniciais,
      tipo: tipoInicial ?? valoresIniciais.tipo,
      descricao: descricaoInicial ?? "",
      processoId: processoInicial ?? "",
      responsavelId: responsavelInicial ?? "",
    },
  });
  const [modo, setModo] = useState<"calcular" | "informar">("calcular");
  const ehPrazo = useWatch({ control: form.control, name: "tipo" }) === "prazo";
  const processoId = useWatch({ control: form.control, name: "processoId" });
  const calculando = ehPrazo && modo === "calcular";

  function trocarModo(novo: "calcular" | "informar") {
    setModo(novo);
    if (novo === "informar") form.setValue("calculo", undefined);
  }

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(aoSalvar)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <SelectNativo {...field}>
                  {Object.entries(TIPOS_MANUAIS).map(([valor, rotulo]) => (
                    <option key={valor} value={valor}>
                      {rotulo}
                    </option>
                  ))}
                </SelectNativo>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="processoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processo (opcional)</FormLabel>
              <FormControl>
                <SelectNativo {...field}>
                  <option value="">Sem processo</option>
                  {processos.map(({ id, partes }) => (
                    <option key={id} value={id}>
                      {partes}
                    </option>
                  ))}
                </SelectNativo>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {responsaveis && responsaveis.length > 1 && (
          <FormField
            control={form.control}
            name="responsavelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável</FormLabel>
                <FormControl>
                  <SelectNativo {...field}>
                    {responsaveis.map(({ id, nome }) => (
                      <option key={id} value={id}>
                        {nome}
                      </option>
                    ))}
                  </SelectNativo>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {comObservacoes && (
          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações (opcional)</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {ehPrazo && (
          <div
            role="radiogroup"
            aria-label="Como definir o prazo"
            className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
          >
            {modos.map(({ valor, rotulo }) => (
              <button
                key={valor}
                type="button"
                role="radio"
                aria-checked={modo === valor}
                onClick={() => trocarModo(valor)}
                className={cn(
                  "rounded-md px-2 py-1.5 text-sm font-medium text-texto-secundario",
                  modo === valor && "bg-card text-foreground shadow-xs",
                )}
              >
                {rotulo}
              </button>
            ))}
          </div>
        )}
        {calculando && <CalculoPrazo form={form} processoId={processoId} hoje={hoje} />}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{ehPrazo ? "Prazo fatal" : "Data"}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hora"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora (opcional)</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {ehPrazo && (
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="prazoInterno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo interno (opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!calculando && (
              <FormField
                control={form.control}
                name="inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início da contagem (opcional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <p className="col-span-2 text-xs text-texto-secundario">
              Em branco, o prazo interno fica {DIAS_PRAZO_INTERNO} dias úteis antes do fatal.
            </p>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Salvando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function ModalPrazoManual({
  aberto,
  processoInicial,
  descricaoInicial,
  tipoInicial,
  titulo = "Novo prazo",
  responsaveis,
  responsavelInicial,
  comObservacoes,
  processos,
  aoFechar,
  aoSalvar,
}: ModalPrazoManualProps) {
  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        if (!valor) aoFechar();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>
            A Tesia sugere o vencimento, mas a data final é sempre a que você confirmar. Ela entra
            no painel como confirmada.
          </DialogDescription>
        </DialogHeader>
        <FormularioPrazoManual
          processos={processos}
          processoInicial={processoInicial}
          descricaoInicial={descricaoInicial}
          tipoInicial={tipoInicial}
          responsaveis={responsaveis}
          responsavelInicial={responsavelInicial}
          comObservacoes={comObservacoes}
          aoSalvar={aoSalvar}
        />
      </DialogContent>
    </Dialog>
  );
}
