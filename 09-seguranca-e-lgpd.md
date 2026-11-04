# 09 — Segurança e LGPD

## Papéis na LGPD

- **Advogado/escritório:** controlador dos dados dos clientes dele.
- **Rito:** operador, trata os dados em nome do advogado.
- **Provedores (Supabase, Anthropic, provedor de embeddings, Asaas, Resend):** suboperadores.

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

## Dados e IA

- Dados armazenados no Brasil (Supabase, região São Paulo).
- O processamento pela API de IA acontece fora do Brasil. Isso é **transferência internacional de dados** e precisa estar declarado na política de privacidade.
- Antes do lançamento, conferir os termos comerciais atuais do provedor de IA sobre retenção e uso de dados para treino, e registrar a conclusão em `11-decisoes.md`.
- Enviar à IA apenas o necessário para cada etapa.
- Conteúdo para Instagram nunca usa nome de cliente, número de processo ou dado identificável.

## Retenção e exclusão

- O advogado pode excluir peças, intimações e processos.
- Ao cancelar, os dados ficam disponíveis para exportação por 90 dias e depois são apagados, inclusive arquivos e embeddings.
- Backups expiram conforme a política do provedor.

## Textos legais

| Documento | Conteúdo principal |
|---|---|
| Termos de uso | O que o serviço faz; peças e prazos são sugestões; revisão e protocolo são responsabilidade do advogado; limites dos planos; cancelamento; uso proibido |
| Política de privacidade | Dados coletados, finalidade, base legal, suboperadores, transferência internacional, retenção, direitos do titular, canal de contato (encarregado) |
| Contrato de tratamento de dados (DPA) | Obrigações do Rito como operador, para escritórios que pedirem |
| Política de cookies | Cookies usados e finalidade |

Os textos devem ser revisados por um advogado. Sugestão: oferecer meses grátis a um dos advogados parceiros em troca da revisão.

## Publicidade da advocacia (plano Plus)

- O conteúdo gerado segue as regras de publicidade da OAB: caráter informativo, sem promessa de resultado, sem captação de clientela, sem menção a preços.
- A checagem automática é uma ajuda. A responsabilidade pela publicação é do advogado, e isso aparece nos termos de uso.
