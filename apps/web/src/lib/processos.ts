import { z } from "zod";
import { listarPrazosConfirmados, rotuloArea } from "@/lib/painel";
import type { LinhaPrazo, StatusPrazo } from "@/lib/prazo";
import { chaveData } from "@/lib/prazo";
import type { EventoProcesso, Processo } from "@/lib/processo-tipos";
import { isoParaData } from "@/lib/prazo-interno";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const processoSchema = z.object({
  id: z.uuid(),
  numero_cnj: z.string(),
  partes: z.string().nullable(),
  parte_contraria: z.string().nullable(),
  area: z.string().nullable(),
  tribunal: z.string().nullable(),
  orgao: z.string().nullable(),
});

const intimacaoSchema = z.object({
  id: z.uuid(),
  criado_em: z.string(),
  resumo: z.string().nullable(),
  status: z.string(),
});

const pecaSchema = z.object({
  id: z.uuid(),
  titulo: z.string(),
  status: z.string(),
  criado_em: z.string(),
});

function dataBrasilia(iso: string) {
  return isoParaData(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(iso)),
  );
}

function resumoDoProcesso(prazos: LinhaPrazo[]): {
  proximoPrazo: string | null;
  status: StatusPrazo;
} {
  const abertos = prazos
    .filter(({ status }) => status !== "protocolado")
    .sort((a, b) => chaveData(a.vencimento).localeCompare(chaveData(b.vencimento)));
  const proximo = abertos[0];
  if (proximo) return { proximoPrazo: proximo.vencimento, status: proximo.status };
  return { proximoPrazo: null, status: prazos.length ? "protocolado" : "nao_iniciado" };
}

function nomeDoProcesso(processo: z.infer<typeof processoSchema>) {
  return processo.partes ?? processo.parte_contraria ?? "Partes não informadas";
}

export async function listarProcessos(): Promise<Processo[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("processos")
    .select("id, numero_cnj, partes, parte_contraria, area, tribunal, orgao")
    .is("excluido_em", null)
    .order("criado_em", { ascending: false });
  const linhas = z.array(processoSchema).safeParse(data);
  if (!linhas.success) return [];
  const prazos = await listarPrazosConfirmados();
  return linhas.data.map((processo) => {
    const doProcesso = prazos.filter((prazo) => prazo.cnj === processo.numero_cnj);
    return {
      id: processo.id,
      cnj: processo.numero_cnj,
      partes: nomeDoProcesso(processo),
      area: rotuloArea(processo.area),
      tribunal: processo.tribunal ?? "",
      vara: processo.orgao ?? "",
      prazos: doProcesso,
      eventos: [],
      ...resumoDoProcesso(doProcesso),
    };
  });
}

const ROTULOS_PECA: Record<string, string> = {
  gerando: "Sendo escrita pela Lia.",
  rascunho: "Rascunho pronto para revisão.",
  revisada: "Revisada.",
  protocolada: "Protocolada.",
  erro: "Não foi possível escrever.",
};

export async function buscarProcesso(id: string): Promise<Processo | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("processos")
    .select("id, numero_cnj, partes, parte_contraria, area, tribunal, orgao")
    .eq("id", id)
    .is("excluido_em", null)
    .maybeSingle();
  const processo = processoSchema.safeParse(data);
  if (!processo.success) return null;

  const [prazos, { data: intimacoes }, { data: pecas }] = await Promise.all([
    listarPrazosConfirmados(id),
    supabase
      .from("intimacoes")
      .select("id, criado_em, resumo, status")
      .eq("processo_id", id)
      .is("excluido_em", null),
    supabase
      .from("pecas")
      .select("id, titulo, status, criado_em")
      .eq("processo_id", id)
      .is("excluido_em", null),
  ]);

  const eventos: EventoProcesso[] = [
    ...(z.array(intimacaoSchema).safeParse(intimacoes).data ?? []).map((intimacao) => ({
      data: dataBrasilia(intimacao.criado_em),
      tipo: "intimacao" as const,
      titulo: "Intimação recebida",
      descricao: intimacao.resumo?.split(/(?<=\.)\s/)[0] ?? "Análise em andamento.",
      link: { href: `/app/intimacoes/${intimacao.id}`, rotulo: "Ver análise" },
    })),
    ...prazos.map((prazo) => ({
      data: prazo.vencimento,
      tipo: "prazo" as const,
      titulo: `${prazo.tipo && prazo.tipo !== "prazo" ? "Compromisso" : "Prazo"}: ${prazo.peca}`,
      descricao:
        prazo.status === "protocolado"
          ? "Cumprido."
          : prazo.prazoInterno
            ? `Prazo interno em ${prazo.prazoInterno}.`
            : "Em aberto.",
    })),
    ...(z.array(pecaSchema).safeParse(pecas).data ?? []).map((peca) => ({
      data: dataBrasilia(peca.criado_em),
      tipo: "peca" as const,
      titulo: peca.titulo,
      descricao: ROTULOS_PECA[peca.status] ?? "",
      link: { href: `/app/pecas/${peca.id}`, rotulo: "Abrir peça" },
    })),
  ].sort((a, b) => chaveData(b.data).localeCompare(chaveData(a.data)));

  return {
    id: processo.data.id,
    cnj: processo.data.numero_cnj,
    partes: nomeDoProcesso(processo.data),
    area: rotuloArea(processo.data.area),
    tribunal: processo.data.tribunal ?? "",
    vara: processo.data.orgao ?? "",
    prazos,
    eventos,
    ...resumoDoProcesso(prazos),
  };
}
