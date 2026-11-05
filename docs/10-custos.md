# 10 — Custos

Valores aproximados de novembro de 2026, com dólar a cerca de R$ 5,50. Confirmar os preços antes de cada decisão.

## Custos fixos mensais (MVP)

| Item | Custo aproximado |
|---|---|
| Supabase Pro (banco, auth, storage, fila) | US$ 25 ≈ R$ 140 |
| Vercel Pro (web) | ≈ R$ 110 |
| Railway ou Render (worker) | R$ 30 a R$ 110 |
| Sentry e Resend | R$ 0 nos planos gratuitos no início |
| Domínio | ≈ R$ 5/mês |
| **Total** | **≈ R$ 300 a R$ 400** |

## Custo de IA

Preços da API do Claude (por milhão de tokens):

| Modelo | Entrada | Saída | Leitura de cache |
|---|---|---|---|
| Sonnet 5.5 | US$ 2 | US$ 10 | US$ 0,20 |
| Haiku 5.5 (prompts até 100 mil tokens) | US$ 0,10 | US$ 0,50 | US$ 0,01 |

Estimativa por peça:

| Etapa | Tokens | Custo |
|---|---|---|
| Extração, escolha e resumo (Haiku) | ~12 mil | quase zero |
| Estilo e instruções em cache (Sonnet) | ~15 mil | < US$ 0,01 |
| Documentos do processo (Sonnet) | ~10 mil | US$ 0,02 |
| Peça gerada (Sonnet) | ~4 mil | US$ 0,04 |
| **Total** | | **US$ 0,08 a 0,25 ≈ R$ 0,45 a R$ 1,40** |

Processos longos aumentam o custo. Embeddings custam centavos por mês.

## Custo de pagamento (Asaas)

- Pix: R$ 0,99 por cobrança paga nos 3 primeiros meses e R$ 1,99 depois.
- Cartão e boleto: conferir em https://www.asaas.com/precos-e-taxas

## Margem por plano (estimativa)

| Plano | Preço | Uso médio de IA | Pagamento | Margem bruta |
|---|---|---|---|---|
| Start (15 peças) | R$ 79 | ~R$ 15 | ~R$ 2 | ~R$ 62 |
| Pro (50 peças, uso médio de 35) | R$ 129 | ~R$ 40 | ~R$ 2 | ~R$ 87 |
| Plus (20 posts) | + R$ 49 | ~R$ 5 | — | ~R$ 44 |

## Margem do Cliente Fundador (estimativa, sem impostos)

Oferta: R$ 79/mês com 50 peças e 15 dias grátis com até 15 peças.

| Cenário | Uso de IA | Pagamento | Margem por cliente |
|---|---|---|---|
| Uso médio (35 peças) | ~R$ 40 | ~R$ 2 | ~R$ 37 |
| Pior caso (50 peças a R$ 1,40) | R$ 70 | ~R$ 2 | ~R$ 7 |

- **6 fundadores:** de R$ 42 a R$ 222 por mês, abaixo dos custos fixos de R$ 300 a R$ 400. O programa é investimento em validação até haver clientes a preço normal.
- **Período grátis:** no máximo R$ 21 por fundador, R$ 126 no total.

## Simulação com 50 clientes Pro

| Item | Valor |
|---|---|
| Receita | R$ 6.450 |
| Custos fixos | ~R$ 400 |
| IA | ~R$ 2.000 |
| Pagamentos | ~R$ 100 |
| **Sobra antes de impostos** | **~R$ 3.950** |

## Custos únicos

| Item | Valor |
|---|---|
| Revisão dos textos legais por advogado | R$ 1.000 a R$ 3.000 (ou permuta por meses grátis) |
| Tráfego pago inicial | R$ 500 a R$ 1.500 |

## Atenção: enquadramento fiscal

O teto anual do MEI (R$ 81 mil, confirmar se houve mudança) é ultrapassado com cerca de 55 clientes a R$ 120. Procurar um contador ao chegar perto de 30 clientes para migrar para ME no Simples Nacional.

## Controles de custo

- Registro de tokens por chamada (`uso_ia`) e por escritório (`uso_mensal`).
- Alerta interno se um escritório passar de R$ 60 de IA no mês.
- Prompt caching nas partes fixas.
- Limites de peças por plano.
