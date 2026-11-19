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
2. O navegador envia o PDF direto ao bucket privado `intimacoes`, na pasta do escritório. A API grava a intimação com status `recebida`, e um gatilho no banco cria o job na tabela `fila`, na mesma transação.
3. O worker pega o job:
   1. Extrai o texto do PDF com `unpdf`. Se vier com menos de 100 caracteres por página (escaneado), o Claude Haiku transcreve o PDF. O texto vai para `intimacoes.texto` e o consumo para `uso_ia`.
   2. Chama a IA de extração (Haiku) e recebe um JSON com partes, ato, datas e resultado.
   3. Busca as peças possíveis em `regras_prazo` (área, rito e tipo de ato) e a IA escolhe uma delas.
   4. O motor de prazos calcula o vencimento da peça escolhida com os feriados do tribunal (sigla tirada do número CNJ), da UF e do escritório, mais as suspensões.
   5. Gera o resumo e os pontos atacáveis.
   6. Numa transação: cria ou atualiza o processo pelo número CNJ, grava o prazo `sugerido` e a análise em `intimacoes.extracao`, e o status vira `analisada`.
4. A tela da intimação consulta a cada 3 segundos enquanto ela está na fila ou em leitura, e mostra a análise quando termina.
5. O advogado confirma o prazo e pede o rascunho. Um novo job de geração entra na fila.
6. O worker gera a peça (Sonnet + perfil de estilo + RAG + documentos do processo), roda a revisão de citações e grava a peça com status `rascunho`.
7. No download, o site monta o .docx na hora (`/app/pecas/[id]/docx`): abre o modelo do advogado (ou o padrão da Tesia), mantém cabeçalho, rodapé e margens e troca o corpo pelo texto salvo da peça. Pendências `[CONFIRMAR]` saem destacadas em amarelo.

## Por que fila e worker

- Chamadas de IA e OCR levam de segundos a minutos. Elas não podem rodar dentro da requisição HTTP.
- Se muitos usuários enviarem ao mesmo tempo, os jobs esperam na fila e nada cai.
- Para ganhar velocidade, basta subir mais workers.
- Jobs que falham são tentados de novo automaticamente, com espera crescente e até 3 tentativas. Erros definitivos (arquivo que não é PDF) falham na hora e marcam a intimação como `erro`.
- Jobs presos em `executando` há mais de 10 minutos voltam para a fila.

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
| MVP | Vercel (Pro antes do 1º cliente) | Railway, imagem Docker em `apps/worker/Dockerfile` e `railway.json` | Supabase (São Paulo); backup diário por GitHub Action |
| Escala | Vercel ou container | AWS/GCP com containers e autoescala de workers | Supabase ou Postgres gerenciado |

## Observabilidade

- Sentry em web e worker.
- Logs estruturados com `escritorio_id`, `job_id` e tempo de cada etapa.
- Registro de tokens gastos por chamada de IA (tabela `uso_ia`).
- Alerta se a fila acumular ou se a taxa de erro de jobs subir.

## Evolução

- **Intermediário:** serviço de busca automática de intimações (DJEN ou API paga) como job agendado; alertas por WhatsApp.
- **Avançado:** separar módulos (financeiro, CRM) só se o volume pedir. Redis para filas de alto volume.
