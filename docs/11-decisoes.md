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
| 2026-11-10 | Banco (Dia 12) e dados de referência (Dia 14) testados num Postgres local com pgvector e aplicados no Supabase | O teste local de RLS roda sem tocar no banco real |
| 2026-11-10 | Embedding com 1024 dimensões | Funciona com Voyage e OpenAI; o provedor ainda não foi escolhido |
| 2026-11-10 | Regras de prazo entram inativas e só são ativadas com revisão registrada | Nenhuma regra é usada sem conferência de um advogado |
| 2026-11-10 | Assinatura, uso e auditoria são só leitura para o usuário; a escrita é feita pelo servidor | O cliente não pode alterar o próprio plano nem o próprio consumo |
| 2026-11-10 | Login obrigatório em `/app` e `/onboarding`, inclusive na Vercel; a demonstração aberta acaba | Decisão de Lucas; o produto passa a ter contas reais |
| 2026-11-10 | Escritório, usuário dono e teste de 7 dias no Pro criados por gatilho no cadastro | Fica tudo na mesma transação e o app não precisa da chave secreta |
| 2026-11-10 | Cadastro mostra "7 dias grátis com os recursos do Pro", no lugar de "Programa fundador: 15 dias" | Segue `05-regras-de-negocio.md`; os 15 dias do fundador são combinados na venda pessoal |
| 2026-11-10 | Fila própria no Postgres (tabela `fila`, gatilho e `SKIP LOCKED`) no lugar do pg-boss | O job nasce na mesma transação da intimação e o app na Vercel não precisa de conexão direta ao banco |
| 2026-11-10 | PDF enviado direto do navegador ao Storage, na pasta do escritório | Evita o limite de tamanho das funções da Vercel; o RLS do Storage impede pasta alheia |
| 2026-11-11 | OCR de PDF escaneado pelo Claude Haiku, no lugar do AWS Textract | Uma conta a menos; o Haiku já lê PDF e custa menos de um centavo por intimação |
| 2026-11-12 | Trechos citados pela IA são conferidos no texto do documento pelo código, e os que não existem são descartados | A IA não pode apontar como base da decisão algo que o documento não diz |
| 2026-11-17 | .docx montado no site com pizzip, trocando o corpo do modelo do advogado, sem docxtemplater e sem fila | O timbrado não tem marcações para preencher; montar na hora leva menos de 1 segundo e dispensa o worker |
| 2026-11-13 | Embeddings com Voyage `voyage-law-2` | Modelo treinado em textos jurídicos, 1024 dimensões, recomendado pela Anthropic; centavos por mês |
| 2026-11-13 | Peças de estilo só em PDF ou DOCX | O .doc antigo não tem extração de texto confiável |
| 2026-11-12 | Visão de crescer de solo e dupla até o nível corporativo; MVP segue focado em solo e dupla | Ideias de todos os níveis guardadas no banco de ideias de `08-roadmap.md`, sem descartar nenhuma |
| 2026-11-12 | Intimação pelo portal calculada pela ciência (abertura ou 10º dia corrido após o envio); citação sem cálculo automático no MVP | Regra confirmada com advogado; a citação tem início variável conforme a forma |
| 2026-11-12 | Regras de prazo ainda não revisadas são usadas no cálculo, com aviso na análise | Sem isso nenhum prazo seria calculado até a revisão; o advogado confirma toda data antes de ir ao painel |
| 2026-11-12 | Painel e análise mostram só dados reais; os exemplos saíram | Conta nova vê o painel vazio com convite para enviar a primeira intimação |
| 2026-11-11 | Worker roda com `tsx` também em produção, sem etapa de compilação, e checa tipos com resolução `Bundler` | Importa os pacotes `@tesia/*` direto do TypeScript, como o web; imports sem extensão funcionam no Next e no `tsx` |
| 2026-11-18 | Alertas por e-mail via Resend com remetente `onboarding@resend.dev` até verificar um domínio | Sem domínio verificado, o Resend só entrega para o dono da conta; verificar o domínio antes do lançamento |
| 2026-11-18 | Plano e uso lidos da assinatura real; saiu o seletor de plano de demonstração | Dia 30 |
| 2026-11-18 | Backup diário por GitHub Action (`pg_dump` criptografado, 30 dias) em vez do Supabase Pro | Custo zero no início; reavaliar o Pro no lançamento |
| 2026-11-18 | Rate limit no próprio Postgres, sem Redis | Simples e suficiente para o volume do MVP |
| 2026-11-19 | Worker no Railway com Dockerfile próprio; Vercel Pro só antes do 1º cliente; sem domínio por enquanto (`.vercel.app`) | Decisão de Lucas no Dia 32 |
| 2026-11-19 | Landing com capturas reais de uma conta de demonstração fictícia, em `apps/web/public/telas` | Substitui as mini telas feitas em código |
| 2026-11-19 | Fundador ativado por script (`ativar-fundador.sql`): plano `fundador`, status `ativa`, 15 dias, 50 peças | O teste grátis padrão só dá 5 peças; a cobrança ainda não existe |
| 2026-11-19 | Novo visual: paleta Dourado + Plus Jakarta Sans no app e na landing, com animações leves que respeitam "reduzir movimento" | Briefing da landing com análise competitiva; Lucas pediu um dourado forte e mais vida na página |
| 2026-11-19 | Landing com objetivo único: teste grátis (`/cadastro`); fundador vira oferta secundária | Princípio do briefing: um só objetivo de conversão |
| 2026-11-19 | Monitoramento de intimações começa pela API pública do DJEN (`comunicaapi.pje.jus.br`), grátis, por OAB; provedor pago com webhook só se faltar cobertura | A API não tem documentação oficial e limita a 20 chamadas por janela; o cliente fica isolado e avisa o Sentry se o formato mudar |
| 2026-11-19 | Acompanhamento por cliente: menu "Clientes", cada cliente com os seus processos e a fase de cada um; fase e cliente vêm das intimações (e do DJEN), e a correção manual tem prioridade | Pedido de Lucas: acompanhar o processo de cada cliente até o fim, de forma intuitiva |
| 2026-11-19 | Menu com 5 itens (Painel, Intimações, Clientes, Peças, Meu estilo) + Configurações; Processos dentro de Clientes; Indicar no rodapé | Tirar repetições (Nova intimação e + Adicionar; Processos e Clientes) e seguir o caminho intimação → prazo → peça → cliente |
| 2026-11-19 | MVP com 8 áreas (inclui criminal, tributário, empresarial e bancário, administrativo e servidor público) e agravo de instrumento em todas; regras novas "em validação" | Decisão de Lucas; o advogado sempre confirma o prazo |
| 2026-11-19 | Status "Vencido" e uma única regra de urgência para cards, quadro, lista e alertas do painel; o quadro passa a ser por urgência e "Rascunho pronto" vira selo | Os números precisam bater, e prazo passado aparecia como "vence hoje" |
| 2026-11-19 | Teste grátis de 11 dias sem cartão; planos Individual (7 peças/dia, R$ 129) e Sócio (2 advogados, 15/dia, R$ 219), com pushes destacados; limite passa a ser diário | Decisão de Lucas sobre preços; landing reforça "tudo num só lugar" e o teste grátis |
| 2026-11-19 | Cadastro de cliente em 2 etapas: rápido (PF/PJ, nome, CPF/CNPJ validado, WhatsApp, e-mail) e qualificação completa depois, na página do cliente | Pedido de advogado: vincular o processo sem travar; a qualificação (art. 319 do CPC) entra quando for gerar peça ou procuração |
| 2026-11-19 | Qualificação em `clientes.qualificacao` (jsonb validado com zod), mais `tipo_pessoa`, `pix` e `observacoes` | Campos variam entre PF e PJ; evita dezenas de colunas. A Lia usa o texto montado por `textoQualificacao` no rascunho, e o que falta vira [CONFIRMAR] |
| 2026-11-19 | Não guardar senha do Gov.br/INSS do cliente | É a senha da vida digital do cliente: risco alto pela LGPD e de responsabilidade se vazar, e o compartilhamento contraria os termos do Gov.br. Revisitar só com integração oficial |
| 2026-11-20 | A qualificação do cliente só vai para a geração quando o tipo de peça tem seção `qualificacao`; nas peças de resposta e recursos a parte é apresentada como "já qualificado(a) nos autos" | Teste de estilo: a qualificação vazia gerava 7 [CONFIRMAR] na abertura e contrariava o estilo do advogado |
| 2026-11-20 | A geração recebe nome e OAB do advogado responsável e não recebe o prazo; `marcarMencaoDePrazo` marca com [CONFIRMAR] qualquer parágrafo que discuta prazo, tempestividade ou revelia (desligado se as peças do advogado já falam disso); a revisão passou a apontar afirmações sobre documentos que a Lia não leu (ex.: o que a inicial "não informa") | O prazo é do sistema, não do texto; a Lia só vê a intimação, não a inicial. Prompts: `geracao@5` e `revisao@3` (a marcação de "conferir na inicial" vale só para o que a peça afirma que a inicial não traz); `marcarMencaoDePrazo` também pega "prazo para contestar", "início do prazo" e "juntada do comprovante" |
| 2026-11-20 | "Novo prazo" calcula a sugestão pela data da publicação (Diário ou Portal) e por um atalho de prazo vindo de `regras_prazo`, ou por "Outro prazo"; a data fatal vem preenchida e continua editável, e o servidor recalcula e grava a sugerida (`data_vencimento_sugerida`), os dias, a contagem, o início, a memória e a regra | Pedido de advogado: economizar a conta sem engessar a data. O botão "Novo prazo" também existe na página do processo |
| 2026-11-19 | "Enviar atualização" ao cliente monta a mensagem sem IA, a partir do resumo da última intimação; "Copiar mensagem" grava `clientes.ultimo_contato_em` | Sem custo e instantâneo; o advogado revisa e envia. Versão com IA fica para a Fase 1.5 |
| 2026-11-19 | Tema claro com fundo #F2F1EC, sombra de card em token (`--sombra-card`), texto dourado só em `--primaria` (#8A6510) e container único de 1280px no /app | Mais contraste e leitura; o tema escuro não mudou |
| 2026-11-20 | Status do timbrado persistido em `usuarios` (`modelo_status`: processando, ativo, erro; mais `modelo_nome`, `modelo_enviado_em`, `modelo_erro`); falha na troca de um timbrado ativo não altera o ativo | A tela mostra o estado real ao recarregar e o advogado sabe qual arquivo está em uso e o que corrigir |
| 2026-11-20 | Timbrado só em .docx no MVP; PDF é recusado com orientação para salvar como .docx | Extrair cabeçalho, rodapé e margens de PDF não é confiável, e a peça sai em .docx |
| 2026-11-20 | Prévia A4 em HTML montada por `inspecionarModelo` (cabeçalho, rodapé, margens e fonte lidos do .docx), sem LibreOffice | Roda na Vercel e dá fidelidade suficiente de texto, margens e imagens do cabeçalho |
| 2026-11-20 | Faixa de conta demo só quando `NEXT_PUBLIC_CONTA_DEMO=1`; o selo "Dados de exemplo" saiu do título de Configurações | O selo ficava em contas reais e confundia |
| 2026-11-20 | Meu estilo: nível pelo número de peças lidas (Básico 1 a 4, Bom 5 a 7, Ótimo 8 a 10), calculado por `nivelEstilo` em `@tesia/shared` | A informação "N peças lidas" vira só o medidor, com a próxima ação dita em frase |
| 2026-11-20 | Perfil de estilo `perfil@2`: `aprendizados` agrupados por parte da peça; correções "Está certo" e "Não sou assim" em `estilo_correcoes`, enviadas ao prompt na próxima análise (`aplicada_em`) | O advogado corrige o que a Lia aprendeu sem esperar nova peça; perfis antigos (sem `aprendizados`) mostram as frases soltas até a próxima atualização |
| 2026-11-20 | O tipo da peça de estilo é classificado pelo Haiku ao ler (`classificarTipoPeca`, `classificar@1`) e gravado em `estilo_documentos.tipo_peca_id`; falha não derruba a leitura | Mostra o selo do tipo e permite sugerir o tipo que falta; peças enviadas antes ficam sem selo |
| 2026-11-20 | O exemplo "Veja no seu estilo" é gerado numa server action com o Haiku (`exemplo@1`), com limite de 20 por hora e custo em `uso_ia` | Resposta em segundos, sem fila, para um parágrafo |
| 2026-11-20 | Configurações: Perfil e Alertas abrem em modo leitura com botão "Editar" e voltam para leitura ao salvar; o Perfil grava de verdade (nome, OAB/UF, áreas, tribunais, WhatsApp) | O formulário ficava sempre aberto e o Perfil usava dados de exemplo sem gravar |
| 2026-11-20 | Dados pessoais na aba Dados e o link da agenda ficam mascarados, com olho para revelar e ocultação automática em 30 segundos | Reduz exposição na tela; o link da agenda dá acesso aos prazos |
| 2026-11-20 | Exportação e exclusão de conta viram pedido (`pedidos_dados` + e-mail ao suporte), com confirmação digitando EXCLUIR; nada é apagado automaticamente | Exclusão e exportação automáticas ficam para depois; o prazo legal é de 15 dias (LGPD) |
| 2026-11-20 | Chat da Lia no app com ajuda de uso e explicação da tela, sem dúvidas jurídicas abertas; Haiku com streaming por `POST /api/lia`, histórico em `conversas_lia` e `mensagens_lia` (nomes em português), limite diário por plano e retenção de 90 dias | Substitui o "?" de ajuda; o escopo sem direito aberto evita resposta jurídica sem revisão |
| 2026-11-20 | O chat chama `@anthropic-ai/sdk` direto no web, com prompt e base de conhecimento em `apps/web/src/lib/lia/`, e o web ganhou vitest | O Turbopack não resolve os imports `.js` do `@tesia/ia`; o web não tinha testes |
| 2026-11-20 | Contexto da Lia: mínimo sempre (rota, plano, contagens, próximos prazos sem nomes) e detalhe só do item aberto | Reduz o que sai para o provedor de IA e mantém explicações com datas reais |

## Pendências

| Pendência | Responsável | Prazo |
|---|---|---|
| Mostrar o protótipo a 5 advogados | Lucas | |
| Teste manual de peças com o prompt de estilo | Lucas | |
| Recrutar 1 advogado revisor por área | Lucas | |
| Confirmar o nome Tesia: domínio no registro.br, marca no INPI (classes 9, 42 e 45) e @ no Instagram | Lucas | Antes do dia 32 |
| Cadastrar cartão na Voyage para liberar o limite de chamadas por minuto | Lucas | Antes do lançamento |
| Confirmar os termos do provedor de IA sobre retenção e treino | Lucas | Antes do lançamento |
| Pesquisar DJEN, Diários Oficiais e APIs pagas de intimações (cobertura, custo, atraso, termos e LGPD) | Lucas | Durante o beta |
| Validar com advogados o padrão do prazo interno e as perguntas de `16-plano-sugestoes-advogado.md` | Lucas | Ao mostrar as telas |
| Levantar calendários de feriados e suspensões dos tribunais do DF | Lucas | Antes do dia 15 |
| Revisão dos textos legais por advogado | Lucas | Antes do lançamento |
| Validar com advogados as regras especiais de prazo (prazo em dobro, intimação pelo sistema) | Lucas | Antes do dia 15 |
| Enviar `packages/db/seeds/03_regras_prazo.sql` e `04_feriados_df.sql` ao advogado revisor. Perguntas: incluir recurso inominado no cível/consumidor (JEC) e apelação em família? O prazo de manifestação sobre laudo no JEF é o do CPC? | Lucas | Antes de ativar as regras |
| Validar com 2 ou 3 duplas o preço de R$ 219, as etapas e o alerta ao sócio | Lucas | Antes do plano Sociedade |
| Validar com advogados os limites do Start (10 peças) | Lucas | Antes de abrir o Start |
| Revisão jurídica da separação da dupla (sigilo e dados de clientes) | Lucas | Antes do plano Sociedade |
| Falar com contador sobre a saída do MEI | Lucas | Ao chegar a ~30 clientes |
| Gravar os leads do formulário de fundador e avisar por e-mail | Lucas | Dia 12 |
| Confirmar os itens `[CONFIRMAR]` da landing (vagas, tempos, IA sem treino, OAB, comparação, feriado) | Lucas | Antes de divulgar a landing |
| Definir WhatsApp, e-mail de contato, CNPJ e razão social | Lucas | Antes de divulgar a landing |
| Consultar o nome Lia no INPI junto com Tesia | Lucas | Antes do dia 32 |
| Deixar a cobrança pelo Asaas pronta antes do fim dos 15 dias grátis do primeiro fundador | Lucas | Até 15 dias após o dia 34 |
| Verificar um domínio no Resend e trocar `ALERTA_REMETENTE` | Lucas | Antes do lançamento |
| Cadastrar `BACKUP_DATABASE_URL` e `BACKUP_SENHA` nos Secrets do GitHub e rodar o backup uma vez | Lucas | Depois do push |
| Passar a Vercel para o plano Pro | Lucas | Dia 34, antes do 1º cliente pagar |
| Revisão de advogado dos termos e da política de privacidade (rascunho de 18/11) | Lucas | Antes de divulgar |
| Conferir os termos da Anthropic e da Voyage sobre treino com dados e tirar o [CONFIRMAR] da privacidade | Lucas | Antes de divulgar |
| Assinar o Railway Hobby (US$ 5/mês) e subir o worker; até lá, o worker roda na máquina do Lucas | Lucas | Dia 34, antes do 1º cliente |
| Confirmar com o advogado parceiro se o TJDFT suspende prazos em 08/12 (Dia da Justiça); o banco só tem para TRF1 e TRT10 | Lucas | Antes do Dia 34 |
| Trocar os números e depoimentos de exemplo (`content/proof.ts`) pelos reais, com autorização dos advogados | Lucas | Depois dos primeiros fundadores |
| Validar com o advogado parceiro as fases de cada rito e os nomes usados no dia a dia (`packages/shared/src/fases.ts`) | Lucas | Antes de divulgar |
| Validar com advogados as regras de prazo das áreas novas (criminal, tributário, empresarial, administrativo) | Lucas | Antes de divulgar essas áreas |
| Confirmar os números de push por plano (100 e 300) quando escolher o provedor da integração | Lucas | Antes de divulgar |
| Decidir se entra um teto mensal de segurança além do limite diário | Lucas | Antes de cobrar |
