# 20 — Dia 34: entrada dos primeiros clientes fundadores

**Objetivo:** colocar 2 ou 3 advogados do DF para usar a Tesia de verdade, junto com você, e anotar todos os problemas. Diferente do `18-roteiro-advogados.md` (conversa de descoberta com dados de exemplo), aqui o advogado cria a conta e usa com intimações reais.

## Antes do dia (com você)

- [ ] **Push:** pedir o push dos commits locais (Dias 32 e 33). O push publica o site na Vercel.
- [ ] **Vercel Pro:** Project → Settings → Billing → Pro. O plano grátis não permite uso comercial.
- [ ] **Variáveis na Vercel** (Settings → Environment Variables → Production), e depois Redeploy:
  - já devem existir: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_CONTATO_EMAIL`;
  - novas: `SUPABASE_SERVICE_ROLE_KEY`, `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` (mesmo valor do `SENTRY_DSN`).
- [ ] **Railway Hobby** (US$ 5 por mês):
  1. New Project → Deploy from GitHub → Tesia (o `railway.json` já aponta o Dockerfile do worker).
  2. Variables: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `EMBEDDINGS_API_KEY`, `RESEND_API_KEY`, `SENTRY_DSN`, `URL_APP` (endereço da Vercel) e `NODE_ENV=production`.
  3. Nos logs, deve aparecer `worker_iniciado`.
  4. Depois disso, não é preciso deixar o `pnpm dev` ligado. Se ficar, os dois dividem a fila sem problema.
- [ ] **Supabase:** Authentication → URL Configuration. Colocar o endereço da Vercel em Site URL e em Redirect URLs.
- [ ] **Voyage:** cadastrar um cartão. Sem cartão, o limite de chamadas é baixo e o Meu estilo de vários advogados ao mesmo tempo pode travar.
- [ ] **E-mails de alerta.** Sem domínio verificado no Resend, eles não chegam aos advogados, só a você. Escolha um caminho:
  - (a) registrar um domínio (por exemplo, `tesia.com.br`, cerca de R$ 40 por ano no registro.br), verificar no Resend e trocar `ALERTA_REMETENTE` no Railway;
  - (b) seguir sem e-mail nesta primeira semana e avisar os advogados. Painel e agenda (iCal) funcionam normalmente.
- [ ] **Teste final no site publicado:** criar uma conta sua, enviar um dos PDFs de `~/Documentos/pdfs-teste-tesia/` e ver a análise chegar.

## Na sessão com cada advogado (30 a 40 minutos)

1. **Cadastro** no site publicado, com o e-mail dele. Confirmar o link que chega no e-mail e fazer o onboarding (OAB e áreas).
2. **Plano fundador:** mande o e-mail do cadastro para o Claude, que roda `packages/db/scripts/ativar-fundador.sql`. O plano fica ativo por 15 dias, com 50 peças. Ele recarrega a página e vê "Cliente Fundador" em Plano e uso.
3. **Meu estilo:** enviar 2 ou 3 peças antigas dele, em PDF ou Word, e esperar o "Lido" e o "O que aprendi sobre você".
4. **Timbrado:** Configurações → Modelo, enviar o .docx com o papel timbrado.
5. **Intimação real:** enviar 1 ou 2 PDFs que ele recebeu nesta semana.
6. **Conferir o prazo:** abrir "Ver a conta do prazo", comparar com a conta dele e confirmar.
7. **Rascunho:** gerar, olhar os [CONFIRMAR], ajustar e baixar o .docx.
8. **Agenda e alertas:** Configurações → Agenda (copiar o link) e Alertas.

Deixe o advogado usar sozinho. Quando ele travar, pergunte "o que você esperava que acontecesse?" antes de explicar.

## O que dizer sobre os limites atuais

- A Tesia nunca protocola. O advogado revisa e protocola no sistema do tribunal.
- O prazo é uma sugestão até ele confirmar. As regras de prazo ainda estão em validação com advogado, por isso aparece o aviso na tela.
- Calendário: feriados nacionais e do DF. Fora do DF, o prazo pode sair errado.
- Se for o caminho (b): os e-mails de alerta ainda não estão ligados, então ele usa o painel e a agenda.
- Os termos e a política de privacidade são rascunhos em revisão.

## Problemas encontrados

| Advogado | Tela | O que aconteceu | Gravidade (alta, média, baixa) | Resolvido |
|---|---|---|---|---|
| | | | | |

Gravidade alta: prazo errado, dado de outra pessoa aparecendo, perda de texto, não conseguir entrar.

## Depois do dia

- Mandar a tabela para o Claude no Dia 35, para corrigir.
- Combinar a cobrança antes do fim dos 15 dias (pendência do Asaas em `11-decisoes.md`).
