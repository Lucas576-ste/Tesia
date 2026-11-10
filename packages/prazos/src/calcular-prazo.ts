import { z } from "zod";
import { ehDiaUtil, proximoDiaUtil, type Calendario } from "./calendario";
import { formatarComDia, formatarData, somarDias } from "./datas";

const entradaPrazoSchema = z.object({
  dataDisponibilizacao: z.iso.date(),
  dias: z.number().int().positive().max(365),
  contagem: z.enum(["uteis", "corridos"]),
  fundamento: z.string().min(1),
});

export type EntradaPrazo = z.input<typeof entradaPrazoSchema>;

export type ResultadoPrazo = {
  publicacao: string;
  inicio: string;
  vencimento: string;
  memoria: string[];
};

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
  const { dataDisponibilizacao, dias, contagem, fundamento } = entradaPrazoSchema.parse(entrada);
  const publicacao = proximoDiaUtil(dataDisponibilizacao, calendario);
  const inicio = proximoDiaUtil(publicacao, calendario);
  const memoria = [
    `Disponibilizado no diário: ${formatarComDia(dataDisponibilizacao)}`,
    `Publicação: ${formatarComDia(publicacao)}, primeiro dia útil seguinte`,
    `Início da contagem: ${formatarComDia(inicio)}`,
    `Prazo: ${dias} dias ${contagem === "uteis" ? "úteis" : "corridos"} (${fundamento})`,
  ];

  let vencimento =
    contagem === "uteis" ? contarUteis(inicio, dias, calendario) : somarDias(inicio, dias - 1);
  if (!ehDiaUtil(vencimento, calendario)) {
    memoria.push(`Prazo terminaria em ${formatarComDia(vencimento)}, dia sem expediente`);
    vencimento = proximoDiaUtil(vencimento, calendario);
  }

  const naoUteis = diasNaoUteis(dataDisponibilizacao, vencimento, calendario);
  if (naoUteis.length > 0) memoria.push(`Dias não úteis no período: ${naoUteis.join("; ")}`);
  memoria.push(`Vencimento: ${formatarComDia(vencimento)}`);

  return { publicacao, inicio, vencimento, memoria };
}
