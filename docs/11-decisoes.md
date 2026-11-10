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
| 2026-11-05 | Funções de gestão só em versão leve: painel Lista/Quadro, agenda iCal, plano Sociedade, relatório do mês, honorários simples | Atender o solo e a sociedade sem virar cópia de um sistema de gestão completo |
| 2026-11-05 | Fora do escopo: CRM com funil, financeiro completo, BI avançado, kanban de tarefas, equipe com perfis | Uso baixo pelo público e escopo grande |
| 2026-11-05 | Prazos manuais (prazo, audiência, compromisso) entram no MVP, pelo botão "+ Adicionar" | Sem eles, o painel não vira o controle oficial do advogado |
| 2026-11-05 | Plano Sociedade: 2 advogados, R$ 219, 100 peças compartilhadas; Escritório passa a R$ 99 por advogado (mín. 3) | Público real de sociedades pequenas; substitui o plano Empresas (R$ 299, valor interno) e o Escritório de R$ 299 |
| 2026-11-05 | Agenda sincronizada por link iCal em todos os planos. **Substituída em 2026-11-06:** do plano Pro em diante | Barata de construir; concorrente cobra a partir de R$ 450 |
| 2026-11-05 | Item "Indicar a Tesia" no menu e ajuda flutuante | Indicação dentro do produto; suporte sempre à mão |
| 2026-11-05 | Depois do MVP, a primeira prioridade de produto é a busca automática de intimações; a cobrança pelo Asaas vem antes, por causa dos 15 dias grátis | É a maior lacuna em relação à concorrência |
| 2026-11-05 | Landing em formato de funil (dor → custo → solução → confiança → oferta → objeções → ação), textos em `15-landing.md` | A versão anterior era só lista de funcionalidades |
| 2026-11-05 | No lançamento, o CTA principal é "Quero ser cliente fundador" (formulário), não cadastro automático | Os primeiros clientes vêm de venda pessoal |
| 2026-11-05 | Sem depoimentos inventados; seção Cliente Fundador até existirem depoimentos reais | Honestidade e confiança |
| 2026-11-04 | Nome do produto: Tesia (tese + IA). Repositório `tesia`, pacotes `@tesia/*`, Supabase `tesia-dev` e `tesia-prod` | Nome inventado, sem legaltech encontrada com o mesmo nome; substitui o provisório "Rito" |
| 2026-11-05 | Plano Cliente Fundador: 6 vagas, 15 dias grátis (até 15 peças, sem cartão) e depois R$ 79/mês com 50 peças, enquanto a assinatura estiver ativa | 3 meses grátis era demais; sem prejuízo por cliente no pior caso (ver `10-custos.md`) |
| 2026-11-05 | Assistente de IA chamada Lia como rosto da Tesia, usando as funções já previstas, sem chat no MVP | Dar proximidade ao advogado sem aumentar as 70 h; sempre apresentada como IA |
| 2026-11-05 | Plano futuro para equipes anunciado como "Empresas", sem preço público. **Substituída em 2026-11-05:** plano Sociedade | Validar antes de fixar valor |
| 2026-11-05 | Tema claro menos branco e modo escuro como opção (Claro, Escuro, Sistema), com Sistema como padrão; a folha da peça segue branca | Conforto visual; a folha branca reflete como o .docx sai |
| 2026-11-05 | As 6 vagas de fundador ficam limitadas a advogados do DF; os demais entram em lista de espera | O calendário local só cobre o DF, e prazo sem feriado local é risco grave |
| 2026-11-05 | Quadro do painel com a coluna "Depois", visível só quando tiver itens | Sem ela, um prazo não iniciado com mais de 3 dias úteis sumiria do Quadro |
| 2026-11-06 | Start só com o essencial. Quadro, prazos manuais e audiências, ajustes pela IA e agenda ficam do Pro em diante; Sociedade soma o necessário para 2 advogados | O Start parecia o plano mais completo e induzia a escolha errada |
| 2026-11-05 | Cada vaga de fundador vale para 1 advogado | O plano é de 1 usuário e 50 peças, e o Sociedade só existe depois do MVP |
| 2026-11-07 | Prazo interno no MVP, em todos os planos, com início da contagem e prazo fatal nas telas | Pedido de um advogado; ajuda a evitar perda de prazo e o banco ainda não existe |
| 2026-11-07 | Prazo interno padrão: 2 dias úteis antes do fatal, editável em cada prazo | Valor inicial, ainda sem validação de advogados |
| 2026-11-07 | Cards sugeridos no Quadro são prazos `sugerido`, sem tabela de tarefas | Atende ao pedido e mantém fora o kanban de tarefas |
| 2026-11-07 | Fase do processo começa estimada pela última intimação; consulta ao tribunal só depois de pesquisar a fonte | Entrega valor sem integração nova; a consulta muda custo e prazo |
| 2026-11-07 | Start com 10 peças e pacote extra de R$ 29; substitui as 15 peças e o pacote de R$ 19 nesse plano | Start com pacotes não pode sair mais barato que o Pro |
| 2026-11-07 | Pontos atacáveis e peças alternativas só do Pro em diante | É o valor jurídico mais visível da análise |
| 2026-11-07 | Funções do Pro aparecem no Start com selo, e o teste grátis tem recursos do Pro | O cliente precisa ver o que ganha ao assinar |
| 2026-11-07 | Sem limite de estilo por plano | Poderia piorar a primeira impressão do rascunho |
| 2026-11-07 | Máximo de 2 advogados por enquanto; plano Escritório suspenso | Foco no solo e em duplas |
| 2026-11-07 | Sociedade com etapas por prazo, divisão por área e rede de segurança, sem kanban de tarefas | Uma dupla precisa combinar quem faz o quê sem deixar nada cair entre os dois |
| 2026-11-07 | Dias 10 e 11 trocados: primeiro mostrar as telas a advogados, depois testar os prompts | As telas estão prontas e os ajustes de UI vêm antes do banco |
| 2026-11-10 | Motor de prazos (Dias 15 e 16) adiantado, com testes em vitest | Não depende de contas externas e é a parte de maior risco jurídico |
| 2026-11-10 | Carnaval e Corpus Christi tratados como dias sem expediente forense, marcados como `forense` | Não são feriados nacionais por lei, mas os tribunais costumam suspender; vai para revisão do advogado |
| 2026-11-10 | Recesso de 20/12 a 20/01 também adia publicação e início da contagem | Interpretação usual do CPC, art. 220; vai para revisão do advogado |

## Pendências

| Pendência | Responsável | Prazo |
|---|---|---|
| Mostrar o protótipo a 5 advogados | Lucas | |
| Teste manual de peças com o prompt de estilo | Lucas | |
| Recrutar 1 advogado revisor por área | Lucas | |
| Confirmar o nome Tesia: domínio no registro.br, marca no INPI (classes 9, 42 e 45) e @ no Instagram | Lucas | Antes do dia 32 |
| Escolher o provedor de embeddings (Voyage ou OpenAI) | Lucas | |
| Confirmar os termos do provedor de IA sobre retenção e treino | Lucas | Antes do lançamento |
| Pesquisar DJEN, Diários Oficiais e APIs pagas de intimações (cobertura, custo, atraso, termos e LGPD) | Lucas | Durante o beta |
| Validar com advogados o padrão do prazo interno e as perguntas de `16-plano-sugestoes-advogado.md` | Lucas | Ao mostrar as telas |
| Levantar calendários de feriados e suspensões dos tribunais do DF | Lucas | Antes do dia 15 |
| Revisão dos textos legais por advogado | Lucas | Antes do lançamento |
| Validar com advogados as regras especiais de prazo (prazo em dobro, intimação pelo sistema) | Lucas | Antes do dia 15 |
| Validar com 2 ou 3 duplas o preço de R$ 219, as etapas e o alerta ao sócio | Lucas | Antes do plano Sociedade |
| Validar com advogados os limites do Start (10 peças) | Lucas | Antes de abrir o Start |
| Revisão jurídica da separação da dupla (sigilo e dados de clientes) | Lucas | Antes do plano Sociedade |
| Falar com contador sobre a saída do MEI | Lucas | Ao chegar a ~30 clientes |
| Gravar os leads do formulário de fundador e avisar por e-mail | Lucas | Dia 12 |
| Confirmar os itens `[CONFIRMAR]` da landing (vagas, tempos, IA sem treino, OAB, comparação, feriado) | Lucas | Antes de divulgar a landing |
| Definir WhatsApp, e-mail de contato, CNPJ e razão social | Lucas | Antes de divulgar a landing |
| Consultar o nome Lia no INPI junto com Tesia | Lucas | Antes do dia 32 |
| Deixar a cobrança pelo Asaas pronta antes do fim dos 15 dias grátis do primeiro fundador | Lucas | Até 15 dias após o dia 34 |
