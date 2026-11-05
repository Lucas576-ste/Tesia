# 13 — Telas

Este documento lista todas as telas do produto, a rota de cada uma, a fase em que entram e o que cada tela contém.

Protótipo visual das telas principais: canvas "Protótipo Agente Jurídico" (Meu estilo, Painel de prazos, Nova intimação, Rascunho da peça, Conteúdo).

## Resumo

| Fase | Quantidade de telas |
|---|---|
| MVP | 19 telas + 3 modais |
| Plus | 2 telas |
| Fase 2 (intermediário) | 6 telas |
| Fase 3 (avançado) | 6 telas |
| Backoffice interno | 5 telas (fase 2; no MVP usar o Supabase Studio) |

## Mapa de navegação

```
Site público
├── Landing (/)
├── Preços (/precos)
├── Calculadora de prazos (/calculadora-de-prazos)        [pós-MVP]
├── Cadastro (/cadastro) ──► Onboarding
├── Login (/login)
├── Recuperar senha (/recuperar-senha)
└── Termos e privacidade (/termos, /privacidade)

Onboarding (primeiro acesso)
├── 1. Dados profissionais (/onboarding/perfil)
├── 2. Ensinar o estilo (/onboarding/estilo)
└── 3. Modelo de documento (/onboarding/modelo) ──► Painel

Aplicativo (menu lateral)
├── Painel de prazos (/app)                     ← tela inicial
├── Nova intimação (/app/intimacoes/nova)
│     └── Análise da intimação (/app/intimacoes/:id)
│           └── Editor da peça (/app/pecas/:id)
├── Processos (/app/processos)
│     └── Detalhe do processo (/app/processos/:id)
├── Peças (/app/pecas)
├── Meu estilo (/app/estilo)
├── Conteúdo [Plus] (/app/conteudo)
│     └── Calendário (/app/conteudo/calendario)
└── Conta
      ├── Configurações (/app/configuracoes)
      └── Plano e uso (/app/plano)
```

## Elementos comuns a todas as telas do aplicativo

- **Menu lateral:** Painel, Nova intimação, Processos, Peças, Meu estilo, Conteúdo (com selo Plus, só quando o plano Plus entrar, depois do dia 35), e no rodapé o nome do advogado, OAB e acesso à Conta. No celular, vira menu inferior ou menu recolhido.
- **Barra superior:** botão "+ Nova intimação", busca de processos por número ou parte (atalho Ctrl+K), indicador de uso do mês (ex.: "32 de 50 peças", com barra de progresso), sino de notificações e ajuda.
- **Aviso de prazo crítico** (enquanto os dados são de exemplo, aparece só no painel; volta a todas as telas quando houver dados reais)**:** faixa branca quando houver prazo confirmado vencendo em até 3 dias úteis, com ícone e filete lateral coloridos: âmbar, ou vermelho quando vencer no dia.
- **Mensagens rápidas (toasts):** sucesso, erro e processamento concluído.
- **Estados de toda tela:** carregando, vazio (com orientação do que fazer) e erro (com opção de tentar de novo).

---

## Site público

### 1. Landing (`/`) — MVP
**Objetivo:** explicar o produto e levar à ação. Textos, ordem e CTAs seguem `15-landing.md`, que prevalece sobre a lista abaixo.
- Título com a promessa principal: intimação → prazo → peça no seu estilo
- Demonstração em vídeo curto ou GIF do fluxo
- Como funciona em 3 passos
- Diferenciais: estilo do advogado, prazo com a conta explicada, pontos a conferir destacados
- Áreas atendidas (com "em breve")
- Depoimentos dos clientes fundadores
- Preços resumidos
- Perguntas frequentes (segurança, LGPD, responsabilidade pela peça)
- Botão "Testar grátis por 7 dias"

### 2. Preços (`/precos`) — MVP
- Cards dos planos Start, Pro e Plus (add-on)
- Alternância mensal/anual
- Tabela comparativa de recursos
- Perguntas sobre limites, cancelamento e pagamento

### 3. Calculadora de prazos (`/calculadora-de-prazos`) — pós-MVP
**Objetivo:** isca gratuita para captar advogados.
- Campos: área, rito, tribunal, tipo de ato, data de disponibilização
- Resultado: data de vencimento e memória de cálculo
- Campo de e-mail para receber o resultado
- Chamada para testar o produto completo

### 4. Cadastro (`/cadastro`) — MVP
- Nome, e-mail, senha (ou entrar com Google)
- Aceite dos termos de uso e da política de privacidade
- Início do teste grátis, sem cartão

### 5. Login (`/login`) — MVP
- E-mail e senha, entrar com Google, link para recuperar senha

### 6. Recuperar senha (`/recuperar-senha`) — MVP
- Envio de link por e-mail e tela de nova senha

### 7. Termos e privacidade (`/termos`, `/privacidade`) — MVP
- Textos legais (ver `09-seguranca-e-lgpd.md`)

---

## Onboarding

Barra de progresso com 3 passos. O advogado pode pular os passos 2 e 3 e voltar depois.

A Lia conduz o fluxo. Se a UF não for DF, ou se o tribunal não estiver na lista, o passo 1 avisa que os calendários locais cobrem só o DF.

### 8. Dados profissionais (`/onboarding/perfil`) — MVP
- Número da OAB e UF
- Áreas de atuação (seleção múltipla, áreas "em breve" desabilitadas). No plano Start, só uma.
- Tribunais em que mais atua (para priorizar calendários)
- WhatsApp para alertas (opcional)

### 9. Ensinar o estilo (`/onboarding/estilo`) — MVP (protótipo)
- Área de upload: arrastar de 5 a 10 peças em PDF ou Word
- Lista de arquivos com status: enviando, lendo, lido, erro
- Painel "O que aprendi sobre você": frases do perfil de estilo
- Aviso ao pular: o rascunho fica genérico até ele enviar peças

### 10. Modelo de documento (`/onboarding/modelo`) — MVP
- Upload de um .docx com papel timbrado
- Pré-visualização de como a peça vai sair
- Opção "usar modelo padrão"
- Botão "Concluir e ir ao painel"

---

## Aplicativo

### 11. Painel de prazos (`/app`) — MVP (protótipo)
**Objetivo:** mostrar o que vence e o que fazer primeiro.
- Saudação e resumo do dia ("4 prazos em aberto")
- Faixa de alerta para prazo crítico, com botão "Começar agora"
- Indicadores: vencem em até 3 dias, rascunhos para revisar, protocolados no mês
- Tabela de prazos: processo, peça, vencimento, dias restantes, status (não iniciado, rascunho pronto, protocolado)
- Filtros: status, área, período
- Ações por linha: abrir análise, abrir peça, marcar como protocolado
- Estado vazio: "Envie sua primeira intimação"

### 12. Nova intimação (`/app/intimacoes/nova`) — MVP (protótipo)
- Área de upload do PDF (uma ou várias intimações)
- Campo opcional: vincular a um processo existente
- Após o envio, mostra o progresso: lendo documento, identificando o ato, calculando prazo
- Redireciona para a análise

### 13. Análise da intimação (`/app/intimacoes/:id`) — MVP (protótipo)
- Cabeçalho: número do processo, órgão, partes
- **O que aconteceu:** resumo em até 4 frases
- **Pontos que podem ser atacados:** tópicos com link para o trecho da decisão
- **Prazo sugerido:** data, dias, tipo de contagem, fundamento legal e memória de cálculo expansível; botão "Confirmo o prazo" e opção de editar a data
- **Peça sugerida:** recomendada e alternativas (seleção única)
- Visualizador do PDF original ao lado (ou em aba no celular)
- Botão "Gerar rascunho no meu estilo" (mostra quantas peças restam no mês)
- Estado de erro: documento ilegível, com opção de enviar de novo

### 14. Editor da peça (`/app/pecas/:id`) — MVP (protótipo)
- Cabeçalho: tipo de peça, processo, vencimento, status de salvamento
- Editor de texto com a peça, pontos `[CONFIRMAR]` destacados em amarelo
- Painel lateral:
  - Lista de pendências (clicar leva ao trecho)
  - Como foi montado: peças do advogado usadas como base e documentos de origem
  - Campo "Pedir ajuste à IA" (mostra ajustes restantes: 3 por peça)
- Histórico de versões
- Ações: baixar .docx (avisa se houver pendências), marcar como protocolado
- Aviso fixo discreto: "Rascunho gerado por IA. Revise antes de protocolar."

### 15. Processos (`/app/processos`) — MVP (simples)
- Lista criada automaticamente a partir das intimações
- Colunas: número, partes, área, tribunal, próximo prazo, status
- Busca por número ou nome da parte

### 16. Detalhe do processo (`/app/processos/:id`) — MVP (simples)
- Dados do processo (editáveis)
- Linha do tempo: intimações, prazos e peças
- Botão "Nova intimação neste processo"

### 17. Peças (`/app/pecas`) — MVP
- Lista de todas as peças: título, processo, tipo, data, status
- Filtros: tipo, área, status
- Ações: abrir, baixar, duplicar

### 18. Meu estilo (`/app/estilo`) — MVP
- Peças enviadas, com opção de adicionar e remover
- Perfil de estilo: "O que aprendi sobre você"
- Botão "Atualizar meu estilo" depois de mudanças
- Opção: usar peças revisadas no sistema para melhorar o estilo (ligada por padrão)

### 19. Configurações (`/app/configuracoes`) — MVP
Abas:
- **Perfil:** nome, OAB, UF, áreas, tribunais
- **Alertas:** canais (e-mail, WhatsApp) e dias de antecedência
- **Modelo de documento:** trocar o .docx timbrado
- **Calendário:** feriados e suspensões próprios do escritório
- **Segurança:** senha, sessões ativas
- **Dados:** exportar tudo e excluir conta

### 20. Plano e uso (`/app/plano`) — MVP
- Plano atual, próxima cobrança e forma de pagamento
- Uso do mês: peças geradas, extras, posts (barras de progresso)
- Botões: mudar de plano, comprar pacote extra, assinar o Plus
- Histórico de faturas e notas fiscais
- Cancelar assinatura (com opção de exportar os dados antes)

### Modais do MVP
- **M1. Limite atingido:** aviso aos 80% e bloqueio aos 100%, com opções de pacote extra ou upgrade
- **M2. Fim do teste grátis:** escolha do plano e pagamento
- **M3. Confirmação de prazo editado:** registra a data sugerida e a data escolhida

---

## Plus (conteúdo)

### 21. Conteúdo (`/app/conteudo`) — Plus (protótipo)
- Sugestão da semana baseada nos tipos de caso do mês (sem dados de cliente)
- Pré-visualização do post ou carrossel
- Editor da legenda
- Selo da checagem de publicidade da OAB
- Ações: aprovar e agendar, gerar outra versão, baixar imagens
- Sem Plus: mostra os 2 posts grátis do mês e o convite para assinar

### 22. Calendário de conteúdo (`/app/conteudo/calendario`) — Plus
- Visão semanal e mensal
- Posts sugeridos, aprovados, agendados e publicados
- Arrastar para mudar a data

---

## Fase 2 (intermediário)

| Tela | Rota | Conteúdo |
|---|---|---|
| Caixa de intimações | `/app/intimacoes` | Intimações que chegam sozinhas pela OAB, com status (nova, analisada, peça gerada) |
| Agenda | `/app/agenda` | Calendário com prazos e audiências |
| Clientes | `/app/clientes` | Lista de clientes |
| Detalhe do cliente | `/app/clientes/:id` | Dados, processos e honorários |
| Biblioteca de teses | `/app/teses` | Argumentações salvas, por área e assunto, para reaproveitar |
| Honorários | `/app/honorarios` | Valores combinados, recebidos e em aberto por cliente |

## Fase 3 (avançado)

| Tela | Rota | Conteúdo |
|---|---|---|
| Equipe | `/app/equipe` | Usuários, convites, perfis e permissões |
| Tarefas | `/app/tarefas` | Kanban com distribuição de intimações e aprovação de peças |
| Financeiro | `/app/financeiro` | Contratos, cobranças, repasses |
| CRM | `/app/crm` | Funil de atendimento e conversas por WhatsApp |
| Relatórios | `/app/relatorios` | Produtividade, prazos cumpridos, peças por advogado |
| Estilo do escritório | `/app/estilo/escritorio` | Estilo comum a todos os advogados |

## Backoffice interno (uso do fundador)

No MVP, essas tarefas são feitas direto no Supabase Studio. As telas entram na fase 2.

| Tela | Conteúdo |
|---|---|
| Clientes e assinaturas | Escritórios, plano, status de pagamento, uso |
| Custos de IA | Tokens e custo por escritório e por etapa |
| Regras de prazo | Cadastro e revisão das regras por área, rito e ato |
| Calendários | Feriados e suspensões por tribunal, com a fonte |
| Tipos de peça | Estrutura e instruções de cada peça |

## Responsividade

- Todas as telas funcionam no celular.
- No celular, o foco é consultar o painel, ver a análise e confirmar prazos. Edição longa de peças é pensada para o computador, mas funciona no celular.
