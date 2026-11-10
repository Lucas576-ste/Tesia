# Tesia

## Produto
- Agente de IA para advogados solo e duplas de advogados.
- Lê a intimação em PDF, resume o que aconteceu e aponta o que pode ser atacado.
- A IA extrai os dados, o código calcula o prazo e o advogado confirma.
- Sugere a peça cabível e gera um rascunho no estilo do advogado, com pontos `[CONFIRMAR]`.
- O advogado revisa, baixa em .docx com o próprio timbrado e protocola; o sistema nunca protocola.

## Stack
- TypeScript, monorepo com Turborepo + pnpm, pacotes `@tesia/*`
- Next.js + React + Tailwind, com a API nas rotas do Next.js
- Worker Node.js separado para OCR, IA, documentos e notificações
- PostgreSQL, Auth e Storage no Supabase (São Paulo), pgvector, fila com pg-boss
- API do Claude (Haiku para extração e resumo, Sonnet para peças), zod, docxtemplater, Resend, Sentry
- Sem NestJS no MVP (decisão de 2026-11-04 em `docs/11-decisoes.md`).

## Estrutura

```
apps/
  web/        telas e API (rotas do Next.js)
  worker/     jobs de IA, OCR, prazos, documentos e notificações
packages/
  db/         schema, migrations e seeds
  prazos/     motor de prazos puro, sem acesso a banco
  ia/         prompts, cliente do Claude e embeddings
  shared/     tipos e schemas zod compartilhados
  ui/         componentes visuais
docs/         documentação do produto
```

## Regras de código
- TypeScript estrito.
- Nunca adicionar comentários no código.
- Componentes pequenos.
- Nomes de domínio em português: `escritorio`, `intimacao`, `prazo`, `peca`.
- Validar dados com zod.

## Documentação
- Sempre consultar `docs/` antes de implementar.
- Quando uma decisão mudar, atualizar `docs/11-decisoes.md`.

## Comandos
Rodar na raiz:
- `pnpm install`: instala as dependências
- `pnpm dev`: sobe web e worker em modo de desenvolvimento
- `pnpm build`: gera o build de web e worker
- `pnpm lint`: roda o ESLint
- `pnpm typecheck`: checa os tipos de todos os pacotes
- `pnpm test`: roda os testes (hoje, os do motor de prazos)
- `pnpm format`: formata com o Prettier
- `pnpm --filter @tesia/web dev`: sobe só um app (troque pelo pacote desejado)
