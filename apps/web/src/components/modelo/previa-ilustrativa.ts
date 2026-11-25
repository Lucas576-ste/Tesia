import type { InspecaoModelo } from "@tesia/documentos";

export const PREVIA_ILUSTRATIVA: InspecaoModelo = {
  pagina: { larguraMm: 210, alturaMm: 297, topoMm: 30, direitaMm: 25, baixoMm: 25, esquerdaMm: 30 },
  fonte: { nome: "Times New Roman", tamanhoPt: 12 },
  cabecalho: [
    {
      tipo: "texto",
      texto: "SEU ESCRITÓRIO ADVOCACIA",
      alinhamento: "center",
      negrito: true,
      tamanhoPt: 16,
      cor: null,
    },
    {
      tipo: "texto",
      texto: "OAB/UF 00.000 · seu@escritorio.com.br",
      alinhamento: "center",
      negrito: false,
      tamanhoPt: 10,
      cor: null,
    },
  ],
  rodape: [
    {
      tipo: "texto",
      texto: "Seu endereço · Cidade/UF · (00) 0000-0000",
      alinhamento: "center",
      negrito: false,
      tamanhoPt: 9,
      cor: null,
    },
  ],
};
