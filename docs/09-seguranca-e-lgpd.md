# 09 — Segurança e LGPD

## Papéis na LGPD

- **Advogado/escritório:** controlador dos dados dos clientes dele.
- **Tesia:** operadora, trata os dados em nome do advogado.
- **Provedores (Supabase, Anthropic, provedor de embeddings, Asaas, Resend):** suboperadores.
- **Consultas públicas (BrasilAPI para CNPJ e ViaCEP para endereço):** recebem só o número consultado (o CNPJ ou o CEP), que é dado público, e nenhum dado do cliente do advogado. A consulta de CNPJ sai do servidor, com limite de 20 por minuto por usuário e tempo máximo de 8 segundos.

## Segurança técnica (obrigatória desde o MVP)

- **Isolamento por escritório:** RLS no Postgres em todas as tabelas com `escritorio_id`, com testes automatizados de acesso cruzado.
- **Chave `service_role`:** usada apenas no worker e em rotas internas, nunca exposta ao navegador. Toda query feita com ela filtra por `escritorio_id`.
- **Criptografia:** HTTPS em tudo; arquivos criptografados em repouso no storage; links de download temporários (assinados, com expiração curta).
- **Segredos:** chaves de API em variáveis de ambiente do provedor de hospedagem, nunca no repositório.
- **Rate limit:** na API, por usuário e por IP, para conter abuso e custo de IA.
- **Backup:** diário do banco, com teste de restauração mensal.
- **Auditoria:** registro de login, download de peças, confirmação de prazos e exclusões.
- **Dependências:** atualização periódica e verificação de vulnerabilidades no CI.
- **Logs:** nunca gravar o texto dos documentos nos logs, só identificadores.

## Como está implementado (Dia 31, 2026-11-18)

- **Permissões por coluna:** o advogado só edita nome, OAB, áreas, WhatsApp, timbrado e alertas na própria linha de `usuarios`. Papel, escritório e e-mail não mudam pelo app (migration 0015, coberto em `packages/db/teste/rls.sql`).
- **Rate limit:** contador no Postgres (`limites_uso` e `consumir_limite`, só com a service role). Login, cadastro e recuperação: 10 por 10 minutos por IP e por e-mail. Envio de intimação: 60 por hora. Gerar peça e ajuste: 20 por hora. Agenda `.ics`: 60 por hora por IP. Download do `.docx`: 60 por hora. Se o contador falhar, a ação segue (não trava o advogado).
- **Downloads:** os buckets são privados. O `.docx` sai por rota autenticada que confere o dono, com `Cache-Control: private, no-store`. Não existe link público de arquivo.
- **Sentry:** web (`instrumentation.ts`, `instrumentation-client.ts`, `global-error.tsx`) e worker. Coleta desligada para usuário, cookies, cabeçalhos, corpos, parâmetros, entradas e saídas da IA, consultas e variáveis: só a mensagem do erro e ids.
- **Backup:** GitHub Action `backup.yml`, todo dia às 3h de Brasília. `pg_dump` (schemas public, auth e storage) criptografado com AES-256 e guardado 30 dias como artefato privado. Os arquivos do Storage não entram no dump.

### Restaurar um backup
1. Baixe o artefato do dia em GitHub → Actions → "Backup diário do banco".
2. Descriptografe: `gpg -d tesia-AAAA-MM-DD.dump.gpg > tesia.dump` (pede a senha `BACKUP_SENHA`).
3. Restaure num banco vazio: `pg_restore --no-owner --no-privileges -d "<url do banco novo>" tesia.dump`.
4. Teste de restauração: uma vez por mês, num projeto Supabase de teste.

## Dados e IA

- Dados armazenados no Brasil (Supabase, região São Paulo).
- O processamento pela API de IA acontece fora do Brasil. Isso é **transferência internacional de dados** e precisa estar declarado na política de privacidade.
- Antes do lançamento, conferir os termos comerciais atuais do provedor de IA sobre retenção e uso de dados para treino, e registrar a conclusão em `11-decisoes.md`.
- Enviar à IA apenas o necessário para cada etapa.
- Conteúdo para Instagram nunca usa nome de cliente, número de processo ou dado identificável.

## Busca de intimações nos diários

- Base legal: consentimento do advogado, registrado em `usuarios.busca_oab_aceita_em` e na auditoria (`busca_oab_aceita`, `busca_oab_encerrada`).
- Sem aceite, nenhum termo da OAB é criado. O aceite é pedido só em Configurações → Perfil. O advogado revoga a qualquer momento em Configurações → Perfil ("Parar de buscar"), o que apaga o termo e zera a data; as intimações já recebidas ficam na lista.
- Quem já tinha o termo da própria OAB antes da migration 0031 recebeu `busca_oab_aceita_em` no backfill (estava ligado por `djen_ativo`).
- Trocar a OAB ou a UF zera o aceite: o novo número exige novo consentimento.
- Termos de pessoa (pf e pj) já existentes continuam sendo buscados pelo worker, mas não aparecem mais na interface.

## Retenção e exclusão

- O advogado pode excluir peças, intimações e processos.
- Ao cancelar, os dados ficam disponíveis para exportação por 90 dias e depois são apagados, inclusive arquivos e embeddings.
- Backups expiram conforme a política do provedor.

## Textos legais

| Documento | Conteúdo principal |
|---|---|
| Termos de uso | O que o serviço faz; peças e prazos são sugestões; revisão e protocolo são responsabilidade do advogado; limites dos planos; cancelamento; uso proibido |
| Política de privacidade | Dados coletados, finalidade, base legal, suboperadores, transferência internacional, retenção, direitos do titular, canal de contato (encarregado) |
| Contrato de tratamento de dados (DPA) | Obrigações da Tesia como operadora, para escritórios que pedirem |
| Política de cookies | Cookies usados e finalidade |

Os textos devem ser revisados por um advogado. Sugestão: oferecer meses grátis a um dos advogados parceiros em troca da revisão.

## Publicidade da advocacia (plano Plus)

- O conteúdo gerado segue as regras de publicidade da OAB: caráter informativo, sem promessa de resultado, sem captação de clientela, sem menção a preços.
- A checagem automática é uma ajuda. A responsabilidade pela publicação é do advogado, e isso aparece nos termos de uso.

## Pedidos de exportação e exclusão (MVP)
- Em Configurações → Dados, o advogado pede a exportação ou a exclusão da conta. O pedido fica em `pedidos_dados` e chega por e-mail ao suporte.
- O suporte responde em até 15 dias, confirma a identidade por e-mail e só então exporta ou apaga. Nada é apagado automaticamente.
- Dados pessoais exibidos na aba Dados ficam mascarados até o advogado pedir para ver.

## Chat da Lia
- Cada usuário vê só as próprias conversas (RLS por usuário). Conversas apagadas depois de 90 dias (configurável) e removíveis pelo usuário.
- Ao responder, a pergunta, a rota e dados ligados à tela aberta são enviados ao provedor de IA. Nomes de partes só vão no detalhe do item aberto.
- Detalhes em `21-lia-chat.md`.
