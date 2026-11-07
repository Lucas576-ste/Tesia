# 08 — Roadmap

Regra: **só avançar de fase quando a anterior tiver clientes pagando.**

## Fase 0 — Validação (1 a 2 semanas)
- [x] Conversas com advogados sobre as dores (feito: dores confirmadas, ADVBOX citada como referência)
- [ ] Mostrar o protótipo para 5 advogados e coletar reações
- [ ] Teste manual: gerar 3 a 5 peças reais com Claude e o prompt de estilo, e perguntar se pagariam
- [ ] Recrutar 1 advogado por área de lançamento para revisar regras de prazo e peças

## Fase 1 — MVP (35 dias, ver `14-cronograma-35-dias.md`)
Objetivo: beta com os clientes fundadores.
- [ ] Monorepo (web, worker, packages)
- [ ] Cadastro, login, escolha de áreas
- [ ] Upload de peças antigas e perfil de estilo
- [ ] Upload de intimação, extração de texto e OCR de reserva
- [ ] Extração, resumo e escolha da peça
- [ ] Motor de prazos com feriados nacionais e tribunais do DF
- [ ] Prazos manuais (prazo, audiência, compromisso) pelo botão "+ Adicionar"
- [ ] Prazo interno, com início da contagem e prazo fatal nas telas
- [ ] Geração do rascunho com pendências destacadas
- [ ] Editor simples e download em .docx com modelo do advogado
- [ ] Painel de prazos em Lista ou Quadro, com contadores clicáveis
- [ ] Alertas por e-mail
- [ ] Indicar a Tesia (tela simples com link de indicação)
- [ ] Controle de limites e uso
- [ ] Termos de uso e política de privacidade
- [x] Modo escuro e escolha de tema (Claro, Escuro, Sistema)
- [ ] Agenda sincronizada por link iCal (se couber no dia 28 de folga)

## Fase 1.5 — Logo após o MVP (nesta ordem)
1. [ ] Cobrança pelo Asaas (antes do fim dos 15 dias grátis do primeiro fundador)
2. [ ] Busca automática de intimações pela OAB (DJEN ou API paga), com cards sugeridos no Quadro e status visível em Processos. É a maior lacuna em relação à concorrência.
3. [ ] Agenda sincronizada por link iCal (Google, Apple, Outlook), se não entrou no MVP
4. [ ] Plano Sociedade: 2 advogados, convite, responsável por prazo e peça, filtro "Meus prazos"
5. [ ] Relatório do mês (prazos cumpridos, peças geradas, horas economizadas) e honorários simples
6. [ ] Plano Plus (conteúdo para Instagram) e calculadora de prazos pública

## Fase 2 — Intermediário
Objetivo: reduzir cancelamento e aumentar o ticket.
- [ ] Cadastro de clientes com histórico
- [ ] Campo `sistema` no processo e fase estimada pela última intimação
- [ ] Agenda dentro da Tesia com prazos internos, prazos fatais e audiências, com filtro por área
- [ ] Alertas por WhatsApp
- [ ] Novas peças por área e áreas criminal e tributária
- [ ] Biblioteca de teses do advogado
- [ ] Conferência de jurisprudência (ao menos súmulas dos tribunais superiores)
- [ ] Busca que responde perguntas (`Ctrl+K`: "quais prazos vencem esta semana?")
- [ ] Calendários de mais tribunais

## Fase 3 — Avançado (escritórios)
Só se houver demanda real de escritórios maiores.
- [ ] Plano Escritório (3 ou mais advogados) com perfis e permissões
- [ ] Distribuição de intimações e tarefas, com fluxo de aprovação
- [ ] Estilo do escritório, além do estilo de cada advogado
- [ ] Workflows configuráveis
- [ ] Financeiro completo (contratos, cobrança, repasses)
- [ ] CRM e atendimento por WhatsApp
- [ ] Relatórios de produtividade por advogado
- [ ] API pública e importação de outros sistemas
- [ ] Auditoria completa e contrato de tratamento de dados para escritórios

## Funções de gestão: o que entra e em que versão

A Tesia não tenta igualar um sistema de gestão completo. Entram só versões leves, que o advogado solo e a sociedade pequena usam toda semana.

| Função | Versão Tesia | Fase |
|---|---|---|
| Kanban | Painel de prazos em Lista ou Quadro | 1 |
| Agenda Google/Apple/Outlook | Link iCal com prazos e audiências, do plano Pro em diante | 1 (se couber) ou 1.5 |
| Equipe | Plano Sociedade (2 advogados) | 1.5 |
| BI | Relatório do mês com horas economizadas | 1.5 |
| Financeiro | Honorários simples por cliente | 1.5 |
| CRM | Lista de clientes com histórico | 2 |

Ficam de fora: CRM com funil de vendas, financeiro completo, BI avançado, kanban de tarefas genérico e equipe com perfis (só na fase 3, se houver demanda).

## Funcionalidades inspiradas na ADVBOX, por fase

| Funcionalidade ADVBOX | Fase na Tesia |
|---|---|
| Leitura de intimações e cálculo de prazos | 1 (upload) e 1.5 (automática) |
| Modelos de petições / petições com IA | 1 (peça no estilo do advogado) |
| Monitoramento de intimações via DJEN | 1.5 |
| Gestão de tarefas e prazos | 1 (painel em Lista ou Quadro) |
| Integração com agendas | 1 ou 1.5 (iCal) |
| Controle de produtividade da equipe | 1.5 (Sociedade) e 3 (Escritório) |
| CRM e automações de atendimento | 2 (lista de clientes) e 3 |
| Financeiro integrado | 1.5 (honorários simples) e 3 (completo) |
| Workflow | 3 |
| Controladoria jurídica | 3 |
| BI e relatórios | 1.5 (relatório do mês) e 3 |
| Hub de integrações e API | 3 |
| Indicação dentro do produto | 1 (Indicar a Tesia) |
