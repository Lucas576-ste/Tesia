# 03 — Arquitetura

## Visão geral

```
[Navegador]
    │
    ▼
[apps/web — Next.js, telas e API]  ──►  [Supabase Auth]
    │  └───────────────► [Postgres + pgvector]  ◄──┐
    │                    [Storage criptografado]   │
    │ cria job                                     │
    ▼                                              │
[Fila no Postgres]                                 │
    │                                              │
    ▼                                              │
[apps/worker]  ── extração de texto / OCR          │
               ── busca de estilo (pgvector)       │
               ── API do Claude                    │
               ── motor de prazos (código)         │
               ── grava resultado ─────────────────┘
    │
    ▼
[Notificações: e-mail (Resend) / WhatsApp]
```

## Fluxo de uma intimação

1. O advogado envia o PDF pela web.
2. A API salva o arquivo no storage, cria o registro da intimação com status `recebida` e coloca um job na fila.
3. O worker pega o job:
   1. Extrai o texto do PDF. Se vier vazio, usa OCR.
   2. Chama a IA de extração (Haiku) e recebe um JSON com partes, ato, datas e resultado.
   3. O motor de prazos calcula o vencimento a partir das regras e dos feriados.
   4. A IA escolhe a peça cabível entre as opções da tabela `tipos_peca`.
   5. Gera o resumo.
4. O resultado é gravado e o status vira `analisada`. A tela é avisada (Supabase Realtime ou polling).
5. O advogado confirma o prazo e pede o rascunho. Um novo job de geração entra na fila.
6. O worker gera a peça (Sonnet + perfil de estilo + RAG + documentos do processo), roda a revisão de citações e grava a peça com status `rascunho`.
7. No download, o worker preenche o .docx modelo do advogado.

## Por que fila e worker

- Chamadas de IA e OCR levam de segundos a minutos. Elas não podem rodar dentro da requisição HTTP.
- Se muitos usuários enviarem ao mesmo tempo, os jobs esperam na fila e nada cai.
- Para ganhar velocidade, basta subir mais workers.
- Jobs que falham são tentados de novo automaticamente (com limite de tentativas).

## Isolamento de dados (multi-tenant)

- Todo dado pertence a um `escritorio_id`. O advogado solo é um escritório com um usuário.
- RLS no Postgres garante que um escritório nunca vê dado de outro.
- **Atenção:** a chave `service_role` do Supabase ignora o RLS. A API deve repassar o token do usuário para o banco ou filtrar por `escritorio_id` em todas as queries, com testes automatizados que garantam isso.
- O worker usa a `service_role`, mas sempre opera sobre o `escritorio_id` gravado no job.

## Estrutura do monorepo

```
/
├── apps/
│   ├── web/          Next.js (telas e API)
│   └── worker/       jobs de IA, OCR, prazos, documentos, notificações
├── packages/
│   ├── db/           schema, migrations, seeds (feriados, tipos de peça)
│   ├── prazos/       motor de prazos puro, sem dependência de banco, com muitos testes
│   ├── ia/           prompts, cliente da API do Claude, embeddings
│   ├── shared/       tipos e schemas zod compartilhados
│   └── ui/           componentes visuais
├── docs/             esta documentação
├── turbo.json
└── pnpm-workspace.yaml
```

Do projeto atual de conteúdo (Next.js + Supabase), reaproveitar: autenticação, configuração do Supabase e o módulo de conteúdo para Instagram (vira o plano Plus).

## Hospedagem

| Fase | Web | Worker | Banco e storage |
|---|---|---|---|
| MVP | Vercel Pro | Railway ou Render | Supabase Pro (São Paulo) |
| Escala | Vercel ou container | AWS/GCP com containers e autoescala de workers | Supabase ou Postgres gerenciado |

## Observabilidade

- Sentry em web e worker.
- Logs estruturados com `escritorio_id`, `job_id` e tempo de cada etapa.
- Registro de tokens gastos por chamada de IA (tabela `uso_ia`).
- Alerta se a fila acumular ou se a taxa de erro de jobs subir.

## Evolução

- **Intermediário:** serviço de busca automática de intimações (DJEN ou API paga) como job agendado; alertas por WhatsApp.
- **Avançado:** separar módulos (financeiro, CRM) só se o volume pedir. Redis para filas de alto volume.
