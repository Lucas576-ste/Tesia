alter table prazos add column automatica boolean not null default false;

update prazos p set automatica = true
where exists (select 1 from intimacoes i where i.tarefa_id = p.id);

create or replace function agenda_por_token(p_token text)
returns table (
  prazo_id uuid,
  descricao text,
  tipo text,
  data_vencimento date,
  data_prazo_interno date,
  hora time,
  intimacao_id uuid,
  partes jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  with dono as (
    select u.escritorio_id
    from public.usuarios u
    join public.assinaturas a on a.escritorio_id = u.escritorio_id
    where p_token ~ '^[0-9a-f]{48}$'
      and u.calendario_token = p_token
      and (a.status = 'trial' or a.plano_codigo in ('pro', 'sociedade', 'fundador'))
  )
  select
    p.id,
    p.descricao,
    p.tipo::text,
    p.data_vencimento,
    p.data_prazo_interno,
    p.hora,
    p.intimacao_id,
    i.extracao -> 'dados' -> 'partes'
  from public.prazos p
  join dono on dono.escritorio_id = p.escritorio_id
  left join public.intimacoes i on i.id = p.intimacao_id and i.escritorio_id = p.escritorio_id
  where p.status = 'confirmado' and not p.automatica
  order by p.data_vencimento;
$$;
