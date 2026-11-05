"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
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
import { AREAS, CAMPOS_UTM, UFS, leadSchema, type Lead } from "@/lib/lead";
import { track } from "@/lib/medicao";

type Situacao = "aberto" | "sucesso" | "fechado" | "erro";

function lerUtms() {
  const parametros = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    CAMPOS_UTM.flatMap((campo) => {
      const valor = parametros.get(campo);
      return valor ? [[campo, valor]] : [];
    }),
  );
}

export function FormularioFundador() {
  const [situacao, setSituacao] = useState<Situacao>("aberto");
  const iniciou = useRef(false);
  const form = useForm<Lead>({
    resolver: zodResolver(leadSchema),
    defaultValues: { nome: "", email: "", oab: "", whatsapp: "" },
  });

  function aoAlterar() {
    if (iniciou.current) return;
    iniciou.current = true;
    track("fundador_form_start");
  }

  async function aoEnviar(lead: Lead) {
    const resposta = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, utms: lerUtms() }),
    }).catch(() => null);

    if (resposta?.ok) {
      track("fundador_form_submit");
      setSituacao("sucesso");
      return;
    }
    setSituacao(resposta?.status === 503 ? "fechado" : "erro");
  }

  if (situacao === "sucesso") {
    return (
      <p role="status" className="font-medium">
        Recebemos. Vamos falar com você pelo WhatsApp em até 1 dia útil.
      </p>
    );
  }

  if (situacao === "fechado") {
    return (
      <p role="status" className="font-medium">
        As inscrições ainda não abriram, e seus dados não foram guardados. Volte em breve.
      </p>
    );
  }

  return (
    <Form {...form}>
      <form
        noValidate
        onChange={aoAlterar}
        onSubmit={form.handleSubmit(aoEnviar)}
        className="flex flex-col gap-3"
      >
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-[1fr_6rem] gap-3">
          <FormField
            control={form.control}
            name="oab"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da OAB</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                    {UFS.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
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
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área principal</FormLabel>
              <FormControl>
                <SelectNativo {...field} value={field.value ?? ""}>
                  <option value="" disabled>
                    Escolha
                  </option>
                  {AREAS.map((area) => (
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
        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp com DDD</FormLabel>
              <FormControl>
                <Input type="tel" autoComplete="tel-national" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          Quero minha vaga
        </Button>
        {situacao === "erro" && (
          <p role="alert" className="text-sm text-erro">
            Não foi possível enviar. Tente de novo.
          </p>
        )}
        <p className="text-xs text-texto-secundario">
          Usamos estes dados só para falar com você sobre o programa. Veja a{" "}
          <Link href="/privacidade" target="_blank" className="text-primaria underline">
            política de privacidade
          </Link>
          .
        </p>
      </form>
    </Form>
  );
}
