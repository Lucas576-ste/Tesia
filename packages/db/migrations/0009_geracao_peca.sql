alter type status_peca add value if not exists 'erro';

alter table pecas alter column processo_id drop not null;

create index on pecas (escritorio_id, status);
create index on pecas (intimacao_id);

create function enfileirar_geracao_peca() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.fila (escritorio_id, tipo, dados)
  values (new.escritorio_id, 'gerar_peca', jsonb_build_object('peca_id', new.id));
  return new;
end;
$$;

revoke all on function enfileirar_geracao_peca() from public, anon, authenticated;

create trigger enfileirar_geracao_peca
  after insert on pecas
  for each row
  when (new.status = 'gerando')
  execute function enfileirar_geracao_peca();

create function uso_pecas_atual()
returns table (usadas int, limite int)
language sql
stable
security definer
set search_path = ''
as $$
  with atual as (
    select
      public.escritorio_atual() as escritorio_id,
      to_char(now() at time zone 'America/Sao_Paulo', 'YYYY-MM') as competencia
  ),
  mes as (
    select u.pecas_geradas, u.pecas_extras
    from public.uso_mensal u, atual
    where u.escritorio_id = atual.escritorio_id and u.competencia = atual.competencia
  ),
  gerando as (
    select count(*) as quantidade
    from public.pecas p, atual
    where p.escritorio_id = atual.escritorio_id and p.status::text = 'gerando' and p.excluido_em is null
  )
  select
    (coalesce((select pecas_geradas from mes), 0) + (select quantidade from gerando))::int,
    (case
      when a.status = 'trial' then 5
      else coalesce(pl.limite_pecas, 100000) + coalesce((select pecas_extras from mes), 0)
    end)::int
  from public.assinaturas a
  join public.planos pl on pl.codigo = a.plano_codigo
  join atual on a.escritorio_id = atual.escritorio_id;
$$;

revoke all on function uso_pecas_atual() from public, anon;
grant execute on function uso_pecas_atual() to authenticated;
