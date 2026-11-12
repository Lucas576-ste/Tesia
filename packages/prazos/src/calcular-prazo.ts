import { z } from "zod";
import { ehDiaUtil, proximoDiaUtil, type Calendario } from "./calendario";
import { formatarComDia, formatarData, somarDias } from "./datas";

export const DIAS_CIENCIA_PORTAL = 10;

const entradaPrazoSchema = z
  .object({
    forma: z.enum(["diario", "portal"]).default("diario"),
    dataDisponibilizacao: z.iso.date(),
    dataAbertura: z.iso.date().optional(),
    dias: z.number().int().positive().max(365),
    contagem: z.enum(["uteis", "corridos"]),
    fundamento: z.string().min(1),
  })
  .refine(
    ({ dataAbertura, dataDisponibilizacao }) =>
      !dataAbertura || dataAbertura >= dataDisponibilizacao,
    { message: "A abertura não pode ser antes do envio." },
  );

export type EntradaPrazo = z.input<typeof entradaPrazoSchema>;

export type ResultadoPrazo = {
  publicacao?: string;
  ciencia?: string;
  inicio: string;
  vencimento: string;
  memoria: string[];
};

function marcoDiario(dataDisponibilizacao: string, calendario: Calendario) {
  const publicacao = proximoDiaUtil(dataDisponibilizacao, calendario);
  const inicio = proximoDiaUtil(publicacao, calendario);
  return {
    publicacao,
    inicio,
    memoria: [
      `Disponibilizado no diário: ${formatarComDia(dataDisponibilizacao)}`,
      `Publicação: ${formatarComDia(publicacao)}, primeiro dia útil seguinte`,
      `Início da contagem: ${formatarComDia(inicio)}`,
    ],
  };
}

export function cienciaAutomatica(envio: string, calendario: Calendario) {
  const decimoDia = somarDias(envio, DIAS_CIENCIA_PORTAL);
  return ehDiaUtil(decimoDia, calendario) ? decimoDia : proximoDiaUtil(decimoDia, calendario);
}

function marcoPortal(envio: string, abertura: string | undefined, calendario: Calendario) {
  const automatica = cienciaAutomatica(envio, calendario);
  const abriuAntes = Boolean(abertura && abertura <= automatica);
  const ciencia = abriuAntes && abertura ? abertura : automatica;
  const inicio = proximoDiaUtil(ciencia, calendario);
  const linhaCiencia = abriuAntes
    ? `Ciência: ${formatarComDia(ciencia)}, dia em que a intimação foi aberta`
    : `Ciência automática: ${formatarComDia(ciencia)}, ${DIAS_CIENCIA_PORTAL} dias corridos após o envio${
        ciencia === somarDias(envio, DIAS_CIENCIA_PORTAL) ? "" : ", adiada para o primeiro dia útil"
      } (Lei 11.419/2006, art. 5º, §3º)`;
  return {
    ciencia,
    inicio,
    memoria: [
      `Enviado no portal do tribunal: ${formatarComDia(envio)}`,
      linhaCiencia,
      `Início da contagem: ${formatarComDia(inicio)}, primeiro dia útil seguinte`,
    ],
  };
}

function contarUteis(inicio: string, dias: number, calendario: Calendario) {
  let dia = inicio;
  for (let contados = 1; contados < dias; contados += 1) dia = proximoDiaUtil(dia, calendario);
  return dia;
}

function diasNaoUteis(de: string, ate: string, calendario: Calendario) {
  const encontrados: string[] = [];
  let fimDeSemana = false;
  for (let dia = somarDias(de, 1); dia <= ate; dia = somarDias(dia, 1)) {
    const motivo = calendario.motivoNaoUtil(dia);
    if (motivo === "fim de semana") fimDeSemana = true;
    else if (motivo) encontrados.push(`${formatarData(dia)} (${motivo})`);
  }
  return [...(fimDeSemana ? ["sábados e domingos"] : []), ...encontrados];
}

export function calcularPrazo(entrada: EntradaPrazo, calendario: Calendario): ResultadoPrazo {
  const { forma, dataDisponibilizacao, dataAbertura, dias, contagem, fundamento } =
    entradaPrazoSchema.parse(entrada);
  const marco =
    forma === "portal"
      ? marcoPortal(dataDisponibilizacao, dataAbertura, calendario)
      : marcoDiario(dataDisponibilizacao, calendario);
  const { inicio } = marco;
  const memoria = [
    ...marco.memoria,
    `Prazo: ${dias} dias ${contagem === "uteis" ? "úteis" : "corridos"} (${fundamento})`,
  ];

  let vencimento =
    contagem === "uteis" ? contarUteis(inicio, dias, calendario) : somarDias(inicio, dias - 1);
  if (!ehDiaUtil(vencimento, calendario)) {
    memoria.push(`Prazo terminaria em ${formatarComDia(vencimento)}, dia sem expediente`);
    vencimento = proximoDiaUtil(vencimento, calendario);
  }

  const desde = "ciencia" in marco ? marco.ciencia : dataDisponibilizacao;
  const naoUteis = diasNaoUteis(desde, vencimento, calendario);
  if (naoUteis.length > 0) memoria.push(`Dias não úteis no período: ${naoUteis.join("; ")}`);
  memoria.push(`Vencimento: ${formatarComDia(vencimento)}`);

  return "ciencia" in marco
    ? { ciencia: marco.ciencia, inicio, vencimento, memoria }
    : { publicacao: marco.publicacao, inicio, vencimento, memoria };
}
