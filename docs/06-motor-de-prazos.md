# 06 — Motor de prazos

## Princípio

**A IA extrai, o código calcula, o advogado confirma.**

LLMs erram contas de data. Por isso, a IA só identifica as informações do documento. O cálculo é feito por código determinístico, testado, a partir de regras e calendários cadastrados.

## Etapas

### 1. Extração (IA)
A partir do texto da intimação, a IA devolve:
- tribunal, órgão, UF e município
- rito (comum, JEF, JEC, trabalhista, criminal)
- tipo de ato (sentença, decisão interlocutória, despacho, acórdão)
- data de disponibilização no diário (ou data da ciência, quando for intimação pelo sistema)
- resultado (procedente, improcedente, parcialmente procedente etc.)

### 2. Escolha da regra (código)
A tabela `regras_prazo` cruza **área + rito + tipo de ato + peça** e devolve:
- quantidade de dias
- tipo de contagem (úteis ou corridos)
- fundamento legal (exibido ao advogado)

Se houver mais de uma regra possível (ex.: recurso ou embargos de declaração), o sistema mostra as opções e o advogado escolhe.

### 3. Cálculo (código)
Regras gerais a implementar:

| Regra | Fundamento |
|---|---|
| A publicação é o primeiro dia útil seguinte à disponibilização no diário eletrônico | Lei 11.419/2006, art. 4º, §3º |
| O prazo começa no primeiro dia útil seguinte à publicação | Lei 11.419/2006, art. 4º, §4º |
| Processo civil: prazos em dias úteis | CPC, art. 219 |
| Juizados Especiais: prazos em dias úteis | Lei 9.099/1995, art. 12-A |
| Processo do trabalho: prazos em dias úteis | CLT, art. 775 |
| Processo penal: prazos em dias corridos | CPP, art. 798 |
| Suspensão dos prazos de 20/12 a 20/01 (processo civil) | CPC, art. 220 |
| Prazo que vence em dia sem expediente é prorrogado para o primeiro dia útil seguinte | Regra geral de contagem |

Pontos que exigem atenção e validação por advogado antes de implementar:
- Intimação eletrônica pelo próprio sistema do tribunal (ciência na consulta ou após o prazo de consulta).
- Prazo em dobro (Fazenda Pública, Defensoria, litisconsortes com procuradores diferentes em autos físicos).
- Regras próprias de cada tribunal e o recesso na Justiça do Trabalho e no processo penal.
- Indisponibilidade dos sistemas dos tribunais.

### 4. Calendário
O motor considera como dia não útil:
- sábados e domingos
- feriados nacionais (fixos e móveis, calculados a partir da Páscoa)
- feriados estaduais e municipais do local do processo
- suspensões e pontos facultativos do tribunal (tabela `suspensoes_tribunal`)
- feriados e suspensões cadastrados pelo próprio advogado

Manutenção:
- **MVP:** feriados nacionais por algoritmo + tribunais do DF (TJDFT, TRF1/SJDF, TRT10) cadastrados manualmente.
- **Depois:** um responsável atualiza os calendários dos tribunais mais usados todo ano, com a fonte (portaria) registrada.
- O advogado pode cadastrar exceções, que valem só para o escritório dele.

### 5. Memória de cálculo
Todo prazo guarda e exibe a conta completa. Exemplo:

```
Disponibilizado no DJEN: 03/11/2026 (terça)
Publicação: 04/11/2026 (primeiro dia útil seguinte)
Início da contagem: 05/11/2026
Prazo: 10 dias úteis (Lei 9.099/1995, art. 12-A)
Dias não úteis no período: sábados e domingos (o feriado de 15/11 cai num domingo)
Vencimento: 18/11/2026
```

### 6. Confirmação
- O prazo nasce com status `sugerido`.
- Só vira `confirmado` quando o advogado confirma. Só prazos confirmados geram alertas.
- O advogado pode editar a data. O sistema registra a data sugerida e a data final.

### 7. Prazo interno
- Sai do prazo fatal por código, sem IA: 2 dias úteis antes, no mesmo calendário do motor. Regras em `05-regras-de-negocio.md`.
- É uma função pura em `packages/prazos`, separada do cálculo do fatal e com testes próprios.
- Não muda o fatal nem entra na memória de cálculo. O registro de data sugerida e data final vale só para o fatal.

## Pacote `packages/prazos`

- Código puro, sem acesso a banco. Recebe regra, data e calendário e devolve vencimento e memória de cálculo.
- Interface sugerida:
  - `calcularPrazo({ dataDisponibilizacao, dias, contagem, calendario, regrasSuspensao })`
  - `proximoDiaUtil(data, calendario)`
  - `feriadosNacionais(ano)`
- **Cobertura de testes alta**, com casos reais validados por advogados: virada de ano, recesso, feriados móveis, vencimento em sexta antes de feriado, mudança de mês.

## Riscos

- Um prazo errado pode causar prejuízo grave ao advogado e ao cliente. Por isso: confirmação obrigatória, memória de cálculo visível e aviso nos termos de uso de que o advogado deve conferir.
- Toda regra nova passa por revisão de um advogado da área antes de ser ativada.
