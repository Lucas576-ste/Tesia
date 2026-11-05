# 11 — Registro de decisões

Formato: data, decisão, motivo. Quando uma decisão mudar, adicione uma nova linha e marque a antiga como substituída.

## Decisões tomadas

| Data | Decisão | Motivo |
|---|---|---|
| 2026-11-03 | Pivotar do SaaS de conteúdo para Instagram para um agente do advogado (intimação → prazo → peça) | Conteúdo para Instagram é "bom de ter"; prazo e peça são dor recorrente |
| 2026-11-03 | O módulo de conteúdo vira add-on pago (Plus) | Reaproveita o que já foi construído e aumenta o ticket |
| 2026-11-03 | Público inicial: advogado solo e escritórios de 2 a 3 advogados | ADVBOX é cara e complexa para esse público |
| 2026-11-03 | Plataforma generalista: o advogado escolhe as áreas | Alcançar o máximo de clientes |
| 2026-11-03 | Lançar com 4 áreas: cível/consumidor, trabalhista, previdenciário, família | Cada área exige regras de prazo e peças bem feitas |
| 2026-11-03 | Diferencial: peça escrita no estilo do próprio advogado | Concorrentes partem de modelos genéricos |
| 2026-11-03 | Usar a ADVBOX como referência de funcionalidades, sem copiar textos, telas ou nomes | As dores dos advogados entrevistados batem com o que a ADVBOX resolve |
| 2026-11-03 | Não treinar modelo próprio; usar a API do Claude com RAG | Custo e tempo; a qualidade vem do contexto |
| 2026-11-03 | TypeScript de ponta a ponta, monorepo com Turborepo + pnpm | Domínio do time; compartilhamento de tipos |
| 2026-11-03 | Next.js + NestJS + worker + Supabase (São Paulo). **Substituída em 2026-11-04:** API nas rotas do Next.js no MVP | Stack conhecida; dados no Brasil |
| 2026-11-03 | Fila no Postgres no MVP, Redis só quando o volume pedir | Menos serviços para manter |
| 2026-11-03 | A IA extrai e o código calcula o prazo; o advogado confirma | LLM erra contas de data; prazo errado é risco grave |
| 2026-11-03 | Todo dado pertence a um escritório, inclusive no solo | Multiusuário futuro sem migração |
| 2026-11-03 | .docx gerado a partir do modelo do advogado (docxtemplater) | A peça sai com timbrado e formatação dele |
| 2026-11-03 | Planos: Start R$ 79 (15 peças), Pro R$ 129 (50 peças), Plus + R$ 49 | Abaixo da ADVBOX, com margem sobre o custo de IA |
| 2026-11-03 | Pagamentos pelo Asaas | Pix, boleto, cartão recorrente e nota fiscal |
| 2026-11-03 | MVP com intimação por upload; busca automática na fase intermediária | Integração com tribunais é a parte mais difícil |
| 2026-11-04 | Go-to-market em fases: venda pessoal, indicação, conteúdo e calculadora grátis, afiliados, canais escaláveis | Ver `12-go-to-market.md` |
| 2026-11-04 | Plano Cliente Fundador: 3 meses grátis e R$ 59/mês vitalício para os 10 primeiros. **Substituída em 2026-11-05:** 6 vagas, 15 dias grátis e R$ 79/mês | Feedback, depoimentos e casos de uso |
| 2026-11-04 | Retenção pelo valor (intimações automáticas, prazos, estilo, histórico), com exportação de dados livre | LGPD e confiança |
| 2026-11-04 | MVP em 35 dias de 2 h (70 h), começando pelas telas | Ver `14-cronograma-35-dias.md` |
| 2026-11-04 | No MVP, API nas rotas do Next.js + worker separado; NestJS adiado | Caber em 70 h (substitui a pendência "NestJS ou API routes") |
| 2026-11-04 | Cobrança pelo Asaas, calculadora pública, Plus e WhatsApp ficam para depois do dia 35 | Fundadores têm período grátis (ver decisão de 2026-11-05); foco no fluxo principal |
| 2026-11-04 | Nome do produto: Tesia (tese + IA). Repositório `tesia`, pacotes `@tesia/*`, Supabase `tesia-dev` e `tesia-prod` | Nome inventado, sem legaltech encontrada com o mesmo nome; substitui o provisório "Rito" |
| 2026-11-05 | Landing de lançamento focada em clientes fundadores, com CTA "Quero ser cliente fundador" em vez de teste grátis | Beta fechado no dia 35; ver `15-landing.md` |
| 2026-11-05 | Plano Cliente Fundador: 6 vagas, 15 dias grátis (até 15 peças, sem cartão) e depois R$ 79/mês com 50 peças, enquanto a assinatura estiver ativa | 3 meses grátis era demais; sem prejuízo por cliente no pior caso (ver `10-custos.md`) |
| 2026-11-05 | Assistente de IA chamada Lia como rosto da Tesia, usando as funções já previstas, sem chat no MVP | Dar proximidade ao advogado sem aumentar as 70 h; sempre apresentada como IA |
| 2026-11-05 | Plano futuro para equipes anunciado como "Empresas", sem preço público | Validar antes de fixar valor; referência interna em `05-regras-de-negocio.md` |
| 2026-11-05 | Tema claro menos branco e modo escuro como opção (Claro, Escuro, Sistema), com Sistema como padrão; a folha da peça segue branca | Conforto visual; a folha branca reflete como o .docx sai |
| 2026-11-05 | As 6 vagas de fundador ficam limitadas a advogados do DF; os demais entram em lista de espera | O calendário local só cobre o DF, e prazo sem feriado local é risco grave |

## Pendências

| Pendência | Responsável | Prazo |
|---|---|---|
| Mostrar o protótipo a 5 advogados | Lucas | |
| Teste manual de peças com o prompt de estilo | Lucas | |
| Recrutar 1 advogado revisor por área | Lucas | |
| Confirmar o nome Tesia: domínio no registro.br, marca no INPI (classes 9, 42 e 45) e @ no Instagram | Lucas | Antes do dia 32 |
| Escolher o provedor de embeddings (Voyage ou OpenAI) | Lucas | |
| Confirmar os termos do provedor de IA sobre retenção e treino | Lucas | Antes do lançamento |
| Pesquisar a consulta de comunicações do DJEN e APIs pagas de intimações | Lucas | Antes da fase 2 |
| Levantar calendários de feriados e suspensões dos tribunais do DF | Lucas | Antes do dia 15 |
| Revisão dos textos legais por advogado | Lucas | Antes do lançamento |
| Validar com advogados as regras especiais de prazo (prazo em dobro, intimação pelo sistema) | Lucas | Antes do dia 15 |
| Falar com contador sobre a saída do MEI | Lucas | Ao chegar a ~30 clientes |
| Gravar os leads do formulário de fundador e avisar por e-mail | Lucas | Dia 12 |
| Confirmar os itens `[CONFIRMAR]` da landing (vagas, tempos, IA sem treino, OAB, comparação, feriado) | Lucas | Antes de divulgar a landing |
| Definir WhatsApp, e-mail de contato, CNPJ e razão social | Lucas | Antes de divulgar a landing |
| Consultar o nome Lia no INPI junto com Tesia | Lucas | Antes do dia 32 |
| Deixar a cobrança pelo Asaas pronta antes do fim dos 15 dias grátis do primeiro fundador | Lucas | Até 15 dias após o dia 34 |
