insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('intimacoes', 'intimacoes', false, 20971520, array['application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy intimacoes_envio_proprio_escritorio on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'intimacoes'
    and (storage.foldername(name))[1] = public.escritorio_atual()::text
  );

create policy intimacoes_leitura_proprio_escritorio on storage.objects
  for select to authenticated
  using (
    bucket_id = 'intimacoes'
    and (storage.foldername(name))[1] = public.escritorio_atual()::text
  );

alter table intimacoes
  add constraint arquivo_na_pasta_do_escritorio
  check (arquivo_path is null or arquivo_path like escritorio_id::text || '/%');

create type status_fila as enum ('pendente', 'executando', 'concluida', 'falhou');

create table fila (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  tipo text not null,
  dados jsonb not null default '{}',
  status status_fila not null default 'pendente',
  tentativas int not null default 0,
  max_tentativas int not null default 3,
  disponivel_em timestamptz not null default now(),
  iniciado_em timestamptz,
  concluido_em timestamptz,
  erro text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index on fila (disponivel_em) where status = 'pendente';
create index on fila (iniciado_em) where status = 'executando';
create index on fila (escritorio_id);

create trigger definir_atualizado_em before update on fila
  for each row execute function definir_atualizado_em();

alter table fila enable row level security;
revoke all on fila from anon, authenticated;

create function enfileirar_analise_intimacao() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.fila (escritorio_id, tipo, dados)
  values (new.escritorio_id, 'analisar_intimacao', jsonb_build_object('intimacao_id', new.id));
  return new;
end;
$$;

revoke all on function enfileirar_analise_intimacao() from public;

create trigger enfileirar_analise_intimacao
  after insert on intimacoes
  for each row
  when (new.status = 'recebida')
  execute function enfileirar_analise_intimacao();
