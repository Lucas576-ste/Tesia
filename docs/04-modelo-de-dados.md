# 04 — Modelo de dados

Princípios:
- Todo registro de negócio tem `escritorio_id`. O advogado solo é um escritório com um usuário, então o multiusuário futuro não exige migração.
- Todas as tabelas têm `id` (uuid), `criado_em` e `atualizado_em`.
- RLS ativo em todas as tabelas com `escritorio_id`.
- Exclusão lógica (`excluido_em`) para processos, peças e intimações.
- Chaves estrangeiras entre tabelas de negócio incluem o `escritorio_id`, para que nenhum registro aponte para outro escritório.
- Migrations em `packages/db/migrations`, seeds em `packages/db/seeds` e teste local de RLS com `pnpm --filter @tesia/db test:local`.

## Diagrama de relacionamentos

```
escritorios 1─N usuarios
escritorios 1─N clientes 1─N processos
processos   1─N intimacoes 1─N prazos
processos   1─N pecas  N─1 tipos_peca N─1 areas
intimacoes  1─N pecas
usuarios    1─N estilo_documentos 1─N estilo_trechos
usuarios    1─1 perfis_estilo
usuarios    1─N prazos (responsável) / 1─N pecas (responsável)
escritorios 1─N convites
escritorios 1─N indicacoes
clientes    1─N honorarios 1─N honorarios_pagamentos
escritorios 1─N relatorios_mensais
escritorios 1─1 assinaturas N─1 planos
escritorios 1─N uso_mensal
feriados, suspensoes_tribunal, regras_prazo (tabelas de referência, sem escritorio_id)
```

## Tabelas de negócio

### escritorios
| Campo | Tipo | Observação |
|---|---|---|
| nome | text | |
| documento | text | CPF ou CNPJ |
| plano_atual | text | atalho para leitura rápida |

### usuarios
| Campo | Tipo | Observação |
|---|---|---|
| escritorio_id | uuid | |
| auth_user_id | uuid | id do Supabase Auth |
| nome | text | |
| email | text | |
| oab_numero | text | |
| oab_uf | char(2) | |
| areas | text[] | áreas de atuação escolhidas |
| papel | enum | `dono`, `advogado`, `estagiario` (multiusuário futuro) |
| whatsapp | text | para alertas |
| modelo_docx_path | text | modelo .docx com timbrado do advogado |
| calendario_token | text | token secreto do link de agenda (iCal); pode ser renovado |

### clientes
| Campo | Tipo | Observação |
|---|---|---|
| escritorio_id | uuid | |
| nome | text | |
| documento | text | CPF/CNPJ, opcional |
| contato | jsonb | telefone, e-mail |

### processos
| Campo | Tipo | Observação |
|---|---|---|
| escritorio_id | uuid | |
| cliente_id | uuid | opcional no MVP |
| numero_cnj | text | único por escritório |
| tribunal | text | ex.: TRF1, TJDFT, TRT10 |
| orgao | text | vara ou juizado |
| uf | char(2) | |
| municipio | text | para feriados municipais |
| area | text | |
| rito | enum | `comum`, `jef`, `jec`, `trabalhista`, `criminal`, `outro` |
| polo | enum | `ativo`, `passivo` |
| parte_contraria | text | |
| status | enum | `ativo`, `arquivado` |
| sistema | text | fase 2; ex.: PJe, eproc |
| fase | text | fase 2; estimada pela última intimação ou corrigida pelo advogado |
| fase_origem | enum | fase 2; `intimacao`, `manual` |
| fase_atualizada_em | timestamptz | fase 2 |

### intimacoes
| Campo | Tipo | Observação |
|---|---|---|
| escritorio_id | uuid | |
| processo_id | uuid | preenchido após a extração |
| origem | enum | `upload`, `djen`, `api_terceiro` |
| arquivo_path | text | |
| texto | text | texto extraído |
| data_disponibilizacao | date | |
| data_publicacao | date | calculada |
| tipo_ato | text | ex.: `sentenca`, `decisao_interlocutoria`, `despacho` |
| resultado | text | ex.: `improcedente` |
| extracao | jsonb | JSON completo devolvido pela IA |
| resumo | text | |
| status | enum | `recebida`, `processando`, `analisada`, `erro` |

### prazos
| Campo | Tipo | Observação |
|---|---|---|
| escritorio_id | uuid | |
| processo_id | uuid | opcional em compromissos manuais |
| intimacao_id | uuid | opcional; vazio quando o prazo é manual |
| origem | enum | `intimacao`, `manual` |
| tipo | enum | `prazo`, `audiencia`, `compromisso` |
| hora | time | opcional, para audiências e compromissos |
| responsavel_id | uuid | usuário responsável (plano Sociedade) |
| regra_prazo_id | uuid | regra usada no cálculo; vazio quando manual |
| descricao | text | ex.: "Recurso inominado" |
| dias | int | |
| contagem | enum | `uteis`, `corridos` |
| data_inicio | date | |
| data_vencimento | date | prazo fatal |
| data_vencimento_sugerida | date | data calculada pelo motor, guardada quando o advogado edita o fatal |
| data_prazo_interno | date | opcional; vazio em audiências e compromissos |
| memoria_calculo | jsonb | passo a passo exibido ao advogado |
| confirmado_por | uuid | usuário que confirmou |
| confirmado_em | timestamptz | |
| status | enum | `sugerido`, `confirmado`, `cumprido`, `perdido`, `descartado` |

### pecas
| Campo | Tipo | Observação |
|---|---|---|
| escritorio_id | uuid | |
| processo_id | uuid | |
| intimacao_id | uuid | opcional |
| prazo_id | uuid | opcional |
| tipo_peca_id | uuid | |
| responsavel_id | uuid | usuário responsável (plano Sociedade) |
| titulo | text | |
| conteudo | jsonb | documento em blocos/seções |
| versao | int | |
| pendencias | jsonb | lista de `[CONFIRMAR]` encontrados |
| fontes | jsonb | trechos dos documentos usados |
| ajustes_usados | int | até 3 sem contar como nova peça |
| status | enum | `gerando`, `rascunho`, `revisada`, `protocolada` |

### pecas_versoes
Histórico de cada versão da peça (`peca_id`, `versao`, `conteudo`, `origem`: `ia` ou `usuario`).

## Estilo do advogado

### estilo_documentos
| Campo | Tipo | Observação |
|---|---|---|
| escritorio_id | uuid | |
| usuario_id | uuid | |
| arquivo_path | text | |
| tipo_peca_id | uuid | detectado ou informado |
| area | text | |
| texto | text | |
| status | enum | `processando`, `lido`, `erro` |

### estilo_trechos
| Campo | Tipo | Observação |
|---|---|---|
| estilo_documento_id | uuid | |
| escritorio_id | uuid | |
| secao | text | ex.: `sintese_fatos`, `merito`, `pedidos` |
| texto | text | |
| embedding | vector(1024) | 1024 serve para Voyage e OpenAI (com o parâmetro de dimensões) |

### perfis_estilo
| Campo | Tipo | Observação |
|---|---|---|
| usuario_id | uuid | único |
| guia | jsonb | estrutura, tom, padrões de citação, fechamento |
| resumo_exibicao | text[] | frases mostradas na tela "O que aprendi sobre você" |
| atualizado_com | int | quantidade de peças usadas |

## Tabelas de referência (globais)

### areas
`codigo` (ex.: `previdenciario`), `nome`, `ativa` (bool), `ordem`.

### tipos_peca
| Campo | Tipo | Observação |
|---|---|---|
| area | text | `geral` para peças comuns a todas as áreas |
| codigo | text | ex.: `recurso_inominado` |
| nome | text | |
| estrutura | jsonb | seções esperadas da peça |
| instrucoes | text | orientações específicas para a IA |
| minutos_economizados | int | estimativa de tempo poupado por peça, usada no relatório do mês |
| ativa | bool | |

### regras_prazo
| Campo | Tipo | Observação |
|---|---|---|
| area | text | |
| rito | text | |
| tipo_ato | text | |
| tipo_peca_codigo | text | |
| dias | int | |
| contagem | enum | `uteis`, `corridos` |
| fundamento | text | artigo de lei exibido na memória de cálculo |
| prioridade | int | desempate entre regras |
| ativa | bool | começa `false`; só vira `true` depois da revisão por advogado |
| revisada_por | text | nome e OAB de quem revisou |
| revisada_em | timestamptz | obrigatório para ativar |

### feriados
| Campo | Tipo | Observação |
|---|---|---|
| data | date | |
| nome | text | |
| abrangencia | enum | `nacional`, `estadual`, `municipal`, `tribunal` |
| uf | char(2) | |
| municipio | text | |
| tribunal | text | |
| fonte | text | link ou portaria |
| escritorio_id | uuid | preenchido quando cadastrado pelo próprio advogado |

### suspensoes_tribunal
`tribunal`, `data_inicio`, `data_fim`, `motivo`, `fonte`, `escritorio_id` (opcional).

## Assinatura e uso

### planos
`codigo`, `nome`, `preco_mensal`, `limite_pecas`, `limite_areas`, `limite_usuarios`, `limite_posts`, `recursos` (jsonb).

### assinaturas
`escritorio_id`, `plano_codigo`, `addons` (text[], ex.: `plus`), `status` (`trial`, `ativa`, `inadimplente`, `cancelada`), `asaas_customer_id`, `asaas_subscription_id`, `periodo_inicio`, `periodo_fim`.

### uso_mensal
`escritorio_id`, `competencia` (ex.: `2026-11`), `pecas_geradas`, `pecas_extras`, `posts_gerados`, `tokens_entrada`, `tokens_saida`, `custo_estimado`.

### uso_ia
Uma linha por chamada: `escritorio_id`, `job_id`, `etapa`, `modelo`, `tokens_entrada`, `tokens_cache`, `tokens_saida`, `custo_estimado`, `duracao_ms`.

## Equipe e indicação

### convites (plano Sociedade)
`escritorio_id`, `email`, `papel`, `token`, `convidado_por`, `expira_em`, `aceito_em`.

### indicacoes
`escritorio_indicador_id`, `codigo` (único por escritório), `escritorio_indicado_id`, `status` (`cadastrado`, `pagante`, `recompensado`), `recompensa_aplicada_em`.

## Honorários simples (fase 1.5)

### honorarios
`escritorio_id`, `cliente_id`, `processo_id` (opcional), `descricao`, `tipo` (`fixo`, `exito`, `parcelado`, `mensal`), `valor_combinado`, `observacao`.

### honorarios_pagamentos
`honorario_id`, `escritorio_id`, `valor`, `vencimento`, `pago_em` (vazio = em aberto).

## Relatório do mês (fase 1.5)

### relatorios_mensais
Foto do mês fechado, gerada por job no dia 1: `escritorio_id`, `competencia`, `prazos_cumpridos`, `prazos_perdidos`, `pecas_geradas`, `intimacoes_analisadas`, `minutos_economizados` (soma de `tipos_peca.minutos_economizados`, exibida como estimativa), `honorarios_recebidos`.

## Plano Plus

### conteudos
`escritorio_id`, `usuario_id`, `tipo` (`post`, `carrossel`, `story`), `tema`, `texto`, `legenda`, `imagens` (jsonb), `agendado_para`, `status` (`sugerido`, `aprovado`, `agendado`, `publicado`), `checagem_oab` (jsonb).

## Auditoria

### auditoria
`escritorio_id`, `usuario_id`, `acao` (ex.: `peca.download`, `prazo.confirmado`, `prazo.interno_alterado`), `entidade`, `entidade_id`, `ip`, `criado_em`.
