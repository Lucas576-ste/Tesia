export type EventoAgenda = {
  uid: string;
  titulo: string;
  data: string;
  descricao?: string;
  url?: string;
};

const LIMITE_OCTETOS = 75;

export function escaparTextoIcal(texto: string) {
  return texto
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function dobrarLinha(linha: string) {
  const partes: string[] = [];
  let atual = "";
  let octetos = 0;
  for (const caractere of linha) {
    const tamanho = Buffer.byteLength(caractere, "utf8");
    const limite = partes.length === 0 ? LIMITE_OCTETOS : LIMITE_OCTETOS - 1;
    if (octetos + tamanho > limite) {
      partes.push(atual);
      atual = "";
      octetos = 0;
    }
    atual += caractere;
    octetos += tamanho;
  }
  partes.push(atual);
  return partes.join("\r\n ");
}

function dataIcal(iso: string) {
  return iso.replace(/-/g, "");
}

function diaSeguinte(iso: string) {
  const data = new Date(`${iso}T00:00:00Z`);
  data.setUTCDate(data.getUTCDate() + 1);
  return data.toISOString().slice(0, 10);
}

function carimbo(agora: Date) {
  return agora
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

export function montarIcal(eventos: EventoAgenda[], opcoes: { nome: string; agora?: Date }) {
  const agora = carimbo(opcoes.agora ?? new Date());
  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tesia//Agenda de prazos//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escaparTextoIcal(opcoes.nome)}`,
    "X-WR-TIMEZONE:America/Sao_Paulo",
  ];
  for (const evento of eventos) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(evento.data)) continue;
    linhas.push(
      "BEGIN:VEVENT",
      `UID:${evento.uid}`,
      `DTSTAMP:${agora}`,
      `DTSTART;VALUE=DATE:${dataIcal(evento.data)}`,
      `DTEND;VALUE=DATE:${dataIcal(diaSeguinte(evento.data))}`,
      `SUMMARY:${escaparTextoIcal(evento.titulo)}`,
    );
    if (evento.descricao) linhas.push(`DESCRIPTION:${escaparTextoIcal(evento.descricao)}`);
    if (evento.url) linhas.push(`URL:${evento.url}`);
    linhas.push("TRANSP:TRANSPARENT", "END:VEVENT");
  }
  linhas.push("END:VCALENDAR");
  return `${linhas.map(dobrarLinha).join("\r\n")}\r\n`;
}
