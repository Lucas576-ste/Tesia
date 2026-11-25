import { analiseGravadaSchema, nomePartes } from "@tesia/shared";
import { z } from "zod";
import { STATUS_INTIMACAO } from "@/lib/envio-intimacao";
import type { ItemIntimacao, SituacaoIntimacao } from "@/lib/situacao-intimacao";
import { isoParaData } from "@/lib/prazo-interno";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const linhaSchema = z.object({
  id: z.uuid(),
  status: z.enum(STATUS_INTIMACAO),
  origem: z.string(),
  criado_em: z.string(),
  concluida_em: z.string().nullable(),
  extracao: z.unknown(),
  prazos: z.array(z.object({ status: z.string() })).nullable(),
});

const CONFIRMADOS = ["confirmado", "cumprido"];

function situacao(linha: z.infer<typeof linhaSchema>): SituacaoIntimacao {
  if (linha.status === "recebida") return "fila";
  if (linha.status === "processando") return "lendo";
  if (linha.status === "erro") return "erro";
  if (linha.concluida_em) return "concluida";
  return linha.prazos?.some((prazo) => CONFIRMADOS.includes(prazo.status))
    ? "confirmado"
    : "aguardando";
}

function dataEmBrasilia(iso: string) {
  return isoParaData(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(iso)),
  );
}

export async function listarIntimacoes(): Promise<ItemIntimacao[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("intimacoes")
    .select("id, status, origem, criado_em, concluida_em, extracao, prazos(status)")
    .is("excluido_em", null)
    .order("criado_em", { ascending: false })
    .limit(200);
  const linhas = z.array(linhaSchema).safeParse(data);
  if (!linhas.success) return [];

  return linhas.data.map((linha) => {
    const analise = analiseGravadaSchema.safeParse(linha.extracao);
    return {
      id: linha.id,
      enviadaEm: dataEmBrasilia(linha.criado_em),
      partes: analise.success ? nomePartes(analise.data.dados.partes) : "Ainda não identificadas",
      cnj: analise.data?.dados.numero_processo ?? null,
      peca: analise.data?.pecas.find((peca) => peca.recomendada)?.nome ?? null,
      situacao: situacao(linha),
      djen: linha.origem === "djen",
    };
  });
}

export async function resumoIntimacoes() {
  const itens = await listarIntimacoes();
  return {
    total: itens.length,
    pendentes: itens.filter((item) => item.situacao === "aguardando").length,
  };
}
