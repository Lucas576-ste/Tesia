# 02 — Stack

Linguagem principal: **TypeScript de ponta a ponta**. A escala e a estabilidade vêm da arquitetura (filas, workers, banco gerenciado), não da linguagem. TypeScript é a linguagem que o time já domina, o que reduz bugs e tempo de entrega.

## Tecnologias

| Camada | Tecnologia | Motivo |
|---|---|---|
| Monorepo | Turborepo + pnpm | Compartilhar tipos e pacotes entre web e worker |
| Frontend | Next.js + React + Tailwind | Já dominado pelo time |
| Backend/API | Rotas do Next.js | Um serviço a menos para caber nas 70 h do MVP. NestJS fica para quando escalar |
| Worker | Node.js (TypeScript) | Processa OCR, IA e geração de documentos fora da requisição |
| Banco | PostgreSQL no Supabase (região São Paulo) | Confiável, RLS para isolar dados, dados no Brasil |
| Vetores (RAG) | pgvector | Busca das peças parecidas do advogado sem outro banco |
| Fila | Tabela `fila` no Postgres, alimentada por gatilho e consumida pelo worker com `FOR UPDATE SKIP LOCKED` | Um serviço a menos no MVP e job criado na mesma transação da intimação. Redis + BullMQ quando o volume pedir |
| Arquivos | Supabase Storage (criptografado) | PDFs e peças dos clientes |
| Autenticação | Supabase Auth | Já usado no projeto de conteúdo |
| Validação | zod | Tipos e validação compartilhados entre front, API e worker |
| IA (texto) | API do Claude: Haiku para extração e resumo, Sonnet para gerar peças | Qualidade de escrita e leitura de PDF, inclusive escaneado |
| Embeddings | Voyage AI ou OpenAI embeddings | A API do Claude não gera embeddings |
| Extração de texto | Leitura direta do PDF; OCR só se vier vazio (Claude lendo o PDF ou AWS Textract) | Muitos PDFs de tribunal já têm texto |
| Documentos | docxtemplater | Preenche o .docx modelo do próprio advogado (timbrado, fonte, margens) |
| Pagamentos | Asaas | Pix, boleto, cartão recorrente e nota fiscal no Brasil |
| E-mail | Resend | Alertas de prazo e e-mails do sistema |
| WhatsApp | API oficial do WhatsApp (fase intermediária) | Alertas de prazo. Exige verificação no Meta e templates aprovados |
| Monitoramento | Sentry + logs estruturados | Saber do erro antes do cliente |
| Hospedagem (MVP) | Vercel Pro (web) + Railway ou Render (worker) + Supabase | Simples e barato. O plano gratuito da Vercel não permite uso comercial |
| Hospedagem (escala) | AWS ou GCP com containers Docker | Quando o volume exigir |

## Quando usar Python

Só se aparecer uma necessidade que o ecossistema Node não resolva bem (ex.: processamento pesado de documentos). Nesse caso, entra como um worker separado, sem mudar o resto da stack.

## O que fica de fora no MVP

- Microsserviços
- Redis
- Kubernetes
- Banco vetorial separado
- Treinamento de modelo próprio
