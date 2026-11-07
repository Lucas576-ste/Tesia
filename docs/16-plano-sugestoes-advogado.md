# 16 — Plano: sugestões de um advogado

**Status:** aprovado em 2026-11-07. Parte 1 nas telas, com dados de exemplo; banco, motor e alerta real seguem o cronograma. Partes 2 e 3 ainda não começaram.

**Origem:** conversa de Lucas com um advogado, registrada em 2026-11-07. É a opinião de uma pessoa só, então o que muda o roadmap deve ser testado com mais advogados.

## Resumo

| Pedido | Situação hoje | Proposta | Fase |
|---|---|---|---|
| Início, prazo interno e prazo fatal | `data_inicio` e `data_vencimento` já estão no modelo; falta o prazo interno | Criar o prazo interno e chamar o vencimento de "prazo fatal" nas telas | MVP |
| Publicações pela OAB (DJEN e Diário Oficial) | Previsto (`08-roadmap.md`) | Manter e antecipar a pesquisa de fontes | 1.5 |
| Intimação cria tarefa sugerida no Quadro | O Quadro só mostra prazos confirmados | Usar o prazo `sugerido`, que já existe, como card sugerido | 1.5 |
| Arrastar o card atualiza o processo | Só "Protocolado" conclui o prazo | Processos passa a mostrar o status do prazo, sem guardar uma cópia | 1.5 |
| Atribuir à equipe | Responsável por prazo e peça no Sociedade | Manter | 1.5 |
| Cadastro de clientes | Tela e tabela previstas | Manter | 2 |
| Processo com tribunal e sistema | `tribunal` já existe; falta `sistema` | Criar `sistema` em `processos` | 2 |
| Sistema informa a fase do processo | Não previsto | Primeiro, estimar pela última intimação; consulta ao tribunal só depois de pesquisar a fonte | 2 |
| Calendário de prazos | `/app/agenda` prevista; prazos por área já vêm de `regras_prazo` | Mostrar as datas fatal e interna, com filtro por área | 2 |
| Genérico para todo tipo de advogado | Plataforma generalista, com 4 áreas no lançamento | Manter: cada área nova exige regras de prazo revisadas | Sem mudança |

## Parte 1 — Prazo interno (MVP)

### Conceito

- **Início da contagem:** quando o prazo começa a correr.
- **Prazo interno:** quando o trabalho precisa estar pronto. É uma data de organização, sem efeito legal.
- **Prazo fatal:** último dia para cumprir. É o atual vencimento, calculado pelo motor.

### Regras

- Vale só para `tipo = prazo`. Audiências e compromissos ficam sem prazo interno.
- O padrão é 2 dias úteis antes do fatal, usando o mesmo calendário do motor. O advogado pode editar a data em cada prazo.
- Se esse cálculo cair antes de hoje, o prazo interno passa a ser hoje.
- O prazo interno nunca pode ser depois do fatal. Se o fatal for antecipado e ficar antes do interno, o interno é recalculado.
- A IA não define datas: o interno sai do fatal por código, e o prazo continua dependendo da confirmação do advogado.
- O motor segue responsável só pelo fatal. O registro de data sugerida e data final (M3) continua valendo só para o fatal.
- Passar do prazo interno mostra o aviso "Interno vencido", sem mudar o status do prazo nem marcá-lo como `perdido`.
- Disponível em todos os planos, sem configuração própria no MVP.

### Alertas

- Os alertas do fatal continuam iguais: 5 dias úteis antes, 2 dias úteis antes e no dia.
- Entra a opção "No dia do prazo interno", que o advogado pode desligar como as outras.

### Telas

- **Análise da intimação:** mostra as três datas e permite editar o interno antes de confirmar.
- **Painel em lista:** a coluna "Vencimento" vira "Prazo fatal", e entra a coluna "Prazo interno". A ordem continua pelo fatal.
- **Quadro:** as colunas continuam guiadas pelo fatal, e o card mostra as duas datas.
- **Faixa de prazo crítico:** continua guiada pelo fatal.
- **Novo prazo manual (M4):** com o tipo "Prazo", ganha prazo interno e início da contagem (opcional).
- **Detalhe do processo:** mostra as três datas de cada prazo.
- **Ações do prazo:** "Editar prazo interno", no painel.
- **Agenda iCal, quando entrar:** fatal e interno como eventos separados, com o tipo no título.

A prioridade visual é do fatal, para ninguém tomar a data interna pela data legal.

### Modelo de dados

Em `prazos`, no Dia 12:

| Campo | Tipo | Observação |
|---|---|---|
| data_prazo_interno | date | opcional; vazio em audiências e compromissos |

Alterações do prazo interno entram em `auditoria` como `prazo.interno_alterado`.

### Arquivos

Com dados de exemplo, antes de mostrar as telas a advogados:

- `apps/web/src/lib/prazo.ts`
- `apps/web/src/lib/prazo-manual.ts`
- `apps/web/src/lib/conta-exemplo.ts`
- `apps/web/src/lib/analises-exemplo.ts`
- `apps/web/src/lib/processos-exemplo.ts`
- `apps/web/src/components/layout/dados-exemplo.ts`
- `apps/web/src/components/tabela-prazos.tsx`
- `apps/web/src/components/painel/quadro-prazos.tsx`
- `apps/web/src/components/painel/modal-prazo-manual.tsx`
- `apps/web/src/components/intimacao/bloco-prazo.tsx`
- `apps/web/src/components/processo/tela-processo.tsx`
- `apps/web/src/components/processo/lista-processos.tsx`
- `apps/web/src/components/painel/menu-acoes-prazo.tsx`
- `apps/web/src/components/painel/painel-prazos.tsx`
- `apps/web/src/components/painel/modal-prazo-interno.tsx`
- `apps/web/src/components/peca/tela-editor.tsx`
- `apps/web/src/components/configuracoes/aba-alertas.tsx`
- `apps/web/src/lib/prazo-interno.ts`

Com o backend:

- Migration da coluna no Dia 12
- Cálculo do prazo interno em `packages/prazos`, como função pura e com testes
- Cálculo no Dia 16 e job de alertas no Dia 30

### Verificação

- `pnpm build`, `pnpm typecheck`, `pnpm lint` e `pnpm exec prettier --check .`
- Testes do cálculo: virada de mês, feriado, fatal hoje, fatal amanhã e interno que cairia antes de hoje
- Teste no navegador, em lista e Quadro, de 320 a 1280 px, nos dois temas
- Revisão da regra pelo advogado revisor

## Parte 2 — Intimações automáticas e cards sugeridos (fase 1.5)

### Fluxo

1. A publicação chega pela OAB e entra na caixa de intimações.
2. A extração roda e cria um prazo `sugerido`, com a memória de cálculo.
3. O card aparece na nova coluna "Sugeridos" do Quadro, visível só quando tiver itens.
4. Ao arrastar ou abrir o card, a análise abre para o advogado conferir e confirmar. Arrastar sozinho nunca confirma.
5. Confirmado, o card segue as colunas atuais, e Processos mostra o mesmo status.

### Regras

- Não entra uma tabela de tarefas nem um kanban genérico: o card continua sendo um prazo. Isso preserva a decisão de 2026-11-05.
- Processos lê o status direto do prazo, sem guardar uma cópia que possa divergir.
- No Sociedade, o card tem responsável e obedece ao filtro "Meus prazos". Distribuição com aprovação continua na fase 3.
- **Risco a tratar:** prazo sugerido não gera alerta. Uma intimação nova sem conferência precisa de aviso próprio no painel e por e-mail, sem apresentar a data como confirmada.

### Antes de implementar

Pesquisar e comparar DJEN e APIs pagas:

- O que cada fonte cobre, inclusive Diários Oficiais fora do DJEN
- Custo por advogado monitorado
- Atraso e confiabilidade
- Termos de uso e tratamento de dados (LGPD)

## Parte 3 — Clientes, fase do processo e agenda (fase 2)

### Clientes e processos

- Cadastro manual de clientes, usando a tabela e as telas já previstas.
- Em `processos`, novo campo `sistema`, além de `numero_cnj` e `tribunal`, que já existem.

### Fase do processo

**Etapa 1, sem integração nova:**

- O código converte o `tipo_ato` da última intimação em uma fase. Exemplo: sentença vira "Sentenciado".
- A tela informa de onde veio: "Estimada pela última intimação, em 04/11/2026".
- O advogado pode corrigir.

Novos campos em `processos`: `fase`, `fase_origem` (`intimacao`, `manual`) e `fase_atualizada_em`.

**Etapa 2, só depois de pesquisar a fonte:**

- Avaliar a consulta ao tribunal por DataJud ou API paga.
- Comparar cobertura, atraso, custo e termos de uso.
- Se a consulta entrar, `fase_origem` ganha um novo valor.

### Agenda

- A tela `/app/agenda` mostra prazos internos, prazos fatais e audiências.
- Filtro por área, para enxergar as diferenças de prazo entre elas.

## O que continua fora

- Kanban de tarefas genérico
- Equipe com perfis e permissões
- Distribuição com fluxo de aprovação (fase 3)
- Novas áreas sem regras de prazo revisadas

## Docs atualizados

- `04-modelo-de-dados.md`: `data_prazo_interno`, `sistema` e campos de fase
- `05-regras-de-negocio.md`: prazo interno, alertas e cards sugeridos
- `06-motor-de-prazos.md`: cálculo do prazo interno
- `08-roadmap.md`: itens das fases 1, 1.5 e 2
- `11-decisoes.md`: decisões novas e nova data da pesquisa de DJEN e APIs
- `13-telas.md`: painel, Quadro, M4, análise, processos e agenda
- `14-cronograma-35-dias.md`: Dia 12 e Dia 30
- `README.md`: incluir este arquivo no índice

## Ordem de execução

1. ~~Aprovar as decisões abaixo.~~
2. ~~Atualizar os docs.~~
3. ~~Colocar o prazo interno nas telas, com dados de exemplo.~~
4. Mostrar a advogados e fazer as perguntas abaixo.
5. Incluir a coluna no Dia 12, o cálculo no Dia 16 e o alerta no Dia 30.
6. Fazer a pesquisa de DJEN e APIs ainda durante o beta.
7. Partes 2 e 3 nas fases 1.5 e 2, ajustadas pelo que os advogados responderem.

## Decisões aprovadas por Lucas

- [x] Prazo interno no MVP
- [x] Padrão de 2 dias úteis antes do fatal (sugestão; ainda sem validação de advogados)
- [x] Prazo interno em todos os planos, inclusive o Start (recomendado, porque ajuda a evitar perda de prazo)
- [x] Cards sugeridos como prazos, sem kanban de tarefas
- [x] Fase do processo estimada pela intimação antes de qualquer consulta ao tribunal

## Perguntas para outros advogados

- Quantos dias antes do fatal costuma ser o prazo interno? Muda por área ou tipo de peça?
- Quem trabalha sozinho também usaria prazo interno?
- O que você faria ao ver a fase do processo: é para consultar, avisar o cliente ou decidir o próximo passo?
- Uma fase estimada pela última intimação já ajudaria?
- Em que sistemas e tribunais estão a maior parte dos seus processos?
- As publicações que você recebe aparecem todas no DJEN, ou ainda precisa olhar outro Diário?
- Você delega prazos a alguém? Precisa aprovar o que a pessoa faz?
