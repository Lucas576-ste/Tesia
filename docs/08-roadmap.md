# 08 — Roadmap

Regra: **só avançar de fase quando a anterior tiver clientes pagando.**

## Fase 0 — Validação (1 a 2 semanas)
- [x] Conversas com advogados sobre as dores (feito: dores confirmadas, ADVBOX citada como referência)
- [ ] Mostrar o protótipo para 5 advogados e coletar reações
- [ ] Teste manual: gerar 3 a 5 peças reais com Claude e o prompt de estilo, e perguntar se pagariam
- [ ] Recrutar 1 advogado por área de lançamento para revisar regras de prazo e peças

## Fase 1 — Mínimo (4 a 6 semanas)
Objetivo: primeiros 20 a 50 clientes pagantes.
- [ ] Monorepo (web, worker, packages)
- [ ] Cadastro, login, escolha de áreas
- [ ] Assinatura com Asaas (Start e Pro) e teste grátis
- [ ] Upload de peças antigas e perfil de estilo
- [ ] Upload de intimação, extração de texto e OCR de reserva
- [ ] Extração, resumo e escolha da peça
- [ ] Motor de prazos com feriados nacionais e tribunais do DF
- [ ] Geração do rascunho com pendências destacadas
- [ ] Editor simples e download em .docx com modelo do advogado
- [ ] Painel de prazos
- [ ] Alertas por e-mail
- [ ] Controle de limites e uso
- [ ] Termos de uso e política de privacidade

## Fase 2 — Intermediário
Objetivo: reduzir cancelamento e aumentar o ticket.
- [ ] Busca automática de intimações pela OAB (DJEN ou API paga)
- [ ] Cadastro de processos e clientes com histórico
- [ ] Agenda de prazos e audiências
- [ ] Alertas por WhatsApp
- [ ] Novas peças por área e áreas criminal e tributária
- [ ] Biblioteca de teses do advogado
- [ ] Conferência de jurisprudência (ao menos súmulas dos tribunais superiores)
- [ ] Controle simples de honorários
- [ ] Plano Plus (conteúdo para Instagram, reaproveitando o projeto atual)
- [ ] Calendários de mais tribunais

## Fase 3 — Avançado (escritórios)
Só se houver demanda real de escritórios maiores.
- [ ] Multiusuário com perfis e permissões
- [ ] Distribuição de intimações e tarefas, com fluxo de aprovação
- [ ] Estilo por advogado e estilo do escritório
- [ ] Kanban e workflows configuráveis
- [ ] Financeiro completo (contratos, cobrança, repasses)
- [ ] CRM e atendimento por WhatsApp
- [ ] Relatórios e indicadores de produtividade
- [ ] API pública e importação de outros sistemas
- [ ] Auditoria completa e contrato de tratamento de dados para escritórios

## Funcionalidades inspiradas na ADVBOX, por fase

| Funcionalidade ADVBOX | Fase na Tesia |
|---|---|
| Leitura de intimações e cálculo de prazos | 1 (upload) e 2 (automática) |
| Modelos de petições / petições com IA | 1 (peça no estilo do advogado) |
| Monitoramento de intimações via DJEN | 2 |
| Gestão de tarefas e prazos | 1 (painel) e 3 (tarefas da equipe) |
| CRM e automações de atendimento | 3 |
| Financeiro integrado | 2 (honorários simples) e 3 (completo) |
| Workflow e kanban | 3 |
| Controladoria jurídica | 3 |
| BI e relatórios | 3 |
| Hub de integrações e API | 3 |
