insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'estilo',
  'estilo',
  false,
  20971520,
  array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy estilo_envio_proprio_escritorio on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'estilo'
    and (storage.foldername(name))[1] = public.escritorio_atual()::text
  );

create policy estilo_leitura_proprio_escritorio on storage.objects
  for select to authenticated
  using (
    bucket_id = 'estilo'
    and (storage.foldername(name))[1] = public.escritorio_atual()::text
  );

create policy estilo_exclusao_proprio_escritorio on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'estilo'
    and (storage.foldername(name))[1] = public.escritorio_atual()::text
  );

alter table estilo_documentos add column nome_arquivo text not null default '';

alter table estilo_documentos
  add constraint estilo_arquivo_na_pasta_do_escritorio
  check (arquivo_path like escritorio_id::text || '/%');

create index on estilo_documentos (escritorio_id, usuario_id);
create index on estilo_trechos (estilo_documento_id);

create function enfileirar_peca_estilo() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.fila (escritorio_id, tipo, dados)
  values (new.escritorio_id, 'processar_peca_estilo', jsonb_build_object('estilo_documento_id', new.id));
  return new;
end;
$$;

revoke all on function enfileirar_peca_estilo() from public;

create trigger enfileirar_peca_estilo
  after insert on estilo_documentos
  for each row
  when (new.status = 'processando')
  execute function enfileirar_peca_estilo();
