import { criarCalendario, ehDiaUtil, formatarData, type Calendario } from "@tesia/prazos";

export const MOMENTOS = ["5_uteis", "2_uteis", "fatal", "interno"] as const;
export type Momento = (typeof MOMENTOS)[number];

export type PrazoAlerta = {
  id: string;
  usuarioId: string;
  tipo: string;
  descricao: string;
  partes: string;
  vencimento: string;
  interno: string | null;
  hora: string | null;
  link: string;
};

export type Aviso = { prazo: PrazoAlerta; momento: Momento };

function proximoDia(iso: string) {
  const dia = new Date(`${iso}T00:00:00Z`);
  dia.setUTCDate(dia.getUTCDate() + 1);
  return dia.toISOString().slice(0, 10);
}

export function diasUteisEntre(hoje: string, vencimento: string, calendario: Calendario) {
  let total = 0;
  let dia = hoje;
  while (dia < vencimento) {
    dia = proximoDia(dia);
    if (ehDiaUtil(dia, calendario)) total += 1;
  }
  return total;
}

export function momentoDoPrazo(
  prazo: PrazoAlerta,
  hoje: string,
  escolhidos: readonly string[],
  calendario: Calendario = criarCalendario(),
): Momento | null {
  if (prazo.vencimento < hoje) return null;
  if (prazo.vencimento === hoje && escolhidos.includes("fatal")) return "fatal";
  if (prazo.interno === hoje && escolhidos.includes("interno")) return "interno";
  if (prazo.vencimento === hoje || prazo.tipo !== "prazo") return null;
  const uteis = diasUteisEntre(hoje, prazo.vencimento, calendario);
  if (uteis === 2 && escolhidos.includes("2_uteis")) return "2_uteis";
  if (uteis === 5 && escolhidos.includes("5_uteis")) return "5_uteis";
  return null;
}

export function escolherAvisos(
  prazos: PrazoAlerta[],
  hoje: string,
  escolhidosPorUsuario: Map<string, readonly string[]>,
  jaEnviados: Set<string>,
): Map<string, Aviso[]> {
  const calendario = criarCalendario();
  const porUsuario = new Map<string, Aviso[]>();
  for (const prazo of prazos) {
    const escolhidos = escolhidosPorUsuario.get(prazo.usuarioId);
    if (!escolhidos) continue;
    const momento = momentoDoPrazo(prazo, hoje, escolhidos, calendario);
    if (!momento || jaEnviados.has(`${prazo.usuarioId}:${prazo.id}:${momento}`)) continue;
    porUsuario.set(prazo.usuarioId, [
      ...(porUsuario.get(prazo.usuarioId) ?? []),
      { prazo, momento },
    ]);
  }
  return porUsuario;
}

const ROTULOS: Record<Momento, string> = {
  fatal: "Vence hoje",
  interno: "Prazo interno hoje",
  "2_uteis": "Vence em 2 dias úteis",
  "5_uteis": "Vence em 5 dias úteis",
};

function escapar(texto: string) {
  return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function montarEmail(nome: string, avisos: Aviso[]) {
  const ordem: Momento[] = ["fatal", "interno", "2_uteis", "5_uteis"];
  const ordenados = [...avisos].sort((a, b) => ordem.indexOf(a.momento) - ordem.indexOf(b.momento));
  const urgentes = ordenados.filter(({ momento }) => momento === "fatal").length;
  const assunto = urgentes
    ? `${urgentes === 1 ? "1 prazo vence" : `${urgentes} prazos vencem`} hoje`
    : `${avisos.length === 1 ? "1 prazo pede" : `${avisos.length} prazos pedem`} sua atenção`;
  const linhas = ordenados.map(({ prazo, momento }) => {
    const quando = `${ROTULOS[momento]} · fatal em ${formatarData(prazo.vencimento)}${prazo.hora ? ` às ${prazo.hora.slice(0, 5)}` : ""}`;
    return { prazo, quando };
  });
  const texto = [
    `Olá, ${nome}.`,
    "",
    ...linhas.flatMap(({ prazo, quando }) => [
      `${prazo.descricao} · ${prazo.partes}`,
      quando,
      prazo.link,
      "",
    ]),
    "Tesia",
  ].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1f2937;max-width:560px">
<p>Olá, ${escapar(nome)}.</p>
${linhas
  .map(
    ({
      prazo,
      quando,
    }) => `<div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0">
<strong>${escapar(prazo.descricao)}</strong> · ${escapar(prazo.partes)}<br>
<span style="color:#b45309">${escapar(quando)}</span><br>
<a href="${escapar(prazo.link)}">Abrir na Tesia</a>
</div>`,
  )
  .join("\n")}
<p style="color:#6b7280;font-size:13px">Você recebe este aviso porque ativou os alertas por e-mail em Configurações → Alertas.</p>
</div>`;
  return { assunto, texto, html };
}
