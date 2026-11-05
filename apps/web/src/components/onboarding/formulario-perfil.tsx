"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { UFS } from "@/lib/lead";
import {
  AREAS_ATUACAO,
  AREAS_EM_BREVE,
  OUTRO_TRIBUNAL,
  TRIBUNAIS,
  perfilSchema,
  type Perfil,
} from "@/lib/onboarding";
import { GrupoOpcoes } from "./grupo-opcoes";

export function FormularioPerfil() {
  const router = useRouter();
  const form = useForm<Perfil>({
    resolver: zodResolver(perfilSchema),
    defaultValues: { oab: "", areas: [], tribunais: [], whatsapp: "" },
  });
  const uf = useWatch({ control: form.control, name: "uf" });
  const tribunais = useWatch({ control: form.control, name: "tribunais" });
  const foraDoDf = (uf && uf !== "DF") || tribunais?.includes(OUTRO_TRIBUNAL);

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(() => router.push("/onboarding/estilo"))}
        className="flex flex-col gap-5"
      >
        <div className="grid grid-cols-[1fr_6rem] gap-3">
          <FormField
            control={form.control}
            name="oab"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da OAB</FormLabel>
                <FormControl>
                  <Input autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="uf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UF</FormLabel>
                <FormControl>
                  <SelectNativo {...field} value={field.value ?? ""}>
                    <option value="" disabled>
                      UF
                    </option>
                    {UFS.map((opcao) => (
                      <option key={opcao} value={opcao}>
                        {opcao}
                      </option>
                    ))}
                  </SelectNativo>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="areas"
          render={({ field }) => (
            <FormItem>
              <GrupoOpcoes
                legenda="Áreas de atuação"
                opcoes={AREAS_ATUACAO}
                emBreve={AREAS_EM_BREVE}
                valor={field.value}
                aoMudar={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tribunais"
          render={({ field }) => (
            <FormItem>
              <GrupoOpcoes
                legenda="Tribunais em que mais atua (opcional)"
                opcoes={TRIBUNAIS}
                valor={field.value}
                aoMudar={field.onChange}
              />
            </FormItem>
          )}
        />
        {foraDoDf && (
          <p role="status" className="rounded-md bg-atencao-fundo px-3 py-2 text-sm text-atencao">
            Por enquanto, os calendários locais cobrem só o DF. Fora dele, confira feriados e
            suspensões do seu tribunal.
          </p>
        )}
        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp para alertas (opcional)</FormLabel>
              <FormControl>
                <Input type="tel" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto sm:self-end">
          Continuar
        </Button>
      </form>
    </Form>
  );
}
