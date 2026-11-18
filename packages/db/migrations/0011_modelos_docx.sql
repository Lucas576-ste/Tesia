insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'modelos',
  'modelos',
  false,
  5242880,
  array['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy modelos_envio_proprio_escritorio on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'modelos'
    and (storage.foldername(name))[1] = public.escritorio_atual()::text
  );

create policy modelos_atualizacao_proprio_escritorio on storage.objects
  for update to authenticated
  using (
    bucket_id = 'modelos'
    and (storage.foldername(name))[1] = public.escritorio_atual()::text
  );

create policy modelos_leitura_proprio_escritorio on storage.objects
  for select to authenticated
  using (
    bucket_id = 'modelos'
    and (storage.foldername(name))[1] = public.escritorio_atual()::text
  );

create policy modelos_exclusao_proprio_escritorio on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'modelos'
    and (storage.foldername(name))[1] = public.escritorio_atual()::text
  );

alter table usuarios
  add constraint modelo_na_pasta_do_escritorio
  check (modelo_docx_path is null or modelo_docx_path like escritorio_id::text || '/%');
