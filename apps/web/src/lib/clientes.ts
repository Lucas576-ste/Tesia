import { etapaDaFase, faseDoProcesso, type CodigoEtapa } from "@tesia/shared";
import { z } from "zod";
import { diasUteisAte, hojeEmBrasilia } from "@/lib/datas-servidor";
import { rotuloArea } from "@/lib/painel";
import { isoParaData } from "@/lib/prazo-interno";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const DIAS_PARADO = 60;

const processoSchema = z.object({
  id: z.uuid(),
  numero_cnj: z.string(),
  partes: z.string().nullable(),
  parte_contraria: z.string().nullable(),
  rito: z.string().nullable(),
  area: z.string().nullable().catch(null),
  fase: z.string().nullable(),
  fase_origem: z.string().nullable(),
  fase_atualizada_em: z.string().nullable(),
  encerrado_em: z.string().nullable(),
  atualizado_em: z.string(),
  cliente_id: z.uuid().nullable(),
  prazos: z.array(z.object({ status: z.string(), data_vencimento: z.string() })).nullable(),
});

const clienteSchema = z.object({
  id: z.uuid(),
  nome: z.string(),
  documento: z.string().nullable(),
  contato: z.object({ telefone: z.string().optional(), email: z.string().optional() }).nullable(),
  tipo_pessoa: z.enum(["pf", "pj"]).catch("pf"),
  qualificacao: z.unknown(),
  pix: z.string().nullable().catch(null),
  observacoes: z.string().nullable().catch(null),
  ultimo_contato_em: z.string().nullable().catch(null),
});

export type ProcessoAcompanhado = {
  id: string;
  cnj: string;
  partes: string;
  rito: string | null;
  fase: string | null;
  nomeFase: string;
  etapa: CodigoEtapa;
  origemFase: string;
  proximoPrazo: string | null;
  urgenciaProximo: { vencimento: string; diasUteis: number; diasAtraso: number } | null;
  protocolado: boolean;
  area: string | null;
  diasDesdeMovimentacao: number;
  diasParado: number | null;
  clienteId: string | null;
  clienteNome: string | null;
};

export type ClienteResumo = z.infer<typeof clienteSchema> & { processos: ProcessoAcompanhado[] };

function diasDesde(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function dataCurta(iso: string) {
  return isoParaData(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(iso)),
  );
}

export function textoOrigem(origem: string | null, quando: string | null) {
  if (!origem || !quando) return "Fase ainda não identificada";
  if (origem === "manual") return `Corrigida por você em ${dataCurta(quando)}`;
  if (origem === "djen") return `Atualizada pelo DJEN em ${dataCurta(quando)}`;
  return `Pela intimação de ${dataCurta(quando)}`;
}

function paraAcompanhado(
  linha: z.infer<typeof processoSchema>,
  nomes: Map<string, string>,
): ProcessoAcompanhado {
  const proximo = (linha.prazos ?? [])
    .filter(({ status }) => status === "confirmado")
    .map(({ data_vencimento }) => data_vencimento)
    .sort()[0];
  const encerrado = Boolean(linha.encerrado_em);
  const hoje = hojeEmBrasilia();
  const fase = faseDoProcesso(linha.rito, linha.fase);
  const ultimaMovimentacao = linha.fase_atualizada_em ?? linha.atualizado_em;
  const dias = diasDesde(ultimaMovimentacao);
  return {
    id: linha.id,
    cnj: linha.numero_cnj,
    partes: linha.partes ?? linha.parte_contraria ?? "Partes não informadas",
    rito: linha.rito,
    fase: linha.fase,
    nomeFase: encerrado ? "Encerrado" : (fase?.nome ?? "Fase não identificada"),
    etapa: encerrado ? "encerrado" : etapaDaFase(linha.rito, linha.fase),
    origemFase:
      encerrado && linha.encerrado_em
        ? `Encerrado em ${dataCurta(linha.encerrado_em)}`
        : textoOrigem(linha.fase_origem, linha.fase_atualizada_em),
    proximoPrazo: proximo ? isoParaData(proximo) : null,
    urgenciaProximo: proximo
      ? {
          vencimento: isoParaData(proximo),
          diasUteis: diasUteisAte(proximo, hoje),
          diasAtraso: Math.max(
            0,
            Math.round(
              (Date.parse(`${hoje}T00:00:00Z`) - Date.parse(`${proximo}T00:00:00Z`)) / 86_400_000,
            ),
          ),
        }
      : null,
    protocolado: !proximo && (linha.prazos ?? []).some(({ status }) => status === "cumprido"),
    area: linha.area ? rotuloArea(linha.area) : null,
    diasDesdeMovimentacao: dias,
    diasParado: !encerrado && !proximo && dias >= DIAS_PARADO ? dias : null,
    clienteId: linha.cliente_id,
    clienteNome: linha.cliente_id ? (nomes.get(linha.cliente_id) ?? null) : null,
  };
}

const COLUNAS_CLIENTE =
  "id, nome, documento, contato, tipo_pessoa, qualificacao, pix, observacoes, ultimo_contato_em";
const COLUNAS_PROCESSO =
  "id, numero_cnj, partes, parte_contraria, rito, area, fase, fase_origem, fase_atualizada_em, encerrado_em, atualizado_em, cliente_id, prazos(status, data_vencimento)";

export async function listarAcompanhamento() {
  const supabase = await criarClienteServidor();
  const [{ data: clientes }, { data: processos }] = await Promise.all([
    supabase.from("clientes").select(COLUNAS_CLIENTE).order("nome"),
    supabase.from("processos").select(COLUNAS_PROCESSO).is("excluido_em", null),
  ]);
  const listaClientes = z.array(clienteSchema).safeParse(clientes).data ?? [];
  const nomes = new Map(listaClientes.map((cliente) => [cliente.id, cliente.nome]));
  const listaProcessos = (z.array(processoSchema).safeParse(processos).data ?? []).map((linha) =>
    paraAcompanhado(linha, nomes),
  );
  return {
    clientes: listaClientes.map((cliente) => ({
      ...cliente,
      processos: listaProcessos.filter((processo) => processo.clienteId === cliente.id),
    })),
    processos: listaProcessos,
    semCliente: listaProcessos.filter((processo) => !processo.clienteId),
  };
}

export async function buscarCliente(id: string): Promise<ClienteResumo | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const supabase = await criarClienteServidor();
  const [{ data: cliente }, { data: processos }] = await Promise.all([
    supabase.from("clientes").select(COLUNAS_CLIENTE).eq("id", id).maybeSingle(),
    supabase
      .from("processos")
      .select(COLUNAS_PROCESSO)
      .eq("cliente_id", id)
      .is("excluido_em", null),
  ]);
  const dados = clienteSchema.safeParse(cliente);
  if (!dados.success) return null;
  const nomes = new Map([[dados.data.id, dados.data.nome]]);
  return {
    ...dados.data,
    processos: (z.array(processoSchema).safeParse(processos).data ?? []).map((linha) =>
      paraAcompanhado(linha, nomes),
    ),
  };
}

export async function listarClientesSimples() {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("clientes").select("id, nome").order("nome");
  return z.array(z.object({ id: z.uuid(), nome: z.string() })).safeParse(data).data ?? [];
}

const ultimaIntimacaoSchema = z.object({
  processo_id: z.uuid(),
  criado_em: z.string(),
  extracao: z.object({ resumo: z.object({ o_que_aconteceu: z.string() }) }),
});

export async function ultimaMovimentacaoDoCliente(processoIds: string[]) {
  if (!processoIds.length) return null;
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("intimacoes")
    .select("processo_id, criado_em, extracao")
    .in("processo_id", processoIds)
    .eq("status", "analisada")
    .is("excluido_em", null)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  const linha = ultimaIntimacaoSchema.safeParse(data);
  if (!linha.success) return null;
  return {
    processoId: linha.data.processo_id,
    data: dataCurta(linha.data.criado_em),
    resumo: linha.data.extracao.resumo.o_que_aconteceu,
  };
}
