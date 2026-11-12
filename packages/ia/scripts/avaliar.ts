import { escolherPeca, extrairDados, resumirIntimacao } from "../src/analise/index.js";
import { criarClienteIa } from "../src/cliente.js";
import { CASOS } from "../casos/intimacoes.js";

const chave = process.env.ANTHROPIC_API_KEY;
if (!chave) {
  console.error("Defina ANTHROPIC_API_KEY no .env.local da raiz.");
  process.exit(1);
}

const cliente = criarClienteIa(chave);
let acertos = 0;
let total = 0;
let custo = 0;

for (const caso of CASOS) {
  const extracao = await extrairDados(cliente, caso.texto);
  const resumo = await resumirIntimacao(cliente, caso.texto, extracao.resultado);
  const escolha = await escolherPeca(cliente, extracao.resultado, caso.opcoes);
  const comparacoes = [
    ["numero_processo", extracao.resultado.numero_processo, caso.esperado.numero_processo],
    ["tipo_ato", extracao.resultado.tipo_ato, caso.esperado.tipo_ato],
    ["forma", extracao.resultado.forma_intimacao, caso.esperado.forma_intimacao],
    ["data", extracao.resultado.data_disponibilizacao, caso.esperado.data_disponibilizacao],
    ["envio_portal", extracao.resultado.data_envio_portal, caso.esperado.data_envio_portal],
    ["peca", escolha.resultado.recomendada.codigo, caso.esperado.peca],
  ] as const;
  const custoCaso = [extracao, resumo, escolha].reduce(
    (soma, etapa) => soma + etapa.uso.custoEstimado,
    0,
  );
  const tempo = [extracao, resumo, escolha].reduce((soma, etapa) => soma + etapa.duracaoMs, 0);
  custo += custoCaso;

  console.log(`\n${caso.nome}  (US$ ${custoCaso.toFixed(4)}, ${(tempo / 1000).toFixed(1)} s)`);
  for (const [campo, obtido, esperado] of comparacoes) {
    total++;
    if (obtido === esperado) acertos++;
    console.log(
      `  ${obtido === esperado ? "ok  " : "ERRO"} ${campo}: ${obtido ?? "null"}${obtido === esperado ? "" : ` (esperado ${esperado ?? "null"})`}`,
    );
  }
  console.log(`  resumo: ${resumo.resultado.o_que_aconteceu}`);
  for (const ponto of resumo.resultado.pontos_ataque) console.log(`  ponto: ${ponto.titulo}`);
}

console.log(`\n${acertos}/${total} acertos, custo total US$ ${custo.toFixed(4)}`);
