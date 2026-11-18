alter table processos add column partes text;

update processos p
set partes = sub.partes
from (
  select distinct on (i.processo_id)
    i.processo_id,
    nullif(
      concat_ws(
        ' x ',
        nullif((select string_agg(x ->> 'nome', ', ') from jsonb_array_elements(i.extracao -> 'dados' -> 'partes') x where x ->> 'polo' = 'ativo'), ''),
        nullif((select string_agg(x ->> 'nome', ', ') from jsonb_array_elements(i.extracao -> 'dados' -> 'partes') x where x ->> 'polo' = 'passivo'), '')
      ),
      ''
    ) as partes
  from intimacoes i
  where i.processo_id is not null and jsonb_typeof(i.extracao -> 'dados' -> 'partes') = 'array'
  order by i.processo_id, i.criado_em desc
) sub
where p.id = sub.processo_id and p.partes is null;
