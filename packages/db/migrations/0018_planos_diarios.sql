alter table planos
  add column limite_pecas_dia int,
  add column limite_monitorados int;

create or replace function criar_escritorio_do_cadastro() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  nome_usuario text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), split_part(new.email, '@', 1));
  aceite timestamptz := case
    when (new.raw_user_meta_data ->> 'termos_aceitos')::boolean then now()
  end;
  novo_escritorio uuid;
begin
  insert into public.escritorios (nome, plano_atual)
  values (coalesce(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), 'Meu escritório'), 'pro')
  returning id into novo_escritorio;

  insert into public.usuarios (escritorio_id, auth_user_id, nome, email, papel, termos_aceitos_em)
  values (novo_escritorio, new.id, nome_usuario, new.email, 'dono', aceite);

  insert into public.assinaturas (escritorio_id, plano_codigo, status, periodo_inicio, periodo_fim)
  values (novo_escritorio, 'pro', 'trial', current_date, current_date + 11);

  return new;
end;
$$;

revoke all on function criar_escritorio_do_cadastro() from public;

create or replace function uso_pecas_atual()
returns table (usadas int, limite int)
language sql
stable
security definer
set search_path = ''
as $$
  with atual as (
    select
      public.escritorio_atual() as escritorio_id,
      (now() at time zone 'America/Sao_Paulo')::date as hoje
  )
  select
    (
      select count(*)
      from public.pecas p, atual
      where p.escritorio_id = atual.escritorio_id
        and p.status::text <> 'erro'
        and (p.criado_em at time zone 'America/Sao_Paulo')::date = atual.hoje
    )::int,
    coalesce(pl.limite_pecas_dia, (select limite_pecas_dia from public.planos where codigo = 'pro'), 7)::int
  from public.assinaturas a
  join public.planos pl on pl.codigo = a.plano_codigo
  join atual on a.escritorio_id = atual.escritorio_id;
$$;

revoke all on function uso_pecas_atual() from public, anon;
grant execute on function uso_pecas_atual() to authenticated;
