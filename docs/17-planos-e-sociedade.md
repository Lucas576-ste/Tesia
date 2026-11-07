# 17 — Planos e Sociedade

**Status:** aplicado em 2026-11-07 nos docs e, com dados de exemplo, nas telas. Banco, alertas reais e envio de avisos ainda não existem. As regras oficiais estão em `05-regras-de-negocio.md`.

## Start x Pro

**Problema:** as funções do Pro sumiam no Start, os principais diferenciais ainda são "em breve", e Start com pacotes saía mais barato que o Pro.

| Item | Start | Pro |
|---|---|---|
| Peças por mês | 10 (R$ 7,90 por peça) | 50 (R$ 2,58 por peça) |
| Pacote de 10 peças | R$ 29 | R$ 19 |
| Áreas | 1 | Todas |
| Análise | Resumo e peça recomendada | Também pontos atacáveis e peças alternativas |
| Painel | Lista | Lista e Quadro |
| Prazos manuais e audiências | Não | Sim |
| Ajustes pela Lia | Não | Sim |
| Alertas e prazo interno | Sim | Sim |

- Com 2 pacotes, o Start chega a 30 peças por R$ 137, acima do Pro.
- As funções do Pro aparecem no Start com selo e link para o plano.
- O teste grátis de 7 dias tem recursos do Pro.
- Fora da proposta: limite de estilo por plano, porque pode piorar a primeira impressão.
- Nada que ajude a evitar perda de prazo é limitado por plano.

## Sociedade

Vale para exatamente 2 advogados. O plano Escritório está suspenso por enquanto.

**Público que orienta o desenho:** dois advogados, muitas vezes começando juntos, que dividem o trabalho e fazem cada um a sua parte. A pergunta é como combinar quem faz o quê sem nada cair entre os dois.

### Na entrada do plano
1. **Etapas por prazo:** Elaborar, Revisar (opcional) e Protocolar, cada uma com responsável. O cartão mostra de quem é a vez. Não é um kanban de tarefas.
2. **Divisão por área:** cada intimação chega com o responsável sugerido. Sem dono, fica em "Sem responsável".
3. **Rede de segurança:** prazo interno vencido sem rascunho avisa o responsável. Véspera do fatal, ainda aberto, avisa os dois.
4. **Filtros da dupla:** "Meus", "Do sócio", "Sem responsável" e "Todos".
5. **Notas internas:** em cada prazo e processo, com histórico de quem confirmou, gerou, revisou e protocolou.

Na busca automática, as duas OABs são monitoradas e a mesma intimação não aparece duas vezes.

### Depois
- Pendências simples no processo, com responsável e data
- Carga de cada um e uso de peças por pessoa, só informativo
- Ausência: passar os prazos abertos para o outro de uma vez
- Estilo comum da dupla, para quem ainda não tem peças antigas
- Revisão entre sócios com comentários e relatório por advogado

### Modelo de dados previsto
- `prazos`: `etapa_atual` (`elaborar`, `revisar`, `protocolar`), `elaborar_por`, `revisar_por` (opcional), `protocolar_por`. O `responsavel_id` é o responsável da etapa atual.
- `divisao_areas`: `escritorio_id`, `area`, `usuario_id`.
- `notas`: `escritorio_id`, `prazo_id` ou `processo_id`, `usuario_id`, `texto`.

### Regras
Estão em `05-regras-de-negocio.md`: titular, acesso, peças, saída ou separação, inadimplência e mudança de plano.

## O que está nas telas (dados de exemplo)

- **Start:** 10 peças, pacote de R$ 29, selo Pro em Quadro, prazo manual e agenda, avisos em pontos atacáveis e ajustes pela Lia.
- **Sociedade:** etapa e responsável na lista e no Quadro, ações "Concluir etapa" e "Assumir prazo", filtros da dupla, divisão por área e aviso da rede de segurança em Alertas.
- **Landing:** novos itens de Start, Pro e Sociedade.
- **Ainda não está nas telas:** notas internas, teste grátis real, convite e todos os itens de "Depois".

## A validar

- 10 peças no Start é estimativa, sem dados de uso real.
- R$ 219 pode pesar para quem está começando e empurrar a dupla para um único Pro compartilhado. Perguntar a 2 ou 3 duplas antes de lançar.
- Se as 3 etapas refletem como as duplas trabalham, e se o alerta ao sócio é útil.
- Separação da dupla: revisão jurídica, por causa de sigilo e dados de clientes.
