alter table processos
  add column fase text,
  add column fase_origem text check (fase_origem in ('intimacao', 'djen', 'manual')),
  add column fase_atualizada_em timestamptz,
  add column encerrado_em timestamptz;

alter table clientes add column nome_normalizado text;
create index clientes_nome_normalizado on clientes (escritorio_id, nome_normalizado);

with ultima as (
  select distinct on (i.processo_id)
    i.processo_id, i.origem, i.criado_em, i.extracao -> 'dados' ->> 'tipo_ato' as ato
  from intimacoes i
  where i.processo_id is not null and i.excluido_em is null and i.status = 'analisada'
    and i.extracao -> 'dados' ->> 'tipo_ato' in ('citacao', 'contestacao', 'laudo', 'sentenca', 'recurso', 'calculos')
  order by i.processo_id, i.criado_em desc
)
update processos p
set fase = case u.ato
    when 'citacao' then 'citacao'
    when 'contestacao' then case when p.rito in ('jec', 'jef', 'trabalhista') then 'instrucao' else 'replica' end
    when 'laudo' then 'instrucao'
    when 'sentenca' then 'sentenca'
    when 'recurso' then 'recurso'
    when 'calculos' then 'cumprimento'
  end,
  fase_origem = case when u.origem = 'djen' then 'djen' else 'intimacao' end,
  fase_atualizada_em = u.criado_em
from ultima u
where p.id = u.processo_id and p.fase is null;
