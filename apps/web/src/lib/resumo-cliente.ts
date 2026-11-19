import { tituloNome } from "@tesia/shared";
import type { ClienteResumo, ProcessoAcompanhado } from "@/lib/clientes";

const DIA = 86_400_000;

function dataIso(vencimento: string) {
  return vencimento.split("/").reverse().join("-");
}

export function diasSemContato(cliente: ClienteResumo) {
  if (!cliente.ultimo_contato_em) return null;
  return Math.floor((Date.now() - new Date(cliente.ultimo_contato_em).getTime()) / DIA);
}

export function textoHaDias(dias: number | null) {
  if (dias === null) return "Nunca";
  if (dias <= 0) return "Hoje";
  if (dias === 1) return "Ontem";
  return `Há ${dias} dias`;
}

export function resumoCliente(cliente: ClienteResumo) {
  const ativos = cliente.processos.filter((processo) => processo.etapa !== "encerrado");
  const comPrazo = cliente.processos
    .filter(
      (
        processo,
      ): processo is ProcessoAcompanhado & {
        urgenciaProximo: NonNullable<ProcessoAcompanhado["urgenciaProximo"]>;
      } => Boolean(processo.urgenciaProximo),
    )
    .sort((a, b) =>
      dataIso(a.urgenciaProximo.vencimento).localeCompare(dataIso(b.urgenciaProximo.vencimento)),
    );
  const proximo = comPrazo[0]?.urgenciaProximo ?? null;
  const movimentos = cliente.processos.map((processo) => processo.diasDesdeMovimentacao);
  const areas = [...new Set(cliente.processos.map((processo) => processo.area).filter(Boolean))];
  const total = cliente.processos.length;
  const protocolado = !proximo && cliente.processos.some((processo) => processo.protocolado);
  return {
    nome: tituloNome(cliente.nome),
    total,
    textoProcessos: `${total === 1 ? "1 processo" : `${total} processos`}${protocolado ? " · protocolado" : ""}`,
    processoPrincipal: ativos[0] ?? cliente.processos[0] ?? null,
    proximo,
    proximoIso: proximo ? dataIso(proximo.vencimento) : null,
    diasMovimentacao: movimentos.length ? Math.min(...movimentos) : null,
    areas: areas as string[],
    diasContato: diasSemContato(cliente),
    telefone: cliente.contato?.telefone ?? null,
  };
}

export type ResumoCliente = ReturnType<typeof resumoCliente>;

export function linkWhatsapp(telefone: string, texto?: string) {
  const digitos = telefone.replace(/\D/g, "");
  const numero = digitos.length <= 11 ? `55${digitos}` : digitos;
  return `https://wa.me/${numero}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;
}
