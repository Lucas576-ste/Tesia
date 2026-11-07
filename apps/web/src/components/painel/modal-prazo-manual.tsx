"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  prazoManualSchema,
  TIPOS_MANUAIS,
  type PrazoManual,
  type ProcessoResumo,
} from "@/lib/prazo-manual";
import { DIAS_PRAZO_INTERNO } from "@/lib/prazo-interno";

const valoresIniciais: PrazoManual = {
  tipo: "prazo",
  descricao: "",
  data: "",
  hora: "",
  processoId: "",
  prazoInterno: "",
  inicio: "",
};

type ModalPrazoManualProps = {
  aberto: boolean;
  processos: ProcessoResumo[];
  aoFechar: () => void;
  aoSalvar: (dados: PrazoManual) => void;
};

function FormularioPrazoManual({
  processos,
  aoSalvar,
}: Pick<ModalPrazoManualProps, "processos" | "aoSalvar">) {
  const form = useForm<PrazoManual>({
    resolver: zodResolver(prazoManualSchema),
    defaultValues: valoresIniciais,
  });
  const ehPrazo = useWatch({ control: form.control, name: "tipo" }) === "prazo";

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
            <p className="col-span-2 text-xs text-texto-secundario">
              Em branco, o prazo interno fica {DIAS_PRAZO_INTERNO} dias úteis antes do fatal.
            </p>
          </div>
        )}
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
        <label className="flex items-center gap-2 text-sm text-texto-secundario">
          <input type="checkbox" disabled />
          Calcular a partir da disponibilização (em breve)
        </label>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit">Adicionar</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function ModalPrazoManual({ aberto, processos, aoFechar, aoSalvar }: ModalPrazoManualProps) {
  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        if (!valor) aoFechar();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo prazo manual</DialogTitle>
          <DialogDescription>
            A data é a que você informar. Ela entra no painel como confirmada.
          </DialogDescription>
        </DialogHeader>
        <FormularioPrazoManual processos={processos} aoSalvar={aoSalvar} />
      </DialogContent>
    </Dialog>
  );
}
