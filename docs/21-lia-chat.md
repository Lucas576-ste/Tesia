# 21 — Chat da Lia

**Status:** versão 1 no app (`/app/*`). Ajuda sobre como usar a Tesia e explicação do que está na tela (prazo, intimação, estilo, peças). Não responde dúvidas jurídicas abertas.

## O que a Lia faz e não faz
- Faz: explica telas e recursos, mostra a conta do prazo com as datas reais do item aberto, orienta onde clicar, sugere próximos passos com botões (abrir rascunho, ver prazo, ir para Meu estilo, vincular cliente).
- Não faz: parecer jurídico, jurisprudência, escolha de tese. Perguntas assim recebem a resposta padrão "Nesta versão eu ajudo com o uso da Tesia e com o que está na sua tela. Para dúvidas jurídicas, confira nas fontes oficiais." com links do que ela pode fazer. Um filtro simples (`porteiro.ts`) responde sem chamar o modelo; o prompt cobre os demais casos.

## Como funciona
- Botão com o avatar da Lia (Ctrl+J abre e fecha), flutuante no computador, com o painel acima dele, e no topo à direita no celular; no celular o painel ocupa a tela inteira.
- Cada pergunta vai para `POST /api/lia`, que valida (até 2.000 caracteres), confere o limite diário do plano, grava a pergunta, monta o contexto, chama o Claude Haiku com streaming (NDJSON) e grava a resposta.
- O web chama o SDK da Anthropic direto porque o Next não compila o pacote `@tesia/ia` (imports `.js`). Prompt e base de conhecimento ficam em `apps/web/src/lib/lia/`.
- A base de conhecimento (`base-conhecimento.ts`) é um texto curado do produto, sem custos nem estratégia interna. Quando uma tela ou regra mudar, atualizar esse arquivo junto com `13-telas.md`.

## Contexto enviado à IA
- Sempre: rota atual, nome do plano, data de hoje, contagens (prazos vencendo em até 2 dias, vencidos, intimações novas) e os próximos prazos (descrição, data e número CNJ), sem nomes de partes.
- Só na tela de um processo, intimação ou peça: o detalhe daquele item (resumo, prazos com memória de cálculo e, no processo, cliente e parte contrária). O acesso respeita o RLS do usuário.
- A conversa guarda apenas a rota e o plano em `contexto_json`.

## Dados e privacidade
- Tabelas `conversas_lia` e `mensagens_lia`, visíveis só para o próprio usuário (RLS). O usuário vê as conversas anteriores e apaga cada uma.
- Retenção: o worker apaga conversas com mais de `LIA_RETENCAO_DIAS` dias (padrão 90), uma vez por dia. A tela mostra o prazo pelo valor de `NEXT_PUBLIC_LIA_RETENCAO_DIAS` (padrão 90); manter as duas variáveis iguais.
- Texto "Como a Lia usa seus dados" no rodapé do painel.

## Limites e custo
- Perguntas por dia por plano em `apps/web/src/lib/lia/limites.ts` (Start 15, Individual 30, Fundador 30, Sócio 50); `LIA_LIMITE_DIARIO` sobrescreve para testes. Contagem pela função `perguntas_lia_hoje()`, no fuso de Brasília.
- Máximo de 20 perguntas por minuto por usuário (`limitar`). Resposta com até 700 tokens. Contexto do item cortado em 6.000 caracteres e histórico de 12 mensagens.
- Custo de cada resposta em `uso_ia` (etapa `chat_lia`). Base e regras do prompt usam cache.

## Feedback e suporte
- 👍 e 👎 em cada resposta; no 👎, campo opcional "O que faltou?" (`avaliacao` e `avaliacao_comentario`).
- "Falar com uma pessoa" abre o WhatsApp (`NEXT_PUBLIC_WHATSAPP`) ou o e-mail (`NEXT_PUBLIC_CONTATO_EMAIL`).
