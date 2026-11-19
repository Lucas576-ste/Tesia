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
| alerta_email | boolean | alertas por e-mail ligados (padrão: sim) |
| alerta_dias | text[] | quando avisar: `5_uteis`, `2_uteis`, `fatal`, `interno` |
| djen_ativo | boolean | busca automática no DJEN ligada (contas novas: sim; contas anteriores a 19/11/2026 começam desligadas) |
| djen_buscado_ate | date | até que data as publicações já foram buscadas (só o worker altera) |
| modelo_docx_path | text | `escritorio_id/usuario_id/modelo.docx` no bucket privado `modelos` (até 5 MB, só .docx); vazio = modelo padrão da Tesia |
| termos_aceitos_em | timestamptz | quando aceitou os termos e a política no cadastro |
| calendario_token | text | token secreto do link da agenda (48 caracteres hexadecimais); `gerar_novo_link_agenda()` troca, `agenda_valida(token)` e `agenda_por_token(token)` atendem a rota pública `/agenda/<token>.ics` |

O cadastro no Supabase Auth dispara um gatilho (`0004_novo_usuario.sql`) que cria o escritório, o usuário dono e a assinatura em teste de 7 dias no Pro.

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
| partes | text | Texto mostrado nas listas, ex.: "José x INSS" (migration 0013) |
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
| extracao | jsonb | análise gravada pelo worker: `versao`, `dados` (extração), `resumo`, `pecas` (recomendada e alternativas), `prazo` (dias, contagem, fundamento, `regra_revisada`) e `motivo_sem_prazo`. Schema em `packages/shared/src/analise.ts` |
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
| responsavel_id | uuid | quem pediu; o rascunho usa o estilo dessa pessoa |
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
| processo_id | uuid | opcional (a intimação pode não ter número identificado) |
| intimacao_id | uuid | opcional |
| prazo_id | uuid | opcional |
| tipo_peca_id | uuid | |
| responsavel_id | uuid | usuário responsável (plano Sociedade) |
| titulo | text | |
| conteudo | jsonb | `{ doc, aviso }`: `doc` é o documento do editor (JSON do Tiptap). A geração grava `{ secoes: [{ titulo, texto }], aviso }`, convertido para `doc` ao abrir; `aviso` quando saiu genérico |
| versao | int | |
| pendencias | jsonb | `[{ secao, titulo, texto }]` de cada `[CONFIRMAR: ...]` |
| fontes | jsonb | `[{ trecho_id, documento, secao }]`: trechos das peças do advogado usados como base |
| ajustes_usados | int | até 3 sem contar como nova peça |
| ajuste_pedido | text | último pedido de ajuste à Lia |
| ajuste_status | text | `pendente`, `processando`, `concluido`, `erro`; `pendente` põe o job `ajustar_peca` na fila (gatilho) |
| ajuste_erro | text | mensagem mostrada no editor quando o ajuste falha (não é contado) |
| status | enum | `gerando`, `rascunho`, `revisada`, `protocolada`, `erro` |

Peça nova com status `gerando` entra na `fila` como `gerar_peca` (gatilho). Peça com `erro` não conta no limite.

### pecas_versoes
Histórico de cada versão da peça (`peca_id`, `versao`, `conteudo`, `origem`: `ia` ou `usuario`). A versão 1 é da IA; cada "Salvar versão" no editor cria a próxima, atualiza `pecas.conteudo`, `pecas.versao` e recalcula `pecas.pendencias`. Marcar como protocolada muda o prazo ligado para `cumprido` (reabrir volta para `confirmado`).

## Estilo do advogado

### estilo_documentos
| Campo | Tipo | Observação |
|---|---|---|
| escritorio_id | uuid | |
| usuario_id | uuid | |
| arquivo_path | text | `escritorio_id/usuario_id/uuid.pdf\|docx` no bucket privado `estilo` |
| nome_arquivo | text | nome original, para a lista |
| tipo_peca_id | uuid | detectado ou informado |
| area | text | |
| texto | text | |
| status | enum | `processando`, `lido`, `erro` |

### estilo_trechos
| Campo | Tipo | Observação |
|---|---|---|
| estilo_documento_id | uuid | |
| escritorio_id | uuid | |
| secao | text | `enderecamento`, `qualificacao`, `fatos`, `preliminares`, `fundamentos`, `pedidos`, `fechamento` ou `outra` |
| texto | text | |
| embedding | vector(1024) | Voyage `voyage-law-2` |

Cada peça nova entra na `fila` como `processar_peca_estilo` (gatilho). O worker extrai o texto, divide em seções (trechos de até 1.500 caracteres) e grava os embeddings.

### perfis_estilo
| Campo | Tipo | Observação |
|---|---|---|
| usuario_id | uuid | único |
| guia | jsonb | `estrutura_por_tipo`, `tom`, `tamanho_frases`, `citacao_lei`, `citacao_jurisprudencia`, `referencias_frequentes`, `abertura`, `fechamento`, `expressoes_tipicas`, `frases_exibicao`. Schema em `packages/shared/src/estilo.ts` |
| resumo_exibicao | text[] | frases mostradas na tela "O que aprendi sobre você" |
| atualizado_com | int | quantidade de peças usadas |
| pedido_em | timestamptz | última vez que o perfil foi pedido (peça lida, removida ou botão) |
| gerado_em | timestamptz | última geração; a tela mostra "Atualizando" enquanto `pedido_em` for mais novo |

O job `gerar_perfil_estilo` é criado por gatilho quando uma peça vira `lido` ou uma peça lida é removida, com 20 segundos de espera e sem duplicar job pendente. O botão "Atualizar meu estilo" chama `pedir_perfil_estilo()`, que só age no próprio usuário.

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
`escritorio_id`, `competencia` (ex.: `2026-11`, no fuso de Brasília), `pecas_geradas`, `pecas_extras`, `posts_gerados`, `tokens_entrada`, `tokens_saida`, `custo_estimado`. Só o worker grava.

`uso_pecas_atual()`: para o usuário logado, devolve `usadas` (geradas no mês + em geração) e `limite` (5 no teste grátis; senão o limite do plano + pacotes extras).

### uso_ia
Uma linha por chamada: `escritorio_id`, `job_id`, `etapa`, `modelo`, `versao_prompt` (ex.: `transcricao@1`), `tokens_entrada`, `tokens_cache`, `tokens_saida`, `custo_estimado`, `duracao_ms`.

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

### fila
`escritorio_id`, `tipo` (ex.: `analisar_intimacao`), `dados` (jsonb), `status` (`pendente`, `executando`, `concluida`, `falhou`), `tentativas`, `max_tentativas`, `disponivel_em`, `iniciado_em`, `concluido_em`, `erro`. RLS ligado e sem acesso para usuários: só o worker usa. Intimação nova com status `recebida` cria o job por gatilho.

### Storage
Bucket privado `intimacoes`, até 20 MB, só PDF. Caminho `escritorio_id/uuid.pdf`; o usuário só envia e lê na pasta do próprio escritório, e `intimacoes.arquivo_path` precisa estar nessa pasta.

### auditoria
`escritorio_id`, `usuario_id`, `acao` (ex.: `peca.download`, `prazo.confirmado`, `prazo.interno_alterado`), `entidade`, `entidade_id`, `ip`, `criado_em`.

### alertas_enviados
Registro de cada aviso mandado, para nunca repetir (migration 0014). Só o worker acessa.

| Campo | Tipo | Observação |
|---|---|---|
| usuario_id | uuid | quem recebeu |
| prazo_id | uuid | prazo avisado |
| momento | text | `5_uteis`, `2_uteis`, `fatal` ou `interno` |
| data | date | dia do envio; único com usuário, prazo e momento |

Em `intimacoes`, `djen_id` (bigint) guarda o id da comunicação no DJEN, único por escritório, para não importar duas vezes (migration 0016).

Em `processos` (migration 0017): `fase` (código da fase do rito, ver `packages/shared/src/fases.ts`), `fase_origem` (`intimacao`, `djen` ou `manual`), `fase_atualizada_em` e `encerrado_em`. Em `clientes`: `nome_normalizado`, para ligar o mesmo cliente sem diferença de acento ou maiúscula. O worker liga o processo ao cliente pela parte do polo do cliente e atualiza a fase a cada intimação, sem sobrescrever a correção manual mais recente.
