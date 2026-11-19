# 19 — Testes manuais

Rode `pnpm dev` na raiz, abra `http://localhost:3000`, teste e marque com a data.

## Conta e acesso (testado em 2026-11-12)
- [x] Criar conta com um e-mail seu e confirmar pelo link que chega no e-mail
- [x] Completar o onboarding (OAB e áreas) e cair no painel
- [x] Sair e entrar de novo
- [x] "Esqueci a senha": o e-mail chega e a troca de senha funciona
- [x] Abrir `/app` sem estar logado manda para o login
- [ ] Botão de sair visível no computador (rodapé do menu) e no celular (barra de cima)

## Envio e leitura (testado em 2026-11-12)
- [x] Enviar um PDF de intimação real do DF (TJDFT, TRF1/JEF ou TRT10)
- [x] Arquivo que não é PDF é recusado na hora
- [x] PDF escaneado (foto ou digitalização) é lido mesmo assim
- [x] Enviar 2 ou 3 PDFs de uma vez
- [x] Andamento aparece: "Na fila", "Lendo o documento", "Pronta" e o link "Ver análise"

## Estilo e rascunho (testado em 2026-11-17)
- [x] Enviar peças antigas em Meu estilo (PDF e Word) e ver "Lido"
- [x] Painel "O que aprendi sobre você" mostra frases reais do estilo
- [x] "Gerar rascunho no meu estilo" cria a peça com pontos [CONFIRMAR]
- [ ] Revisão da escrita do rascunho por um advogado (estilo, erros jurídicos e posição dos [CONFIRMAR])

## Download em .docx (testado em 2026-11-18)
- [x] Baixar a peça no modelo padrão (A4, Times 12, pendências em amarelo)
- [x] Enviar o timbrado em Configurações → Modelo e ver "Seu timbrado está ativo"
- [x] Baixar de novo com cabeçalho, rodapé e fonte do timbrado
- [x] "Remover meu timbrado" pede confirmação antes de apagar

## Agenda (testado em 2026-11-18)
- [x] Configurações → Agenda mostra o link real
- [x] Baixar o .ics e importar no Google Agenda: prazo fatal com "[Peça] · [Partes]" e link para a Tesia
- [ ] Assinar o link no Google Agenda (só depois do deploy, com endereço público)

## Processos e prazos manuais
- [ ] "Novo processo" grava e aparece na lista; número repetido é recusado
- [ ] Detalhe do processo mostra intimações, prazos e peças reais
- [ ] Painel → "Novo prazo": prazo, audiência com hora e compromisso aparecem no painel e na agenda
- [ ] "Marcar como protocolado" tira o prazo dos abertos; "Desfazer" volta

## Alertas e plano
- [ ] Configurações → Alertas: mudar e salvar; recarregar mantém
- [ ] E-mail de alerta chega com o prazo e o link "Abrir na Tesia"
- [ ] Plano e uso mostra o plano e as peças do mês reais
- [ ] Faixa amarela aos 80% e vermelha aos 100% das peças

## Análise
- [ ] Partes, número do processo e órgão estão certos
- [ ] O resumo ("O que aconteceu") está correto e sem invenção
- [ ] Os pontos atacáveis fazem sentido, e "Ver trecho" destaca o parágrafo certo
- [ ] A peça recomendada é a esperada
- [ ] "Como a intimação chegou" veio com a opção certa (diário ou portal)

## Prazo
- [ ] Conferir o prazo fatal na mão ou com um advogado ("Ver a conta do prazo")
- [ ] Portal: informar "Abri a intimação em" muda o prazo
- [ ] Portal sem abertura: a ciência fica 10 dias corridos depois do envio
- [ ] Trocar para "Citação" pede a data
- [ ] Editar a data fatal na mão pede confirmação e mostra a sugerida
- [ ] Prazo interno depois do fatal dá erro
- [ ] "Confirmo o prazo" e recarregar: continua confirmado

## Intimações e painel
- [ ] Antes de confirmar, o painel mostra "aguardando sua confirmação"
- [ ] Em "Intimações", a aba "Aguardando confirmação" lista só as pendentes
- [ ] Depois de confirmar, o aviso some e o prazo aparece no painel com os dias úteis certos
- [ ] PDF ilegível aparece como "Não foi possível ler"

## Produção
- [ ] Site publicado abre a landing com as capturas e o login funciona
- [ ] Worker no Railway mostra "worker_iniciado" nos logs e analisa uma intimação enviada pelo site publicado
- [ ] E-mail de confirmação de cadastro aponta para o endereço publicado

## Segurança
- [ ] Errar a senha 11 vezes seguidas mostra "Muitas tentativas"
- [ ] Backup: rodar o workflow no GitHub e baixar o arquivo do dia
- [ ] Uma segunda conta não vê nada da primeira
- [ ] Link de análise da primeira conta, aberto na segunda, mostra "Intimação não encontrada"

## Celular
- [ ] Abrir no celular pelo endereço "Network" do terminal e repetir envio, análise e confirmação
