import { cienciaAutomatica } from "./calcular-prazo";
import { proximoDiaUtil, type Calendario } from "./calendario";
import { formatarComDia } from "./datas";

export type EntradaInicioProvavel = {
  fonte: "diario" | "eletronico";
  disponibilizadaEm: string;
};

export type InicioProvavel = {
  referencia: string;
  inicio: string;
  memoria: string[];
};

export function inicioProvavelContagem(
  { fonte, disponibilizadaEm }: EntradaInicioProvavel,
  calendario: Calendario,
): InicioProvavel {
  if (fonte === "eletronico") {
    const ciencia = cienciaAutomatica(disponibilizadaEm, calendario);
    const inicio = proximoDiaUtil(ciencia, calendario);
    return {
      referencia: ciencia,
      inicio,
      memoria: [
        `Enviada pelo sistema do tribunal: ${formatarComDia(disponibilizadaEm)}`,
        `Ciência presumida: ${formatarComDia(ciencia)}, 10 dias corridos depois, se não for aberta antes`,
        `Início provável da contagem: ${formatarComDia(inicio)}, primeiro dia útil seguinte`,
      ],
    };
  }
  const publicacao = proximoDiaUtil(disponibilizadaEm, calendario);
  const inicio = proximoDiaUtil(publicacao, calendario);
  return {
    referencia: publicacao,
    inicio,
    memoria: [
      `Disponibilizada no diário: ${formatarComDia(disponibilizadaEm)}`,
      `Publicação: ${formatarComDia(publicacao)}, primeiro dia útil seguinte`,
      `Início provável da contagem: ${formatarComDia(inicio)}, primeiro dia útil após a publicação`,
    ],
  };
}
