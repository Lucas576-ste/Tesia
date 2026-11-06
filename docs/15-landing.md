# 15 — Landing page

## Objetivo

Levar o advogado da dor (prazo e peças) até a ação, seguindo esta ordem: **problema → custo → solução → como funciona → por que confiar → oferta → objeções → ação**.

| Momento | Ação principal (CTA) | Ação secundária |
|---|---|---|
| Lançamento (até ~10 clientes) | **Quero ser cliente fundador** (formulário) | Falar no WhatsApp |
| Produto estável | **Testar grátis por 7 dias** (cadastro) | Ver demonstração de 2 minutos |

Os textos abaixo já estão na versão de lançamento. Para trocar de fase, basta mudar os CTAs e a seção 8.

## Ajustes da implementação (2026-11-05)

Estes ajustes prevalecem sobre os textos abaixo:

- **Título do hero:** "Da intimação à peça, no seu estilo." "Nenhum prazo perdido" soa como garantia, e a Tesia não busca intimações sozinha.
- **`[CONFIRMAR]`:** a frase inteira só aparece em desenvolvimento. Em produção não é publicada ou usa um texto alternativo.
- **Também tratados como `[CONFIRMAR]`:** "30 minutos" (CTA final), "menos do que uma hora" (preços) e o cadastro de feriado pelo advogado (perguntas).
- **Preços:** "Recomendado" no lugar de "Mais escolhido", porque ainda não há clientes. Plus como "em breve".
- **Dados:** "Onde ficam os meus dados?" declara o processamento fora do Brasil, como exige `09-seguranca-e-lgpd.md`.
- **Formulário:** sem banco, simula o sucesso em desenvolvimento e avisa que as inscrições não abriram em produção. Nunca registrar dados pessoais em log. Inclui aviso de uso dos dados.
- **Contato:** WhatsApp e e-mail vêm de `NEXT_PUBLIC_WHATSAPP` e `NEXT_PUBLIC_CONTATO_EMAIL`, ocultos enquanto vazios.
- **Tabela comparativa no celular:** cartões empilhados, um por recurso, em vez de rolagem lateral.
- **Cabeçalho:** mantém "Entrar", para `/login` continuar acessível.
- **Imagens de "Como funciona":** mini telas feitas em código, com dados fictícios e legenda "Exemplo ilustrativo", no lugar dos blocos cinza. Trocar por capturas reais depois dos Dias 5 a 7.

## Ajustes de produto (2026-11-05)

Prevalecem sobre os textos abaixo:

- **Fundador:** 6 vagas só para advogados do DF, com lista de espera para os demais, 15 dias grátis com até 15 peças, depois R$ 79/mês com 50 peças, enquanto a assinatura estiver ativa.
- **Lia:** assistente de IA apresentada no hero, na seção "Conheça a Lia", nos passos e nas perguntas. Sempre identificada como inteligência artificial.
- **Planos:** recursos detalhados, itens futuros em bloco separado e plano Sociedade no lugar de Empresas, "em breve" com lista de espera até ser lançado.
- **Planos (2026-11-06):** Start só com o essencial; Pro com "Tudo do Start, mais:" (Quadro, prazos manuais e audiências, ajustes pela Lia) e os itens futuros; Sociedade com "Tudo do Pro, para 2 advogados:". São 3 cartões largos, com o Plus em faixa própria abaixo.
- **Tom:** sem ameaça sobre a OAB na seção de custo, perguntas com enunciado positivo. Ficam os avisos de responsabilidade do advogado, processamento fora do Brasil e "Exemplo ilustrativo".

## Tema (2026-11-05)

A landing segue o tema escolhido (Claro, Escuro ou Sistema). O ritmo de fundos abaixo vale para o tema claro, com fundo `#EEEDE7` e seções "branco" em `#F7F6F1`.

## Regras

- **Nunca inventar** depoimentos, números de clientes, avaliações ou estatísticas.
- Só publicar afirmações que o produto cumpre hoje. O que é futuro aparece como "em breve".
- Textos marcados com `[CONFIRMAR]` dependem de verificação antes de publicar.
- Linguagem direta, de advogado para advogado, sem exagero.

---

## Seção 1 — Hero

**Fundo:** claro. **Layout:** texto à esquerda e imagem do produto à direita.

**Título**
> Nenhum prazo perdido. Nenhuma peça do zero.

Alternativas para testar:
- Da intimação à peça, no seu estilo.
- A intimação chega. A Tesia lê, conta o prazo e escreve o rascunho do seu jeito.

**Subtítulo**
> Envie a intimação. A Tesia resume o que aconteceu, calcula o prazo mostrando a conta e escreve um rascunho com a sua estrutura, o seu tom e as suas teses. Você revisa, confirma e protocola.

**CTA principal:** Quero ser cliente fundador
**CTA secundário:** Ver como funciona (rola até a seção 4)
**Linha abaixo dos botões:** 10 vagas com 3 meses grátis. Sem cartão de crédito. `[CONFIRMAR: número de vagas]`

**Visual:** captura do produto numa moldura de navegador, mostrando a tela de análise da intimação. Sobreposto, o card "A conta do prazo, explicada" (já existe na versão atual e deve ficar). Animação curta ao carregar: PDF → card de análise → rascunho.

---

## Seção 2 — A dor

**Fundo:** azul escuro `#14262E`, texto claro.

**Título**
> Você estudou Direito para advogar, não para contar dias no calendário.

**Cards (4)**
1. **A intimação chega à noite.** Você lê a decisão inteira só para entender o que mudou e o que precisa ser feito.
2. **O prazo depende de você.** Dias úteis, feriado local, suspensão do tribunal. Você confere duas vezes e ainda fica a dúvida.
3. **A peça começa do zero.** Você abre um modelo antigo, troca nomes, adapta argumentos e perde horas no que já fez dezenas de vezes.
4. **A IA genérica não ajuda.** O texto sai com cara de robô, sem os dados do processo, e às vezes cita jurisprudência que não existe.

---

## Seção 3 — O custo

**Fundo:** azul escuro, continuação da seção 2. Texto curto e centralizado.

> Um prazo perdido não é só um processo perdido. É um cliente que não volta, uma reputação construída por anos em risco e um problema com a OAB.
>
> E cada hora escrevendo peça repetida é uma hora a menos atendendo, captando clientes ou descansando.

---

## Seção 4 — A virada e como funciona

**Fundo:** claro.

**Título**
> Agora, a intimação chega e o trabalho pesado já está feito.

**Passos (cada um com a imagem da tela correspondente, alternando texto e imagem)**

**1. Envie a intimação**
Mande o PDF da intimação ou da decisão. Uma ou várias de uma vez.
*Imagem: tela de upload.*

**2. Entenda em 30 segundos**
Resumo do que aconteceu, pontos que podem ser atacados e o prazo calculado com a conta passo a passo: publicação, início da contagem, dias úteis, feriados e vencimento. Você confere e confirma.
*Imagem: tela de análise.* `[CONFIRMAR: tempo médio real da análise]`

**3. Revise o rascunho no seu estilo**
A peça sai com a sua estrutura, o seu jeito de argumentar e os fatos do processo. O que precisa da sua atenção aparece destacado para conferir. Baixe em .docx, já no seu papel timbrado.
*Imagem: editor com pendências destacadas.*

**4. Nunca perca o controle**
Todos os prazos e audiências num painel, com aviso por e-mail antes do vencimento e direto na agenda do seu celular. `[CONFIRMAR: agenda só depois de lançada]`
*Imagem: painel de prazos.*

---

## Seção 5 — Por que é diferente

**Fundo:** claro, levemente diferente da seção anterior (ex.: branco).

**Título**
> Feita para escrever como você, não como uma máquina.

**Tabela comparativa**

| | Tesia | IA genérica | Sistemas de gestão completos |
|---|---|---|---|
| Lê a intimação e resume o que aconteceu | Sim | Só se você colar o texto | Em alguns planos |
| Calcula o prazo e mostra a conta | Sim | Não | Calcula, sem detalhar a conta |
| Escreve no seu estilo, a partir das suas peças | Sim | Não | Usa modelos prontos |
| Usa os documentos do processo | Sim | Só se você colar | Varia |
| Destaca o que precisa ser conferido | Sim | Não | Não |
| Prazos na agenda do celular (Google, Apple, Outlook) | Sim, em todos os planos | Não | Em planos mais caros |
| Plano para sociedade de 2 advogados | Sim | — | A partir dos planos de equipe |
| Taxa de ativação | Não | — | Em alguns |
| Pensada para o advogado solo | Sim | — | Pensados para escritórios |

`[CONFIRMAR: revisar a coluna "sistemas de gestão" antes de publicar; não citar nomes de concorrentes]`

**Três destaques abaixo da tabela**
- **Escreve como você.** Aprende com as suas peças antigas, não com um modelo genérico.
- **Prazo com a conta à vista.** A IA lê o documento; o cálculo é feito por regras fixas, e você vê cada etapa.
- **Nada de jurisprudência inventada sem aviso.** Toda citação aparece marcada para você conferir na fonte oficial.

---

## Seção 6 — Segurança e controle

**Fundo:** claro. Layout em 4 itens com ícone.

**Título**
> Você continua no comando.

1. **Você revisa e decide.** Nenhum prazo entra no painel sem a sua confirmação. Nenhuma peça é protocolada pela Tesia.
2. **Seus dados protegidos.** Arquivos e banco de dados armazenados no Brasil, com criptografia e acesso restrito ao seu escritório.
3. **IA sem treinar com os seus casos.** `[CONFIRMAR: termos atuais do provedor de IA]` Os documentos são usados apenas para gerar a sua análise e o seu rascunho.
4. **Seus dados são seus.** Exporte tudo quando quiser, inclusive ao cancelar.

---

## Seção 7 — Áreas atendidas

**Título**
> Para quem atua em:

Selos: Cível e consumidor · Trabalhista · Previdenciário · Família · *Criminal e tributário (em breve)*

Linha abaixo:
> Atua em outra área? Entre na lista e avisamos quando chegar.

---

## Seção 8 — Programa Cliente Fundador

**Fundo:** azul escuro com destaque dourado. Usada até existirem depoimentos reais. Depois, vira a seção de depoimentos.

**Título**
> Seja um dos 10 primeiros.

**Texto**
> Estamos abrindo a Tesia para um grupo pequeno de advogados. Quem entrar agora usa de graça por 3 meses, paga R$ 59 por mês para sempre depois disso e ajuda a decidir o que a Tesia vai fazer a seguir.

**Incluído**
- 3 meses grátis, sem cartão
- R$ 59/mês vitalício depois do período grátis (preço normal do Pro: R$ 129)
- Configuração feita junto com você
- Canal direto com o fundador

**Formulário:** nome, e-mail, número da OAB e UF, área principal, WhatsApp.
**Botão:** Quero minha vaga
**Após enviar:** "Recebemos. Vamos falar com você pelo WhatsApp em até 1 dia útil."

---

## Seção 9 — Preços

**Título**
> Menos do que uma hora do seu trabalho por mês.

Alternância: Mensal | Anual (2 meses grátis)

| | Start | Pro (destaque: "Mais escolhido") | Sociedade |
|---|---|---|---|
| Preço | R$ 79/mês | R$ 129/mês | R$ 219/mês |
| Para quem | Quem atua em uma área | Quem quer tudo, sem limite apertado | Dois advogados que dividem o escritório |
| Inclui | 15 peças por mês · 1 área · análise de intimações ilimitada · prazos, audiências e alertas por e-mail · agenda no celular · rascunho no seu estilo · .docx com timbrado | 50 peças por mês · todas as áreas · tudo do Start · busca automática de intimações (em breve) · alertas no WhatsApp (em breve) | 2 advogados · 100 peças por mês compartilhadas · tudo do Pro · estilo próprio para cada um · responsável por prazo e "Meus prazos" |
| Botão | Começar | Começar | Começar com meu sócio |

**Complemento Plus (+ R$ 49/mês):** 20 posts por mês para o Instagram, calendário de conteúdo e textos dentro das regras de publicidade da OAB. Fica abaixo dos planos, em faixa própria.

Linha abaixo: **Sem taxa de ativação.** Cancele quando quiser. Exporte seus dados a qualquer momento.

`[CONFIRMAR: mostrar o Sociedade só depois de lançado; até lá, "em breve" com lista de espera]`

No lançamento, os botões levam ao formulário de cliente fundador.

---

## Seção 10 — Perguntas frequentes

**A IA inventa jurisprudência?**
A Tesia é instruída a usar apenas os fatos dos documentos do processo e as referências que você já usa nas suas peças. Mesmo assim, toda citação aparece marcada para você conferir na fonte oficial antes de protocolar.

**Quem responde pela peça e pelo prazo?**
Você. A Tesia entrega rascunhos e sugestões de prazo. Nenhum prazo entra no painel sem a sua confirmação e nada é protocolado sem você.

**E se o prazo estiver errado?**
O cálculo é feito por regras fixas, não pela IA, e você vê a conta inteira: publicação, início, dias úteis, feriados e vencimento. Se o seu tribunal tiver um feriado ou suspensão que não está na lista, você cadastra e a conta é refeita.

**A OAB permite usar IA na advocacia?**
O Conselho Federal da OAB publicou recomendações para o uso de IA na advocacia, com foco em supervisão humana, sigilo e proteção de dados. A Tesia segue essa linha: você revisa tudo, e os dados ficam restritos ao seu escritório. `[CONFIRMAR: citar o documento oficial da OAB]`

**Vai escrever igual a mim mesmo?**
Quanto mais peças suas a Tesia conhece, mais o rascunho se parece com o seu. Com 5 a 10 peças, ela já aprende a sua estrutura, o seu tom e as suas citações preferidas. Cada peça que você revisa no sistema também ajuda.

**A Tesia busca minhas intimações sozinha?**
Ainda não. Por enquanto, você envia o PDF. A busca automática pela sua OAB está em desenvolvimento.

**Onde ficam os meus dados?**
Arquivos e banco de dados ficam no Brasil, com criptografia. Para gerar a análise e o rascunho, o texto é processado pelo provedor de IA. `[CONFIRMAR: termos de retenção e não uso para treino]`

**Tenho um sócio. Como funciona?**
No plano Sociedade, dois advogados dividem a mesma conta: cada um com o seu estilo, cada prazo com um responsável e 100 peças por mês para os dois.

**Os prazos vão para a minha agenda?**
Sim. Você assina um link no Google Agenda, Apple Calendário ou Outlook, e os prazos confirmados e as audiências aparecem lá sozinhos.

**Tem taxa de ativação?**
Não. Você paga só a mensalidade.

**Posso cancelar e levar meus dados?**
Sim. Você cancela quando quiser e pode exportar todas as peças e prazos.

---

## Seção 11 — CTA final

**Fundo:** azul escuro.

**Título**
> A próxima intimação pode levar 30 minutos, não uma noite.

**Botão:** Quero ser cliente fundador
**Abaixo:** Restam poucas vagas do programa fundador. `[CONFIRMAR: só usar se for verdade]`

---

## Seção 12 — Rodapé

- Logo e uma frase: "Tesia — da intimação à peça, no seu estilo."
- Links: Como funciona · Preços · Perguntas frequentes · Termos de uso · Privacidade
- Contato: e-mail e WhatsApp
- CNPJ e razão social `[CONFIRMAR]`
- Aviso: "A Tesia é uma ferramenta de apoio. A revisão e a responsabilidade pelas peças e prazos são do advogado."

## Elementos fixos

- **Cabeçalho fixo** ao rolar: logo, links (Como funciona, Preços, Perguntas) e o botão principal.
- **Botão flutuante de WhatsApp** no canto inferior direito.
- **No celular:** o CTA principal fica fixo na parte de baixo da tela.

---

## Visual

- **Ritmo das seções:** claro (1) → escuro (2–3) → claro (4) → branco (5) → claro (6–7) → escuro com dourado (8) → claro (9–10) → escuro (11).
- **Cores:** as do produto. Dourado `#E9C46A` só em destaques (selo "Mais escolhido", detalhes da seção 8, sublinhados).
- **Tipografia:** títulos em Source Serif 4, grandes; texto em Inter.
- **Imagens:** capturas reais das telas em moldura de navegador. Até as telas ficarem prontas, usar blocos cinza com a legenda da imagem.
- **Movimento:** entrada suave das seções ao rolar e a animação do hero. Nada de gradientes coloridos, brilhos ou efeitos chamativos.
- **Bibliotecas:** shadcn/ui (accordion, tabs, card, form), motion (Framer Motion), lucide-react, react-hook-form + zod no formulário.

## Medição

| Evento | Quando |
|---|---|
| `cta_hero_click` | Clique no CTA do hero |
| `ver_como_funciona` | Clique em "Ver como funciona" |
| `scroll_50` / `scroll_90` | Rolagem de 50% e 90% da página |
| `faq_open` | Abertura de cada pergunta (com o nome dela) |
| `preco_toggle_anual` | Alternância para anual |
| `fundador_form_start` | Primeiro campo do formulário preenchido |
| `fundador_form_submit` | Formulário enviado |
| `whatsapp_click` | Clique no botão de WhatsApp |

Ferramentas: Meta Pixel (para tráfego pago) e PostHog ou GA4. Guardar UTMs na submissão do formulário.

O formulário grava os dados numa tabela `leads` (nome, e-mail, OAB, UF, área, WhatsApp, UTMs, data) e envia um e-mail de aviso para o fundador.

---

## Prompt para o Claude Code

```
Leia docs/15-landing.md e reconstrua a landing page em apps/web na rota /, seguindo exatamente a ordem das seções, os textos, o ritmo de fundos e as regras visuais do documento. Não adicione comentários no código.

Requisitos:
- Use shadcn/ui (accordion, tabs, card, form, button, badge), lucide-react e motion para animações sutis de entrada ao rolar. Respeite prefers-reduced-motion.
- Cada seção é um componente próprio em apps/web/components/landing/.
- Cabeçalho fixo com links âncora e CTA; botão flutuante de WhatsApp; CTA fixo no rodapé da tela no celular.
- Hero com imagem do produto em moldura de navegador. Enquanto não houver capturas, use um bloco cinza com a legenda. Mantenha o card "A conta do prazo, explicada" sobreposto à imagem.
- Tabela comparativa responsiva (rolagem horizontal no celular).
- Preços com alternância mensal/anual e o Pro em destaque.
- Formulário de cliente fundador com react-hook-form + zod, gravando em uma tabela leads (crie a migration em packages/db) e mostrando a mensagem de sucesso. Enquanto o Supabase não estiver configurado, registre no console e mostre o sucesso.
- Mantenha os textos marcados com [CONFIRMAR] visíveis apenas em desenvolvimento, com destaque amarelo, e ocultos em produção.
- Eventos de medição listados no documento disparados por uma função track() única, que por enquanto só registra no console.
- Funcionar bem em 360 px de largura, sem rolagem horizontal da página.
- Contraste mínimo de 4.5:1 em todos os textos.
Ao final, rode pnpm build e corrija os erros.
```
