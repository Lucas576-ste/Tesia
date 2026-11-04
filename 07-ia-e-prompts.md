# 07 — IA e prompts

## Princípios

- **Etapas pequenas, não um prompt gigante.** Cada etapa tem entrada e saída definidas.
- **Modelo certo para cada etapa:** Haiku para extração, classificação e resumo (barato e rápido); Sonnet para escrever a peça.
- **Saídas estruturadas em JSON** sempre que o resultado for usado pelo código, validadas com zod.
- **A IA nunca escolhe livremente:** tipo de peça e regra de prazo vêm de listas do banco.
- **Nada de inventar:** fatos só dos documentos; jurisprudência e dados incertos são marcados para conferência.
- **Prompts versionados** em `packages/ia/prompts/`, com o número da versão gravado em `uso_ia`.

## Pipeline

```
[PDF] → extração de texto/OCR
      → 1. Extração (Haiku, JSON)
      → motor de prazos (código)
      → 2. Escolha da peça (Haiku, entre opções do banco)
      → 3. Resumo (Haiku)
      → advogado confirma
      → 4. Geração da peça (Sonnet + estilo + RAG)
      → 5. Revisão de citações (Haiku)
      → editor
```

Uma vez por advogado (e quando ele adiciona peças): **0. Perfil de estilo** (Sonnet).

## 0. Perfil de estilo

**Entrada:** texto das peças enviadas pelo advogado.
**Saída (JSON):**
- estrutura padrão por tipo de peça (ordem das seções e nomes que ele usa)
- tom e tamanho médio das frases
- forma de citar lei e jurisprudência
- tribunais e súmulas que ele cita com frequência
- fórmulas de abertura e fechamento
- frases para a tela "O que aprendi sobre você"

Além do perfil, cada peça é dividida em trechos por seção, que recebem embedding e vão para `estilo_trechos`.

## 1. Extração

**Modelo:** Haiku.
**Entrada:** texto da intimação.
**Saída (JSON):** número do processo, tribunal, órgão, UF, município, partes, polo do cliente, rito, tipo de ato, data de disponibilização, resultado, pontos centrais da decisão e trechos que fundamentam cada ponto.

Regras do prompt:
- Responder apenas com o JSON no formato definido.
- Campo não encontrado vem como `null`. Nunca deduzir data.
- Cada ponto da decisão vem com o trecho literal que o sustenta.

## 2. Escolha da peça

**Modelo:** Haiku.
**Entrada:** área, rito, tipo de ato, resultado, polo do cliente e a lista de peças possíveis (de `tipos_peca` e `regras_prazo`).
**Saída:** a peça recomendada e as alternativas, sempre entre as opções recebidas, com uma frase de justificativa.

## 3. Resumo

**Modelo:** Haiku.
**Saída:** "O que aconteceu" em até 4 frases, linguagem direta, e "Pontos que podem ser atacados" em tópicos, cada um ligado a um trecho da decisão.

## 4. Geração da peça

**Modelo:** Sonnet.
**Contexto enviado (nesta ordem, para aproveitar o cache):**
1. Instruções fixas do sistema (cache)
2. Perfil de estilo do advogado (cache)
3. Estrutura e instruções do tipo de peça (cache)
4. 2 ou 3 trechos de peças parecidas do advogado, buscados por similaridade no pgvector
5. Dados extraídos e texto dos documentos do processo
6. Pedido: tipo de peça e pontos a atacar confirmados

**Regras fixas das instruções do sistema:**
- Você escreve um rascunho para um advogado brasileiro revisar.
- Siga o perfil de estilo e a estrutura do advogado.
- Use apenas fatos presentes nos documentos. Não invente fatos, datas, valores ou nomes.
- Não invente jurisprudência. Cite só súmulas e precedentes que o advogado já usa nas peças dele ou que estão nos documentos, e marque cada citação com `[CONFIRMAR: conferir na fonte oficial]`.
- Qualquer dado que falte vira `[CONFIRMAR: descrição do que falta]`.
- Saída em seções, no formato definido, para o editor e o .docx.

**Ajustes:** o pedido do advogado ("reforce o argumento da idade") é enviado junto com a peça atual. Retorna apenas as seções alteradas.

## 5. Revisão de citações

**Modelo:** Haiku.
**Entrada:** peça gerada + documentos.
**Saída:** lista de afirmações e citações sem sustentação nos documentos. Cada item vira uma pendência destacada no editor.

## Conteúdo para Instagram (Plus)

- Entrada: área, temas dos casos do mês (só categoria, sem dados de cliente) e o perfil do advogado.
- Saída: tema, texto do post ou carrossel, legenda e sugestão de imagem.
- Checagem final: verificar tom informativo, ausência de promessa de resultado, captação de clientela, preço ou dado identificável. Se falhar, gerar de novo.

## Custo e desempenho

- Prompt caching nas partes fixas (instruções, perfil de estilo, estrutura da peça).
- Registro de tokens e custo por chamada em `uso_ia`.
- Limite de tamanho: processos muito longos são resumidos por partes antes da geração.
- Fallback: se a API principal falhar, o job tenta de novo com espera crescente. Se continuar falhando, o status vira `erro` e o advogado é avisado.

## Qualidade

- Conjunto de casos de teste por área (intimações reais anonimizadas + resultado esperado).
- Toda mudança de prompt roda esse conjunto antes de ir para produção.
- Métricas: percentual de prazos aceitos sem edição, número de pendências por peça e quanto o advogado altera o rascunho.
