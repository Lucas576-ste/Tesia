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

## Leitura do documento

**Modelo:** Haiku, só quando o PDF não tem texto (escaneado).
- O worker extrai o texto direto do PDF com `unpdf`. Com menos de 100 caracteres por página, envia o PDF ao Haiku.
- Prompt `transcricao@1` (`packages/ia/src/prompts/transcricao.ts`): transcrever tudo, na ordem, sem resumir nem corrigir; trecho ilegível vira `[ILEGÍVEL]`.
- Esforço `low` e streaming. Resposta cortada, recusa ou transcrição vazia viram erro definitivo, e a intimação fica como `erro`.
- O custo é calculado em `packages/ia/src/custo.ts` com a tabela de `modelos.ts` e gravado em `uso_ia`.

## 0. Perfil de estilo

**Entrada:** texto das peças enviadas pelo advogado.
**Saída (JSON):**
- estrutura padrão por tipo de peça (ordem das seções e nomes que ele usa)
- tom e tamanho médio das frases
- forma de citar lei e jurisprudência
- tribunais e súmulas que ele cita com frequência
- fórmulas de abertura e fechamento
- frases para a tela "O que aprendi sobre você"

Implementação (`packages/ia/src/estilo/perfil.ts`, prompt `perfil@1`):
- Sonnet 5.5, saída estruturada, esforço `medium` e fallback automático do servidor (`fallbacks: "default"`) para recusas por engano.
- Proíbe nomes de partes, números de processo e dados pessoais no perfil.
- De 4 a 6 frases em segunda pessoa para a tela; menos de 4 vira erro.
- Gerado sozinho quando as peças terminam de ser lidas (uma vez para várias peças) e pelo botão "Atualizar meu estilo".

Além do perfil, cada peça é dividida em trechos por seção, que recebem embedding e vão para `estilo_trechos`.

- Divisão por títulos ("DOS FATOS", "DO DIREITO", "DOS PEDIDOS", "I – ..."), sem IA, em `packages/ia/src/estilo/secoes.ts`. Endereçamento, qualificação e fechamento são reconhecidos pelo começo e pelo fim da peça.
- Embeddings com Voyage `voyage-law-2`: `input_type` `document` para as peças e `query` para a busca da geração.
- Teste real: "perito desconsiderou os exames" achou o trecho "o juiz não está adstrito ao laudo pericial", sem nenhuma palavra em comum.

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

## Como as etapas 1 a 3 rodam

- Código em `packages/ia/src/analise/`; prompts em `packages/ia/src/prompts/` (`extracao@4`, `resumo@2`, `geracao@6`, `revisao@4`).
- Saída estruturada da API (`messages.parse` com o schema zod), validada antes de usar.
- Listas fechadas iguais às do banco: área (`civel`, `trabalhista`, `previdenciario`, `familia`), rito (`rito_processo`) e tipo de ato (os de `regras_prazo` mais `outro`).
- Data fora do formato `AAAA-MM-DD` ou inexistente vira `null`.
- Todo trecho citado (pontos da decisão e pontos atacáveis) é conferido pelo código no texto do documento. O que não está lá é descartado.
- Na escolha da peça, o schema aceita só os códigos das opções enviadas.
- Resumo cortado em 4 frases pelo código, sem quebrar em números de processo ou abreviações como "S.A.". `resumo@2` proíbe citar nomes de campos e comentários sobre o que falta no documento.
- Rito não identificado (`outro`) busca as regras do procedimento comum.
- O worker corrige JEF e JEC pelo segmento da justiça no número CNJ (4 = federal, 8 = estadual): a classe do PJe no JEF se chama "Procedimento do Juizado Especial Cível" e confundia a IA.
- `extracao@3` identifica a forma de recebimento (`diario`, `portal`, `citacao`, `nao_identificada`) e a data de envio do portal, só quando escrita.
- Avaliação com casos fictícios: `pnpm --filter @tesia/ia avaliar` (usa a API real e mostra acertos e custo).

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

**Implementação (`packages/ia/src/geracao/`, prompt `geracao@6`):**
- Sonnet 5.5 em streaming, esforço `medium` e fallback automático do servidor.
- Sistema em 3 blocos com cache: instruções fixas, perfil de estilo e tipo de peça.
- Até 6 trechos (o melhor de cada seção) vêm do pgvector com o embedding de busca (Voyage, `input_type` `query`) montado a partir do nome da peça, do resumo e dos pontos a atacar.
- Resposta em `<secao titulo="...">`, separada pelo código. Endereçamento, qualificação e fechamento vêm sem título, e os demais títulos seguem os do advogado (nunca os códigos internos); cada `[CONFIRMAR: ...]` vira pendência com a seção.
- Tamanho: o worker calcula o tamanho médio das peças já lidas do advogado (do mesmo tipo e, na falta, de todas; entre 800 e 12.000 caracteres) e envia como `<tamanho_de_referencia>`; a peça deve ter de 0,8 a 1,1 vez esse tamanho.
- Marcação: `[CONFIRMAR]` só para dado que a peça precisa e o caso não informa e para jurisprudência. Quando o documento do caso não é a petição inicial, a peça não afirma o que a inicial contém ou omite (no máximo uma marca "conferir na inicial" por seção). Trechos e peças do advogado servem só de forma, nunca de argumento ou fato.
- Sem perfil ou sem peças, gera mesmo assim e avisa que o rascunho saiu genérico.

**Ajustes (`packages/ia/src/geracao/ajuste.ts`, prompt `ajuste@1`):** Sonnet com o perfil de estilo e a peça em seções numeradas; devolve só as seções alteradas (`<secao indice="N">`), juntadas pelo código. Até 3 ajustes por peça sem custo; do 4º em diante, cada ajuste conta 1 peça no mês. Recurso do Pro (e do teste grátis).

**Ajustes:** o pedido do advogado ("reforce o argumento da idade") é enviado junto com a peça atual. Retorna apenas as seções alteradas.

## 5. Revisão de citações

**Modelo:** Haiku.
**Entrada:** peça gerada + documentos.
**Saída:** lista de afirmações e citações sem sustentação nos documentos. Cada item vira uma pendência destacada no editor.

Implementação (`packages/ia/src/geracao/revisao.ts`, prompt `revisao@4`): roda dentro da geração, logo depois do Sonnet. Aponta no máximo 5 itens, agrupa os que têm a mesma causa e não aponta o que o documento do caso sustenta nem fórmulas de estilo do advogado. O Haiku devolve `{ trecho_exato, motivo }`; o código insere ` [CONFIRMAR: motivo]` logo depois do trecho, sem duplicar marcação existente. Se a revisão falhar, a peça é gravada mesmo assim.

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
