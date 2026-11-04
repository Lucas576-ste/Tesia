# 05 — Regras de negócio

## Áreas

- A plataforma é generalista. No cadastro, o advogado escolhe as áreas em que atua.
- Cada área traz seus tipos de peça e regras de prazo.
- **Lançamento:** cível/consumidor, trabalhista, previdenciário e família.
- **Em breve:** criminal e tributário. Aparecem na lista como "em breve" para medir interesse.
- Uma área só é ativada quando tiver peças, regras de prazo e testes revisados por um advogado daquela área.

## Peças por área (lançamento)

| Área | Peças |
|---|---|
| Cível/consumidor | Petição inicial, contestação, réplica, apelação, cumprimento de sentença |
| Trabalhista | Reclamação trabalhista, contestação, recurso ordinário, manifestação sobre cálculos |
| Previdenciário | Petição inicial, recurso inominado, manifestação sobre laudo, contrarrazões |
| Família | Divórcio, alimentos, guarda, contestação |
| Todas as áreas | Embargos de declaração, manifestação simples |

## Planos

| Plano | Preço/mês | Peças/mês | Áreas | Usuários | Recursos |
|---|---|---|---|---|---|
| Start | R$ 79 | 15 | 1 | 1 | Intimação por upload, prazos, rascunho no estilo, alerta por e-mail |
| Pro | R$ 129 | 50 | Todas | 1 | Tudo do Start + alertas por WhatsApp + busca automática de intimações (quando existir) |
| Plus (add-on) | + R$ 49 | — | — | — | Conteúdo para Instagram: 20 posts/mês e calendário |
| Escritório (futuro) | R$ 299 | 150 | Todas | 3 | Tudo do Pro + distribuição de tarefas |

Regras:
- **Teste grátis:** 7 dias, com limite de 5 peças, sem cartão.
- **Resumo e análise de intimações:** ilimitados em todos os planos (custo de IA quase zero).
- **Contagem de peça:** cada geração de rascunho conta 1 peça. Até 3 ajustes pela IA na mesma peça não contam. A partir do 4º ajuste, conta como nova peça.
- **Pacote extra:** 10 peças por R$ 19, válido no mês da compra.
- **Limite atingido:** o sistema avisa ao chegar em 80% e bloqueia novas gerações em 100%, oferecendo o pacote extra ou o upgrade. Análise de intimações e prazos continuam funcionando.
- **Inadimplência:** 5 dias de tolerância. Depois, a conta fica só leitura (o advogado vê prazos e baixa peças, mas não gera novas). Os dados nunca são apagados por inadimplência antes de 90 dias.
- **Cancelamento:** o acesso vai até o fim do período pago. O advogado pode exportar todas as peças antes de sair.
- **Pagamento:** Asaas, por Pix, boleto ou cartão recorrente. Plano anual com desconto de 2 meses.

## Fluxo do usuário

### Primeiro acesso
1. Cadastro com nome, e-mail, OAB e UF.
2. Escolha das áreas de atuação.
3. Envio de 5 a 10 peças antigas (pode pular, mas o sistema avisa que o rascunho fica genérico).
4. Envio opcional do modelo .docx com timbrado.
5. Tela "O que aprendi sobre você", com o resumo do estilo.

### Nova intimação
1. Envio do PDF (MVP) ou chegada automática (intermediário).
2. Análise: processo, partes, o que aconteceu, pontos que podem ser atacados.
3. Prazo sugerido com memória de cálculo. **O prazo só entra no painel como confirmado depois que o advogado confirma.**
4. Peça sugerida, com alternativas.
5. Geração do rascunho.

### Rascunho
1. Editor com a peça e os pontos `[CONFIRMAR]` destacados.
2. Painel lateral com as pendências, as fontes usadas e o campo "Pedir ajuste à IA".
3. **Download liberado mesmo com pendências**, mas o sistema avisa quantas existem.
4. Botão "Marcar como protocolado", que conclui o prazo.

### Painel
- Lista de prazos ordenada por vencimento, com status: não iniciado, rascunho pronto, protocolado.
- Destaque para prazos que vencem em até 3 dias úteis.
- Indicadores: vencem em até 3 dias, rascunhos para revisar, protocolados no mês.

## Alertas de prazo

- E-mail (todos os planos) e WhatsApp (Pro): 5 dias úteis antes, 2 dias úteis antes e no dia do vencimento.
- Alerta só para prazos confirmados e não cumpridos.
- O advogado pode ajustar os dias de antecedência.

## Plano Plus (conteúdo)

- Sugestões de tema baseadas nas áreas e nos tipos de caso do mês, **sem nunca citar cliente, número de processo ou dado identificável**.
- Toda sugestão passa por uma checagem das regras de publicidade da advocacia: tom informativo, sem promessa de resultado, sem captação de clientela, sem preço.
- O advogado aprova cada post antes de agendar.
- No plano Pro sem Plus, o sistema oferece 2 posts grátis por mês para mostrar o recurso.

## Responsabilidade

- Toda peça é um rascunho. A revisão e o protocolo são responsabilidade do advogado. Isso aparece nos termos de uso e no editor.
- Todo prazo é uma sugestão até ser confirmado pelo advogado.
- O sistema nunca protocola nada em nome do advogado.
