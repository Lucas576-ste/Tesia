# 14 — Cronograma do MVP em 35 dias

## Premissas

- **Tempo:** 2 horas por dia, durante 35 dias de trabalho = **70 horas**. Os dias não precisam ser seguidos.
- **Ferramenta:** o código é gerado com o Claude Code, a partir dos documentos desta pasta.
- **Ordem:** primeiro as telas com dados de exemplo (para visualizar o produto), depois o banco, o motor de prazos, a IA e o lançamento.
- **Lançamento ao fim dos 35 dias:** beta fechado com os clientes fundadores.

## O que foi cortado para caber em 70 horas

70 horas é apertado para o MVP completo. Para caber, estes itens ficam para depois do dia 35:

| Item | Por que pode esperar |
|---|---|
| Cobrança pelo Asaas | Os clientes fundadores têm 15 dias grátis. A cobrança precisa estar pronta até o fim desse período |
| Calculadora de prazos pública | É ferramenta de marketing da fase 20 → 50 clientes |
| Plano Plus (conteúdo) | Reaproveita o projeto atual depois do lançamento |
| NestJS | No MVP, a API fica nas rotas do Next.js + worker separado. NestJS entra quando escalar |
| Alertas por WhatsApp | No MVP, só e-mail |
| Peças além do essencial | Lançamento com 2 a 3 peças por área + embargos e manifestação simples |
| Calendários fora do DF | Lançamento com feriados nacionais + tribunais do DF |

Se o cronograma atrasar, corte nesta ordem: ajustes pela IA no editor (dia 26), revisão automática de citações (dia 26), tela de detalhe do processo (dia 29).

## Dia 0 — Preparação (antes de começar, ~1 h)

- [ ] Repositório no GitHub
- [ ] Conta no Supabase (projeto na região São Paulo)
- [ ] Conta na Vercel
- [ ] Chave da API do Claude
- [ ] Conta no provedor de embeddings (Voyage ou OpenAI)
- [ ] Conta no Resend e domínio
- [ ] Conta no Sentry
- [ ] Separar 10 peças reais (anonimizadas) e 5 intimações reais de pelo menos duas áreas, para testes

---

## Semana 1 — Fundação e telas (dias 1 a 7)

### Dia 1 — Monorepo e base
- Criar o monorepo com Turborepo + pnpm (`apps/web`, `apps/worker`, `packages/*`)
- Next.js + Tailwind + biblioteca de componentes (ex.: shadcn/ui)
- Cores, fontes e tokens visuais iguais ao protótipo
- Deploy de prévia na Vercel

**Pronto quando:** a página inicial abre no link da Vercel.

### Dia 2 — Layout do aplicativo e componentes
- Menu lateral (com Indicar a Tesia), barra superior com botão "+ Adicionar" e menu, faixa de alerta de prazo, botão de ajuda flutuante
- Componentes: botão, card, tabela, selo de status, área de upload, modal, toast
- Estados de carregando, vazio e erro

**Pronto quando:** uma página de exemplo mostra todos os componentes.

### Dia 3 — Telas públicas
- Landing simples, login, cadastro, recuperar senha, termos e privacidade (texto provisório)

**Pronto quando:** dá para navegar entre as telas públicas.

### Dia 4 — Onboarding
- Dados profissionais, ensinar o estilo, modelo de documento, barra de progresso
- Dados de exemplo (sem backend)

**Pronto quando:** o fluxo de primeiro acesso é navegável do início ao fim.

### Dia 5 — Painel de prazos
- Contadores compactos e clicáveis, alternância Lista | Quadro, tabela de prazos, filtros, estado vazio, faixa de prazo crítico

**Pronto quando:** o painel fica igual ao protótipo, com dados de exemplo.

### Dia 6 — Nova intimação e análise
- Upload com etapas de progresso
- Tela de análise: resumo, pontos atacáveis, prazo com memória de cálculo, peça sugerida, PDF ao lado

**Pronto quando:** o fluxo upload → análise é navegável.

### Dia 7 — Editor da peça
- Editor de texto (ex.: TipTap) com pendências destacadas
- Painel lateral: pendências, fontes, campo de ajuste
- Botões de baixar e marcar como protocolado

**Pronto quando:** o fluxo análise → editor é navegável.

---

## Semana 2 — Telas restantes, validação e banco (dias 8 a 14)

### Dia 8 — Processos e peças
- Lista de processos, detalhe do processo com linha do tempo, lista de peças

### Dia 9 — Conta
- Meu estilo, configurações (abas), plano e uso
- Modais: limite atingido, fim do teste grátis, prazo editado, novo prazo manual
- Tela Indicar a Tesia (simples)

**Pronto quando:** todas as 20 telas do MVP estão navegáveis com dados de exemplo.

### Dia 10 — Teste manual do prompt (validação da IA)
- Com as peças e intimações reais separadas no dia 0, testar no Claude os prompts de perfil de estilo, extração e geração (ver `07-ia-e-prompts.md`)
- Anotar o que funcionou e ajustar os prompts

**Por que aqui:** a qualidade do rascunho é o maior risco do produto. Descobrir agora custa 2 horas; descobrir no dia 30 custa o projeto.

### Dia 11 — Mostrar as telas a advogados
- Mostrar o app navegável para 2 ou 3 advogados
- Anotar o que confunde e o que falta
- Ajustes rápidos de UI

### Dia 12 — Banco de dados
- Projeto Supabase (São Paulo)
- Migrations das tabelas principais (ver `04-modelo-de-dados.md`): escritórios, usuários, processos, intimações, prazos, peças, estilo, referências, uso
- RLS em todas as tabelas com `escritorio_id`
- Já incluir os campos de prazo manual (`origem`, `tipo`, `hora`), `data_prazo_interno` e `responsavel_id` em prazos, `responsavel_id` em peças e `calendario_token` em usuários, para não precisar migrar depois

### Dia 13 — Autenticação
- Cadastro, login e recuperação com Supabase Auth
- Criar o escritório e o usuário no cadastro
- Onboarding salvando OAB, UF e áreas
- Teste automatizado: um escritório não acessa dados de outro

### Dia 14 — Dados de referência
- Seeds: áreas, tipos de peça do lançamento, regras de prazo, feriados nacionais e tribunais do DF
- Enviar a lista de regras de prazo para revisão de um advogado

---

## Semana 3 — Motor de prazos e análise da intimação (dias 15 a 21)

### Dia 15 — Motor de prazos (parte 1)
- `packages/prazos`: feriados nacionais (fixos e móveis), dias úteis, próximo dia útil
- Testes

### Dia 16 — Motor de prazos (parte 2)
- Disponibilização → publicação → início da contagem
- Dias úteis e corridos, suspensão de 20/12 a 20/01, feriados do tribunal e do escritório
- Memória de cálculo
- Cálculo do prazo interno (2 dias úteis antes do fatal)
- Testes com casos reais (virada de ano, feriado móvel, fim de mês)

**Pronto quando:** todos os testes passam.

### Dia 17 — Upload e fila
- Upload real para o storage, registro da intimação
- Fila no Postgres (pg-boss) e worker básico

**Pronto quando:** enviar um PDF cria um job que o worker processa.

### Dia 18 — Leitura do documento e cliente de IA
- Extração de texto do PDF, com leitura pelo Claude quando vier vazio
- `packages/ia`: cliente da API, registro de tokens e custo em `uso_ia`

### Dia 19 — Prompts da análise
- Extração (Haiku, JSON validado com zod)
- Resumo e pontos atacáveis
- Escolha da peça entre as opções do banco

### Dia 20 — Análise funcionando de ponta a ponta
- Worker grava extração, prazo calculado e resumo
- Tela de análise com dados reais e atualização ao terminar
- Confirmação do prazo → prazo aparece no painel real

**Pronto quando:** uma intimação real vira um prazo confirmado no painel.

### Dia 21 — Folga para atrasos
- Usar para terminar o que ficou pendente na semana

---

## Semana 4 — Estilo e geração da peça (dias 22 a 28)

### Dia 22 — Peças de estilo
- Upload das peças do advogado, extração de texto, divisão por seção
- Embeddings e gravação no pgvector

### Dia 23 — Perfil de estilo
- Prompt do perfil de estilo
- Tela "O que aprendi sobre você" e Meu estilo com dados reais

### Dia 24 — Geração da peça
- Busca das peças parecidas no pgvector
- Prompt de geração (Sonnet, com cache nas partes fixas)
- Job de geração e contagem de uso

### Dia 25 — Editor com dados reais
- Carregar a peça gerada, destacar pendências, salvar versões

**Pronto quando:** intimação → análise → rascunho no estilo do advogado funciona com dados reais.

### Dia 26 — Revisão e ajustes
- Revisão automática de citações (vira pendência no editor)
- Pedir ajuste à IA (até 3 por peça)

### Dia 27 — Download em .docx
- Preencher o modelo .docx do advogado (docxtemplater)
- Modelo padrão para quem não enviou o seu
- Aviso de pendências antes de baixar

### Dia 28 — Folga para atrasos
- Se não houver atraso: agenda sincronizada (link iCal com prazos confirmados, audiências e compromissos) e aba Agenda nas configurações

---

## Semana 5 — Finalização e lançamento beta (dias 29 a 35)

### Dia 29 — Telas com dados reais
- Processos, detalhe do processo e peças
- Marcar como protocolado conclui o prazo
- Novo prazo manual salvando de verdade e aparecendo no painel e nos alertas

### Dia 30 — Alertas e limites
- Alertas de prazo por e-mail (job agendado diário), incluindo o aviso no dia do prazo interno
- Limites por plano, aviso aos 80% e bloqueio aos 100%
- Tela Plano e uso com o consumo real

### Dia 31 — Segurança
- Rate limit, links de download temporários, Sentry em web e worker
- Backup diário configurado
- Repetir os testes de acesso entre escritórios

### Dia 32 — Produção
- Termos de uso e política de privacidade (rascunho, enviar para revisão)
- Landing final conforme `15-landing.md`, com as capturas reais das telas
- Deploy de produção: Vercel Pro (web) e Railway ou Render (worker)

### Dia 33 — Teste de ponta a ponta
- Rodar o fluxo completo com intimações reais de cada área
- Conferir prazos à mão e corrigir erros

### Dia 34 — Primeiros clientes fundadores
- Onboarding de 2 ou 3 advogados, junto com eles
- Anotar todos os problemas

### Dia 35 — Correções e próximos passos
- Corrigir o que apareceu no dia 34
- Atualizar `11-decisoes.md`
- Planejar o próximo ciclo

---

## Próximo ciclo (depois do dia 35)

Em ordem de prioridade:
1. Onboarding dos demais clientes fundadores (até 6)
2. Cobrança pelo Asaas (antes do fim dos 15 dias grátis do primeiro fundador)
3. Busca automática de intimações pela OAB
4. Agenda sincronizada (iCal), se não entrou no dia 28
5. Plano Sociedade (convite, responsável, "Meus prazos")
6. Relatório do mês e honorários simples
7. Mais peças por área e revisão das regras de prazo
8. Plano Plus e calculadora de prazos pública

Detalhes de cada item em `08-roadmap.md` (fase 1.5).

## Acompanhamento

| Semana | Entrega principal | Status |
|---|---|---|
| 1 | Telas principais navegáveis | |
| 2 | Todas as telas + validação da IA + banco e login | |
| 3 | Intimação real vira prazo confirmado | |
| 4 | Rascunho no estilo do advogado em .docx | |
| 5 | Beta em produção com os primeiros fundadores | |
