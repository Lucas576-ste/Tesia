"use client";

import { Download, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import {
  contarFiltrosAtivos,
  parametrosDosFiltros,
  SEM_FILTROS,
  urlDasIntimacoes,
  type FiltrosIntimacoes,
} from "@/lib/intimacoes-lista";

type Opcoes = {
  ufs: string[];
  tipos: string[];
  termos: { id: string; nome: string }[];
};

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-32 flex-1 flex-col gap-1">
      <Label className="text-xs text-texto-secundario">{rotulo}</Label>
      {children}
    </div>
  );
}

export function PainelFiltrosIntimacoes({
  filtros,
  opcoes,
}: {
  filtros: FiltrosIntimacoes;
  opcoes: Opcoes;
}) {
  const router = useRouter();
  const entrada = useRef<HTMLInputElement>(null);
  const ativos = contarFiltrosAtivos(filtros) + (filtros.busca ? 1 : 0);

  function aplicar(mudar: Partial<FiltrosIntimacoes>) {
    const busca = entrada.current?.value.trim() ?? filtros.busca;
    router.push(urlDasIntimacoes({ ...filtros, busca }, { ...mudar, pagina: 1 }));
  }

  const exportar = `/app/intimacoes/exportar?${parametrosDosFiltros({ ...filtros, pagina: 1 }).toString()}`;

  return (
    <section
      aria-label="Filtros das intimações"
      className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-xs"
    >
      <form
        className="flex gap-2"
        onSubmit={(evento) => {
          evento.preventDefault();
          aplicar({});
        }}
      >
        <div className="relative flex-1">
          <Search aria-hidden className="absolute top-2.5 left-2.5 size-4 text-texto-secundario" />
          <Input
            aria-label="Buscar intimações"
            placeholder="Buscar por parte, número do processo ou conteúdo"
            className="pl-8"
            ref={entrada}
            key={filtros.busca}
            defaultValue={filtros.busca}
          />
        </div>
        <Button type="submit">Buscar</Button>
      </form>
      <div className="flex flex-wrap gap-2">
        <Campo rotulo="Estado">
          <SelectNativo
            value={filtros.uf ?? ""}
            onChange={(e) =>
              aplicar({ uf: (e.target.value || undefined) as FiltrosIntimacoes["uf"] })
            }
          >
            <option value="">Todos</option>
            {opcoes.ufs.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </SelectNativo>
        </Campo>
        <Campo rotulo="Tipo">
          <SelectNativo
            value={filtros.tipo ?? ""}
            onChange={(e) => aplicar({ tipo: e.target.value || undefined })}
          >
            <option value="">Todos</option>
            {opcoes.tipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </SelectNativo>
        </Campo>
        <Campo rotulo="OAB buscada">
          <SelectNativo
            value={filtros.termo ?? ""}
            onChange={(e) => aplicar({ termo: e.target.value || undefined })}
          >
            <option value="">Todos</option>
            {opcoes.termos.map(({ id, nome }) => (
              <option key={id} value={id}>
                {nome}
              </option>
            ))}
          </SelectNativo>
        </Campo>
        <Campo rotulo="Situação">
          <SelectNativo
            value={filtros.status ?? ""}
            onChange={(e) =>
              aplicar({ status: (e.target.value || undefined) as FiltrosIntimacoes["status"] })
            }
          >
            <option value="">Todas</option>
            <option value="pendente">Pendentes</option>
            <option value="concluida">Concluídas</option>
            <option value="ignorada">Ignoradas</option>
          </SelectNativo>
        </Campo>
        <Campo rotulo="De">
          <Input
            type="date"
            value={filtros.de ?? ""}
            onChange={(e) => aplicar({ de: e.target.value || undefined })}
          />
        </Campo>
        <Campo rotulo="Até">
          <Input
            type="date"
            value={filtros.ate ?? ""}
            onChange={(e) => aplicar({ ate: e.target.value || undefined })}
          />
        </Campo>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {ativos > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              router.push(urlDasIntimacoes({ ...filtros, ...SEM_FILTROS }));
            }}
          >
            <X aria-hidden />
            Limpar filtros ({ativos})
          </Button>
        ) : (
          <span />
        )}
        <Button asChild variant="outline" size="sm">
          <a href={exportar}>
            <Download aria-hidden />
            Baixar em Excel
          </a>
        </Button>
      </div>
    </section>
  );
}
