"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
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
import { AREAS_ATUACAO } from "@/lib/onboarding";
import { dadosProcessoSchema, type DadosProcesso } from "@/lib/processos-exemplo";

type CampoTextoProps = {
  control: Control<DadosProcesso>;
  nome: "cnj" | "partes" | "tribunal" | "vara";
  rotulo: string;
};

function CampoTexto({ control, nome, rotulo }: CampoTextoProps) {
  return (
    <FormField
      control={control}
      name={nome}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{rotulo}</FormLabel>
          <FormControl>
            <Input autoComplete="off" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type FormularioProcessoProps = {
  dados: DadosProcesso;
  aoSalvar: (dados: DadosProcesso) => void;
};

export function FormularioProcesso({ dados, aoSalvar }: FormularioProcessoProps) {
  const form = useForm<DadosProcesso>({
    resolver: zodResolver(dadosProcessoSchema),
    defaultValues: dados,
  });

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(aoSalvar)} className="flex flex-col gap-4">
        <CampoTexto control={form.control} nome="cnj" rotulo="Número do processo" />
        <CampoTexto control={form.control} nome="partes" rotulo="Partes" />
        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área</FormLabel>
              <FormControl>
                <SelectNativo {...field}>
                  {AREAS_ATUACAO.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </SelectNativo>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <CampoTexto control={form.control} nome="tribunal" rotulo="Tribunal" />
        <CampoTexto control={form.control} nome="vara" rotulo="Vara" />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit">Salvar</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
