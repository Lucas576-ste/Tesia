export const BASE_CONHECIMENTO = `# Como a Tesia funciona

A Tesia é um agente de IA para advogados solo e duplas. Ela lê a intimação em PDF, resume o que aconteceu, aponta o que pode ser atacado, sugere a peça cabível e gera um rascunho no estilo do advogado. A IA extrai os dados, o código calcula o prazo e o advogado confirma. O advogado revisa, baixa em .docx e protocola; a Tesia nunca protocola.

## Telas do app
- Painel (/app): prazos em aberto ordenados por vencimento, com alerta para prazo crítico, contadores clicáveis (vencem em até 3 dias, rascunhos para revisar, protocolados no mês) e alternância Lista ou Quadro. Prazos manuais e audiências aparecem junto.
- Intimações (/app/intimacoes): lista das intimações. "Nova intimação" (/app/intimacoes/nova) recebe o PDF, mostra o progresso (lendo documento, identificando o ato, calculando prazo) e abre a análise.
- Análise da intimação (/app/intimacoes/:id): "O que aconteceu" (resumo curto), "Pontos que podem ser atacados", "Prazo sugerido" com a memória de cálculo e o botão "Confirmo o prazo", "Peça sugerida" (recomendada e alternativas) e o botão "Gerar rascunho no meu estilo".
- Processos (/app/processos e /app/processos/:id): criados automaticamente a partir das intimações. O detalhe mostra dados do processo, datas dos prazos (início da contagem, prazo interno, prazo fatal) e a linha do tempo.
- Prazos (/app/prazos): todos os prazos com status, vencimento e prazo interno.
- Peças (/app/pecas e /app/pecas/:id): lista das peças e o editor do rascunho.
- Clientes (/app/clientes): cadastro de clientes e acompanhamento dos processos de cada um.
- Meu estilo (/app/estilo): peças do advogado que a Lia usa para aprender o jeito dele de escrever.
- Configurações (/app/configuracoes): Perfil, Alertas, Agenda, Modelo de documento (timbrado), Calendário (feriados próprios), Segurança e Dados.
- Plano e uso (/app/plano): plano atual e uso de peças do dia.

## Prazo
- A IA só identifica os dados da intimação (tribunal, rito, tipo de ato, data de disponibilização, resultado). O cálculo é feito por código, a partir de regras e calendários cadastrados.
- O prazo só entra no painel como confirmado depois que o advogado confirma, e pode editar as datas. A conta inteira (memória de cálculo) fica visível antes de confirmar.
- Publicação em diário eletrônico: a publicação é o primeiro dia útil seguinte à disponibilização, e o prazo começa no primeiro dia útil seguinte à publicação. Intimação pelo portal do tribunal: a ciência é a abertura da intimação ou, sem abertura, o 10º dia corrido após o envio (adiado para o próximo dia útil); o prazo começa no dia útil seguinte à ciência.
- Processo civil, Juizados e trabalho contam em dias úteis; processo penal conta em dias corridos. Prazo que vence em dia sem expediente passa para o primeiro dia útil seguinte.
- Dias não úteis considerados: sábados, domingos, feriados nacionais, estaduais e municipais, suspensões e pontos facultativos do tribunal e os feriados que o próprio advogado cadastrar em Configurações, Calendário. Há calendários do TRF1 e do TRT10 no DF; para o TJDFT e outros tribunais, a Tesia avisa para o advogado conferir feriados e suspensões.
- Citação não tem cálculo automático: a tela pede a data.
- O prazo interno é uma data de segurança do advogado, anterior ao prazo fatal.
- Alertas de prazo chegam por e-mail em até 5 dias úteis antes, 2 dias úteis antes, no dia do prazo fatal e no dia do prazo interno; o advogado escolhe em Configurações, Alertas.

## Peças e rascunho
- O rascunho vem no estilo do advogado, com pontos [CONFIRMAR] destacados em amarelo para ele conferir.
- No editor, o painel lateral lista as pendências, mostra como a peça foi montado e tem o campo "Pedir ajuste à IA" (3 ajustes por peça).
- O download em .docx é liberado mesmo com pendências, mas o sistema avisa quantas existem. Depois de protocolar no tribunal, o advogado marca "Marcar como protocolado".
- Para baixar com o timbrado: enviar o .docx timbrado em Configurações, Modelo de documento. A peça usa cabeçalho, rodapé, fontes e margens do arquivo; "Baixar peça de teste" mostra o resultado.
- Todo rascunho é gerado por IA e deve ser revisado antes de protocolar.

## Meu estilo
- O estilo vem de peças do próprio advogado (PDF ou .docx, de 5 a 10). Quanto mais variadas, melhor o rascunho. Níveis: Básico (1 a 4 peças), Bom (5 a 7), Ótimo (8 a 10).
- A tela mostra o que a Lia aprendeu por parte da peça (abertura, fatos, fundamentação, pedidos, fechamento). Em cada item o advogado marca "Está certo" ou "Não sou assim" e pode explicar "Como você faz?"; a correção vale na próxima atualização, em "Atualizar meu estilo".

## Clientes e processos
- Processos nascem das intimações. Um processo sem cliente aparece como "Sem cliente definido"; para vincular, abra o processo ou o cliente e use "Vincular cliente".

## O que a Tesia não faz
- Não protocola peças, não dá parecer jurídico nem pesquisa jurisprudência, e não garante o resultado de uma tese. A decisão e a assinatura são do advogado.`;
