import { respostaSchema, type Comunicacao } from "./filtrar";

const BASE = "https://comunicaapi.pje.jus.br/api/v1/comunicacao";
const POR_PAGINA = 100;
const MAX_PAGINAS = 20;

export class FormatoDjenMudou extends Error {}

type Opcoes = {
  oab: string;
  uf: string;
  de: string;
  ate: string;
  esperar?: (ms: number) => Promise<void>;
  buscar?: typeof fetch;
  intervaloMs?: number;
};

const pausa = (ms: number) => new Promise<void>((resolver) => setTimeout(resolver, ms));

export async function buscarComunicacoes({
  oab,
  uf,
  de,
  ate,
  esperar = pausa,
  buscar = fetch,
  intervaloMs = 3500,
}: Opcoes): Promise<Comunicacao[]> {
  const todas: Comunicacao[] = [];
  for (let pagina = 1; pagina <= MAX_PAGINAS; pagina += 1) {
    const parametros = new URLSearchParams({
      numeroOab: oab,
      ufOab: uf.toUpperCase(),
      dataDisponibilizacaoInicio: de,
      dataDisponibilizacaoFim: ate,
      itensPorPagina: String(POR_PAGINA),
      pagina: String(pagina),
    });
    let resposta = await buscar(`${BASE}?${parametros}`, {
      headers: { Accept: "application/json" },
    });
    for (let tentativa = 0; resposta.status === 429 && tentativa < 3; tentativa += 1) {
      await esperar(60_000);
      resposta = await buscar(`${BASE}?${parametros}`, { headers: { Accept: "application/json" } });
    }
    if (!resposta.ok) throw new Error(`DJEN respondeu ${resposta.status}`);
    const dados = respostaSchema.safeParse(await resposta.json());
    if (!dados.success) throw new FormatoDjenMudou("A resposta do DJEN mudou de formato");
    todas.push(...dados.data.items);
    if (dados.data.items.length < POR_PAGINA) break;
    await esperar(intervaloMs);
  }
  return todas;
}
