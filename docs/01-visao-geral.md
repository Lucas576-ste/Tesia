# 01 — Visão geral

## Resumo

A Tesia é um agente de IA para o advogado. Ela lê a intimação, explica o que aconteceu, calcula o prazo, sugere a peça cabível e entrega um rascunho escrito no estilo do próprio advogado. O advogado revisa, ajusta e protocola.

Como complemento pago (plano Plus), a plataforma gera conteúdo para o Instagram do advogado a partir dos casos em que ele atuou, dentro das regras de publicidade da OAB.

## Problema

- O advogado perde muito tempo lendo intimações, calculando prazos e escrevendo peças repetitivas.
- Prazo perdido significa processo perdido, cliente perdido e risco de responsabilização.
- As IAs genéricas escrevem peças com cara de IA, que o advogado precisa reescrever.
- Os sistemas de gestão completos (ex.: ADVBOX) são caros e complexos para o advogado solo. A entrada da ADVBOX é R$ 220/mês + ativação, e a leitura automática de intimações só aparece a partir de R$ 450/mês.

Os advogados entrevistados confirmaram essa dor e apontaram funcionalidades da ADVBOX como referência do que resolve o problema.

## Público

- **Foco:** advogado solo e duplas de advogados. Por enquanto, não há plano para 3 ou mais.
- **Áreas:** plataforma generalista. O advogado escolhe as áreas em que atua e o sistema monta peças e regras de prazo dessas áreas. Lançamento com 4 áreas: cível/consumidor, trabalhista, previdenciário e família.

## Solução (fluxo principal)

1. **Ensinar o estilo:** no primeiro acesso, o advogado envia de 5 a 10 peças antigas. O sistema cria um perfil de estilo.
2. **Nova intimação:** o advogado envia o PDF da intimação ou decisão (no MVP). Depois, as intimações passam a chegar automaticamente pela OAB do advogado.
3. **Card de análise:** resumo do que aconteceu, pontos que podem ser atacados, prazo calculado com a explicação da conta e peça sugerida.
4. **Confirmação:** o advogado confirma o prazo e a peça.
5. **Rascunho:** a peça é gerada no estilo dele, com os pontos a confirmar destacados.
6. **Revisão e download:** ele ajusta no editor e baixa em .docx, no próprio modelo de papel timbrado.
7. **Painel de prazos:** lista do que vence, quando e em que pé está, com alertas.

## Diferencial

- **Peça no estilo do advogado.** Nenhum concorrente analisado entrega isso. A ADVBOX parte de modelos e aprende o padrão de aprovação da equipe, não o jeito de escrever.
- **Fluxo completo num lugar só:** intimação → prazo → peça → protocolo.
- **Preço para o solo:** intimação + prazo + peça por R$ 129, contra R$ 450+ na ADVBOX.
- **Transparência:** o prazo mostra a conta inteira e a peça marca o que precisa ser conferido.

## Concorrência

| Concorrente | O que faz | Ponto fraco para o nosso público |
|---|---|---|
| ADVBOX | Gestão completa, IA de intimações (Justin-e), copiloto (Donna), CRM, financeiro, BI | Caro e complexo para o solo; peças a partir de modelos |
| Jus IA (Jusbrasil) | Pesquisa e geração de documentos, grande base de jurisprudência | Não gerencia prazos nem aprende o estilo |
| Jurídico AI, ChatADV, LegJur | Geração de peças com IA | Ferramentas soltas, sem fluxo de prazo |
| ChatGPT/Claude genéricos | Escrevem qualquer coisa | Sem contexto do processo, sem prazos, risco de alucinação |

## O que o produto não é

- Não é um modelo de IA treinado do zero. Usa a API de modelos existentes (Claude) com contexto, RAG e regras.
- Não protocola peças nos tribunais. O advogado protocola.
- Não substitui a revisão do advogado. Toda peça é rascunho.
- No MVP, não é um sistema de gestão de escritório (CRM, financeiro, BI ficam para fases futuras).
