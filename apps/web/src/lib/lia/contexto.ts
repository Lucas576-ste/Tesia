import { z } from "zod";
import { hojeBrasilia } from "@/lib/hoje";
import { resumoIntimacoes } from "@/lib/intimacoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { IdsDaTela } from "./acoes";
import { itemDaRota } from "./sugestoes";

const LIMITE_ITEM = 6000;
const LINHAS_MEMORIA = 12;
const DIAS_VENCENDO = 2;

const prazoSchema = z.object({
  id: z.string(),
  descricao: z.string(),
  dias: z.number().nullable().optional(),
  contagem: z.string().nullable().optional(),
  data_inicio: z.string().nullable().optional(),
  data_vencimento: z.string(),
  data_prazo_interno: z.string().nullable().optional(),
  status: z.string(),
  memoria_calculo: z
    .object({ linhas: z.array(z.string()) })
    .nullable()
    .optional(),
  processos: z.object({ numero_cnj: z.string() }).nullable().optional(),
});

type Prazo = z.infer<typeof prazoSchema>;

const CAMPOS_PRAZO =
  "id, descricao, dias, contagem, data_inicio, data_vencimento, data_prazo_interno, status, memoria_calculo";

export type ContextoLia = {
  rota: string;
  plano: string;
  hoje: string;
  resumo: {
    prazos_vencendo_ate_2_dias: number;
    prazos_vencidos: number;
    intimacoes_novas: number;
    proximos_prazos: { descricao: string; vencimento: string; processo: string | null }[];
  };
  item?: unknown;
};

function somarDias(iso: string, dias: number) {
  const data = new Date(`${iso}T12:00:00Z`);
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString().slice(0, 10);
}

function prazoParaContexto(prazo: Prazo) {
  return {
    descricao: prazo.descricao,
    status: prazo.status,
    dias: prazo.dias ?? null,
    contagem: prazo.contagem ?? null,
    inicio_da_contagem: prazo.data_inicio ?? null,
    prazo_fatal: prazo.data_vencimento,
    prazo_interno: prazo.data_prazo_interno ?? null,
    memoria_de_calculo: (prazo.memoria_calculo?.linhas ?? [])
      .slice(0, LINHAS_MEMORIA)
      .map((linha) => linha.slice(0, 200)),
  };
}

function cortar(valor: unknown) {
  const texto = JSON.stringify(valor);
  return texto.length <= LIMITE_ITEM ? valor : { aviso: "Detalhe cortado por tamanho." };
}

async function prazosDe(coluna: "processo_id" | "intimacao_id" | "id", valor: string) {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("prazos")
    .select(CAMPOS_PRAZO)
    .eq(coluna, valor)
    .eq("automatica", false)
    .order("data_vencimento")
    .limit(5);
  return z.array(prazoSchema).safeParse(data).data ?? [];
}

const processoSchema = z.object({
  numero_cnj: z.string(),
  tribunal: z.string().nullable(),
  orgao: z.string().nullable(),
  area: z.string().nullable(),
  rito: z.string().nullable(),
  polo: z.string().nullable(),
  parte_contraria: z.string().nullable(),
  clientes: z.object({ nome: z.string() }).nullable(),
});

async function itemProcesso(id: string) {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("processos")
    .select("numero_cnj, tribunal, orgao, area, rito, polo, parte_contraria, clientes(nome)")
    .eq("id", id)
    .maybeSingle();
  const processo = processoSchema.safeParse(data).data;
  if (!processo) return { ids: {}, item: undefined };
  const prazos = await prazosDe("processo_id", id);
  return {
    ids: { processoId: id },
    item: {
      tipo: "processo",
      numero_cnj: processo.numero_cnj,
      tribunal: processo.tribunal,
      orgao: processo.orgao,
      area: processo.area,
      rito: processo.rito,
      polo_do_cliente: processo.polo,
      cliente: processo.clientes?.nome ?? null,
      parte_contraria: processo.parte_contraria,
      prazos: prazos.map(prazoParaContexto),
    },
  };
}

const intimacaoSchema = z.object({
  processo_id: z.string().nullable(),
  tipo_ato: z.string().nullable(),
  resultado: z.string().nullable(),
  data_publicacao: z.string().nullable(),
  resumo: z.string().nullable(),
  status: z.string(),
});

async function itemIntimacao(id: string) {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("intimacoes")
    .select("processo_id, tipo_ato, resultado, data_publicacao, resumo, status")
    .eq("id", id)
    .maybeSingle();
  const intimacao = intimacaoSchema.safeParse(data).data;
  if (!intimacao) return { ids: {}, item: undefined };
  const prazos = await prazosDe("intimacao_id", id);
  return {
    ids: intimacao.processo_id ? { processoId: intimacao.processo_id } : {},
    item: {
      tipo: "intimacao",
      tipo_do_ato: intimacao.tipo_ato,
      resultado: intimacao.resultado,
      data_de_publicacao: intimacao.data_publicacao,
      situacao: intimacao.status,
      resumo: intimacao.resumo?.slice(0, 1500) ?? null,
      prazos: prazos.map(prazoParaContexto),
    },
  };
}

const pecaSchema = z.object({
  processo_id: z.string(),
  prazo_id: z.string().nullable(),
  titulo: z.string(),
  status: z.string(),
  pendencias: z.array(z.unknown()),
});

async function itemPeca(id: string): Promise<{ ids: IdsDaTela; item?: unknown }> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("pecas")
    .select("processo_id, prazo_id, titulo, status, pendencias")
    .eq("id", id)
    .maybeSingle();
  const peca = pecaSchema.safeParse(data).data;
  if (!peca) return { ids: {} };
  const prazos = peca.prazo_id ? await prazosDe("id", peca.prazo_id) : [];
  return {
    ids: { pecaId: id, processoId: peca.processo_id },
    item: {
      tipo: "peca",
      titulo: peca.titulo,
      situacao: peca.status,
      pontos_a_confirmar: peca.pendencias.length,
      prazo: prazos.map(prazoParaContexto)[0] ?? null,
    },
  };
}

async function resumoGeral() {
  const supabase = await criarClienteServidor();
  const hoje = hojeBrasilia();
  const limite = somarDias(hoje, DIAS_VENCENDO);
  const [{ data }, intimacoes] = await Promise.all([
    supabase
      .from("prazos")
      .select(`${CAMPOS_PRAZO}, processos(numero_cnj)`)
      .eq("automatica", false)
      .in("status", ["sugerido", "confirmado"])
      .order("data_vencimento")
      .limit(60),
    resumoIntimacoes(),
  ]);
  const prazos = z.array(prazoSchema).safeParse(data).data ?? [];
  const futuros = prazos.filter((prazo) => prazo.data_vencimento >= hoje);
  return {
    prazos_vencendo_ate_2_dias: futuros.filter((prazo) => prazo.data_vencimento <= limite).length,
    prazos_vencidos: prazos.filter((prazo) => prazo.data_vencimento < hoje).length,
    intimacoes_novas: intimacoes.pendentes,
    proximos_prazos: futuros.slice(0, 6).map((prazo) => ({
      descricao: prazo.descricao,
      vencimento: prazo.data_vencimento,
      processo: prazo.processos?.numero_cnj ?? null,
    })),
  };
}

export async function montarContexto(rota: string, plano: string) {
  const alvo = itemDaRota(rota);
  const valido = alvo && z.uuid().safeParse(alvo.id).success ? alvo : null;
  const [resumo, detalhe] = await Promise.all([
    resumoGeral(),
    !valido
      ? Promise.resolve({ ids: {} as IdsDaTela, item: undefined as unknown })
      : valido.tipo === "processo"
        ? itemProcesso(valido.id)
        : valido.tipo === "intimacao"
          ? itemIntimacao(valido.id)
          : itemPeca(valido.id),
  ]);
  const contexto: ContextoLia = {
    rota,
    plano,
    hoje: hojeBrasilia(),
    resumo,
    ...(detalhe.item ? { item: cortar(detalhe.item) } : {}),
  };
  return { contexto, ids: detalhe.ids as IdsDaTela };
}

export async function contarVencendo() {
  const supabase = await criarClienteServidor();
  const hoje = hojeBrasilia();
  const { count } = await supabase
    .from("prazos")
    .select("id", { count: "exact", head: true })
    .eq("automatica", false)
    .in("status", ["sugerido", "confirmado"])
    .gte("data_vencimento", hoje)
    .lte("data_vencimento", somarDias(hoje, DIAS_VENCENDO));
  return count ?? 0;
}
