"use server";

import {
  faseDoProcesso,
  fasesDoRito,
  somenteDigitos,
  validarCnpj,
  validarCpf,
} from "@tesia/shared";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { brasilApiCnpjSchema, dadosDoCnpj, type DadosCnpj } from "@/lib/brasilapi";
import {
  dadosClienteSchema,
  extrasClienteSchema,
  formularioDoCliente,
  mensagemDuplicidade,
  montarColunasCliente,
  qualificacaoSchema,
  type DadosCliente,
  type ExtrasCliente,
} from "@/lib/cliente-tipos";
import { limitar, MENSAGEM_LIMITE } from "@/lib/limite";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

type Resultado = { ok: true; id?: string } | { erro: string };
type Duplicado = { id: string; nome: string };
type ResultadoCliente = { ok: true; id: string } | { erro: string; duplicado?: Duplicado };
type Supabase = Awaited<ReturnType<typeof criarClienteServidor>>;

const clienteExistenteSchema = z.object({ id: z.uuid(), nome: z.string() });

function atualizar(clienteId?: string) {
  revalidatePath("/app/clientes");
  if (clienteId) revalidatePath(`/app/clientes/${clienteId}`);
  revalidatePath("/app/processos", "layout");
}

async function acharPorDocumento(supabase: Supabase, documento: string, ignorarId?: string) {
  let consulta = supabase
    .from("clientes")
    .select("id, nome")
    .eq("documento", documento)
    .is("excluido_em", null);
  if (ignorarId) consulta = consulta.neq("id", ignorarId);
  const { data } = await consulta.limit(1).maybeSingle();
  return clienteExistenteSchema.safeParse(data).data ?? null;
}

function erroDeGravacao(codigo: string | undefined, fallback: string) {
  return codigo === "23503" ? "O representante legal escolhido não foi encontrado." : fallback;
}

export async function criarCliente(entrada: DadosCliente): Promise<ResultadoCliente> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  const dados = dadosClienteSchema.safeParse(entrada);
  if (!dados.success) return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  const supabase = await criarClienteServidor();
  const { documento, tipo_pessoa: tipo } = dados.data;
  if (documento) {
    const existente = await acharPorDocumento(supabase, documento);
    if (existente) return { erro: mensagemDuplicidade(tipo, existente), duplicado: existente };
  }
  const { data, error } = await supabase
    .from("clientes")
    .insert({ ...montarColunasCliente(dados.data), escritorio_id: usuario.escritorio_id })
    .select("id")
    .single();
  const linha = z.object({ id: z.uuid() }).safeParse(data);
  if (error?.code === "23505" && documento) {
    const existente = await acharPorDocumento(supabase, documento);
    return { erro: mensagemDuplicidade(tipo, existente), duplicado: existente ?? undefined };
  }
  if (error || !linha.success) {
    return { erro: erroDeGravacao(error?.code, "Não foi possível cadastrar o cliente.") };
  }
  atualizar();
  return { ok: true, id: linha.data.id };
}

export async function editarCliente(id: string, entrada: DadosCliente): Promise<ResultadoCliente> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(id).success) return { erro: "Cliente não encontrado." };
  const dados = dadosClienteSchema.safeParse(entrada);
  if (!dados.success) return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  if (dados.data.representante_id === id) {
    return { erro: "O representante legal não pode ser o próprio cliente." };
  }
  const supabase = await criarClienteServidor();
  const { data: atual } = await supabase
    .from("clientes")
    .select("qualificacao")
    .eq("id", id)
    .is("excluido_em", null)
    .maybeSingle();
  if (!atual) return { erro: "Cliente não encontrado." };
  const { documento, tipo_pessoa: tipo } = dados.data;
  if (documento) {
    const existente = await acharPorDocumento(supabase, documento, id);
    if (existente) return { erro: mensagemDuplicidade(tipo, existente), duplicado: existente };
  }
  const { data, error } = await supabase
    .from("clientes")
    .update(montarColunasCliente(dados.data, atual.qualificacao))
    .eq("id", id)
    .select("id");
  if (error?.code === "23505" && documento) {
    const existente = await acharPorDocumento(supabase, documento, id);
    return { erro: mensagemDuplicidade(tipo, existente), duplicado: existente ?? undefined };
  }
  if (error || !data?.length)
    return { erro: erroDeGravacao(error?.code, "Não foi possível salvar.") };
  atualizar(id);
  return { ok: true, id };
}

export async function excluirCliente(id: string): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(id).success) return { erro: "Cliente não encontrado." };
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("clientes")
    .update({ excluido_em: new Date().toISOString() })
    .eq("id", id)
    .is("excluido_em", null)
    .select("id");
  if (error || !data?.length) return { erro: "Não foi possível excluir o cliente." };
  atualizar(id);
  return { ok: true, id };
}

export async function restaurarCliente(id: string): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(id).success) return { erro: "Cliente não encontrado." };
  const supabase = await criarClienteServidor();
  const { data: atual } = await supabase
    .from("clientes")
    .select("documento, tipo_pessoa")
    .eq("id", id)
    .not("excluido_em", "is", null)
    .maybeSingle();
  const lido = z
    .object({ documento: z.string().nullable(), tipo_pessoa: z.enum(["pf", "pj"]).catch("pf") })
    .safeParse(atual);
  if (!lido.success) return { erro: "Cliente não encontrado." };
  const { data, error } = await supabase
    .from("clientes")
    .update({ excluido_em: null })
    .eq("id", id)
    .select("id");
  if (error?.code === "23505" && lido.data.documento) {
    const existente = await acharPorDocumento(supabase, lido.data.documento, id);
    return {
      erro: `${mensagemDuplicidade(lido.data.tipo_pessoa, existente)} Edite ou exclua um deles antes de restaurar.`,
    };
  }
  if (error || !data?.length) return { erro: "Não foi possível restaurar o cliente." };
  atualizar(id);
  return { ok: true, id };
}

export async function verificarDocumento(
  documento: string,
  ignorarId?: string,
): Promise<{ ok: true; existente: Duplicado | null } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  const digitos = somenteDigitos(documento);
  const valido =
    (digitos.length === 11 && validarCpf(digitos)) ||
    (digitos.length === 14 && validarCnpj(digitos));
  if (!valido) return { erro: "Documento inválido." };
  const supabase = await criarClienteServidor();
  const idValido = ignorarId && z.uuid().safeParse(ignorarId).success ? ignorarId : undefined;
  return { ok: true, existente: await acharPorDocumento(supabase, digitos, idValido) };
}

export async function consultarCnpj(
  cnpj: string,
): Promise<{ ok: true; dados: DadosCnpj } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  const digitos = somenteDigitos(cnpj);
  if (digitos.length !== 14 || !validarCnpj(digitos)) return { erro: "CNPJ inválido." };
  if (!(await limitar(`cnpj:${usuario.id}`, 20, 60))) return { erro: MENSAGEM_LIMITE };
  try {
    const resposta = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digitos}`, {
      headers: { Accept: "application/json", "User-Agent": "Tesia/1.0 (consulta de CNPJ)" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (resposta.status === 404) return { erro: "CNPJ não encontrado na Receita Federal." };
    if (resposta.status === 429) {
      return { erro: "Muitas consultas seguidas à Receita. Espere um minuto ou preencha à mão." };
    }
    if (!resposta.ok)
      return { erro: "A consulta de CNPJ está indisponível agora. Preencha à mão." };
    const lida = brasilApiCnpjSchema.safeParse(await resposta.json());
    if (!lida.success) return { erro: "A consulta de CNPJ não trouxe dados. Preencha à mão." };
    return { ok: true, dados: dadosDoCnpj(lida.data) };
  } catch {
    return { erro: "A consulta de CNPJ demorou demais. Preencha à mão." };
  }
}

export async function buscarClienteParaEdicao(
  id: string,
): Promise<{ ok: true; valores: DadosCliente } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(id).success) return { erro: "Cliente não encontrado." };
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("clientes")
    .select(
      "nome, tipo_pessoa, origem, papel, documento, contato, data_nascimento, genero, representante_id, observacoes, qualificacao",
    )
    .eq("id", id)
    .is("excluido_em", null)
    .maybeSingle();
  const valores = formularioDoCliente(data);
  return valores ? { ok: true, valores } : { erro: "Cliente não encontrado." };
}

export type ProcessoDoCliente = { id: string; cnj: string; partes: string; fase: string };

const processoDoClienteSchema = z.object({
  id: z.uuid(),
  numero_cnj: z.string(),
  partes: z.string().nullable(),
  parte_contraria: z.string().nullable(),
  rito: z.string().nullable(),
  fase: z.string().nullable(),
  encerrado_em: z.string().nullable(),
});

export async function processosDoCliente(
  clienteId: string,
): Promise<{ ok: true; processos: ProcessoDoCliente[] } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(clienteId).success)
    return { erro: "Cliente não encontrado." };
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("processos")
    .select("id, numero_cnj, partes, parte_contraria, rito, fase, encerrado_em")
    .eq("cliente_id", clienteId)
    .is("excluido_em", null)
    .order("encerrado_em", { ascending: false, nullsFirst: true })
    .order("atualizado_em", { ascending: false })
    .limit(50);
  if (error) return { erro: "Não consegui carregar os processos." };
  const lidos = z.array(processoDoClienteSchema).safeParse(data).data ?? [];
  return {
    ok: true,
    processos: lidos.map((linha) => ({
      id: linha.id,
      cnj: linha.numero_cnj,
      partes: linha.partes ?? linha.parte_contraria ?? "Partes não informadas",
      fase: linha.encerrado_em
        ? "Encerrado"
        : (faseDoProcesso(linha.rito, linha.fase)?.nome ?? "Fase não identificada"),
    })),
  };
}

export async function clientesParaRepresentante(): Promise<Duplicado[]> {
  const usuario = await usuarioAtual();
  if (!usuario) return [];
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("clientes")
    .select("id, nome")
    .is("excluido_em", null)
    .order("nome_normalizado")
    .limit(300);
  return z.array(clienteExistenteSchema).safeParse(data).data ?? [];
}

async function atualizarCampos(id: string, campos: Record<string, unknown>): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(id).success) return { erro: "Cliente não encontrado." };
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("clientes").update(campos).eq("id", id).select("id");
  if (error || !data?.length) return { erro: "Não foi possível salvar." };
  atualizar(id);
  return { ok: true };
}

export async function salvarQualificacao(id: string, entrada: unknown): Promise<Resultado> {
  const dados = qualificacaoSchema.safeParse(entrada);
  if (!dados.success) return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  return atualizarCampos(id, { qualificacao: dados.data });
}

export async function salvarExtras(id: string, entrada: ExtrasCliente): Promise<Resultado> {
  const dados = extrasClienteSchema.safeParse(entrada);
  if (!dados.success) return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  return atualizarCampos(id, {
    pix: dados.data.pix || null,
    observacoes: dados.data.observacoes || null,
  });
}

export async function registrarContato(id: string): Promise<Resultado> {
  return atualizarCampos(id, { ultimo_contato_em: new Date().toISOString() });
}

export async function juntarClientes(manterId: string, removerId: string): Promise<Resultado> {
  const usuario = await usuarioAtual();
  const ids = z.tuple([z.uuid(), z.uuid()]).safeParse([manterId, removerId]);
  if (!usuario || !ids.success || manterId === removerId)
    return { erro: "Escolha dois clientes diferentes." };
  const supabase = await criarClienteServidor();
  const { data: destino } = await supabase
    .from("clientes")
    .select("id")
    .eq("id", manterId)
    .maybeSingle();
  if (!destino) return { erro: "Cliente não encontrado." };
  const { error: erroProcessos } = await supabase
    .from("processos")
    .update({ cliente_id: manterId })
    .eq("cliente_id", removerId);
  if (erroProcessos) return { erro: "Não foi possível mover os processos." };
  const { error } = await supabase.from("clientes").delete().eq("id", removerId);
  if (error) return { erro: "Os processos foram movidos, mas o cliente antigo não foi apagado." };
  atualizar(manterId);
  return { ok: true, id: manterId };
}

export async function trocarClienteDoProcesso(
  processoId: string,
  clienteId: string | null,
): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(processoId).success)
    return { erro: "Processo não encontrado." };
  if (clienteId && !z.uuid().safeParse(clienteId).success) return { erro: "Cliente inválido." };
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("processos")
    .update({ cliente_id: clienteId })
    .eq("id", processoId)
    .select("id");
  if (error || !data?.length) return { erro: "Não foi possível trocar o cliente." };
  atualizar(clienteId ?? undefined);
  revalidatePath(`/app/processos/${processoId}`);
  return { ok: true };
}

export async function corrigirFase(processoId: string, fase: string): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(processoId).success)
    return { erro: "Processo não encontrado." };
  const supabase = await criarClienteServidor();
  const { data: processo } = await supabase
    .from("processos")
    .select("rito")
    .eq("id", processoId)
    .maybeSingle();
  const rito = z.object({ rito: z.string().nullable() }).safeParse(processo).data?.rito ?? null;
  if (!fasesDoRito(rito).some((item) => item.codigo === fase))
    return { erro: "Fase inválida para este processo." };
  const { error } = await supabase
    .from("processos")
    .update({
      fase,
      fase_origem: "manual",
      fase_atualizada_em: new Date().toISOString(),
      encerrado_em: fase === "arquivado" ? new Date().toISOString() : null,
    })
    .eq("id", processoId);
  if (error) return { erro: "Não foi possível corrigir a fase." };
  atualizar();
  revalidatePath(`/app/processos/${processoId}`);
  return { ok: true };
}

export async function encerrarProcesso(processoId: string, encerrado: boolean): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(processoId).success)
    return { erro: "Processo não encontrado." };
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("processos")
    .update({ encerrado_em: encerrado ? new Date().toISOString() : null })
    .eq("id", processoId);
  if (error) return { erro: "Não foi possível atualizar o processo." };
  atualizar();
  revalidatePath(`/app/processos/${processoId}`);
  return { ok: true };
}
