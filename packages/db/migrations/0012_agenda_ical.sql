create function agenda_por_token(p_token text)
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
  where p.status = 'confirmado'
  order by p.data_vencimento;
$$;

revoke all on function agenda_por_token(text) from public;
grant execute on function agenda_por_token(text) to anon, authenticated;

create function gerar_novo_link_agenda() returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  novo text := substr(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), 1, 48);
begin
  update public.usuarios set calendario_token = novo where auth_user_id = auth.uid();
  if not found then
    raise exception 'Usuário não encontrado';
  end if;
  return novo;
end;
$$;

revoke all on function gerar_novo_link_agenda() from public, anon;
grant execute on function gerar_novo_link_agenda() to authenticated;

create function agenda_valida(p_token text) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.usuarios u
    join public.assinaturas a on a.escritorio_id = u.escritorio_id
    where p_token ~ '^[0-9a-f]{48}$'
      and u.calendario_token = p_token
      and (a.status = 'trial' or a.plano_codigo in ('pro', 'sociedade', 'fundador'))
  );
$$;

revoke all on function agenda_valida(text) from public;
grant execute on function agenda_valida(text) to anon, authenticated;
