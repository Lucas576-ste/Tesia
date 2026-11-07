"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePlanoDemo } from "@/components/plano/provedor-plano-demo";
import { SelectNativo } from "@/components/ui/select-nativo";
import { COOKIE_PLANO_DEMO, COOKIE_USO_DEMO, NIVEIS_USO, PLANOS_DEMO } from "@/lib/planos-exemplo";

function salvarCookie(cookie: string, valor: string) {
  document.cookie = `${cookie}=${valor}; path=/; max-age=31536000; samesite=lax`;
}

export function SeletorPlanoDemo() {
  const router = useRouter();
  const { id, nivelUso } = usePlanoDemo();

  useEffect(() => {
    const endereco = new URL(window.location.href);
    const plano = endereco.searchParams.get("plano");
    if (plano === null) return;
    endereco.searchParams.delete("plano");
    if (Object.hasOwn(PLANOS_DEMO, plano)) salvarCookie(COOKIE_PLANO_DEMO, plano);
    router.replace(`${endereco.pathname}${endereco.search}`, { scroll: false });
    router.refresh();
  }, [router]);

  function salvar(cookie: string, valor: string) {
    salvarCookie(cookie, valor);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-amber-200 px-4 py-1 text-xs md:px-6">
      <span className="font-medium text-menu">Só em desenvolvimento</span>
      <label className="flex items-center gap-1">
        <span className="text-menu">Plano</span>
        <SelectNativo
          key={id}
          defaultValue={id}
          onChange={(evento) => salvar(COOKIE_PLANO_DEMO, evento.target.value)}
          className="h-7 w-auto py-0 text-xs md:text-xs"
        >
          {Object.entries(PLANOS_DEMO).map(([valor, { nome }]) => (
            <option key={valor} value={valor}>
              {nome}
            </option>
          ))}
        </SelectNativo>
      </label>
      <label className="flex items-center gap-1">
        <span className="text-menu">Uso</span>
        <SelectNativo
          defaultValue={nivelUso}
          onChange={(evento) => salvar(COOKIE_USO_DEMO, evento.target.value)}
          className="h-7 w-auto py-0 text-xs md:text-xs"
        >
          {Object.entries(NIVEIS_USO).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </SelectNativo>
      </label>
    </div>
  );
}
