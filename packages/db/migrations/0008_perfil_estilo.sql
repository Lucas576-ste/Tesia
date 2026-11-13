alter table perfis_estilo
  add column pedido_em timestamptz,
  add column gerado_em timestamptz;

create function enfileirar_perfil_estilo(p_escritorio uuid, p_usuario uuid) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.usuarios where id = p_usuario and escritorio_id = p_escritorio) then
    return;
  end if;

  insert into public.perfis_estilo (escritorio_id, usuario_id, pedido_em)
  values (p_escritorio, p_usuario, now())
  on conflict (usuario_id) do update set pedido_em = now();

  if not exists (
    select 1 from public.fila
    where tipo = 'gerar_perfil_estilo'
      and status = 'pendente'
      and dados ->> 'usuario_id' = p_usuario::text
  ) then
    insert into public.fila (escritorio_id, tipo, dados, disponivel_em)
    values (
      p_escritorio,
      'gerar_perfil_estilo',
      jsonb_build_object('usuario_id', p_usuario),
      now() + interval '20 seconds'
    );
  end if;
end;
$$;

revoke all on function enfileirar_perfil_estilo(uuid, uuid) from public, anon, authenticated;

create function perfil_apos_mudanca_de_peca() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.status = 'lido' then
      perform public.enfileirar_perfil_estilo(old.escritorio_id, old.usuario_id);
    end if;
    return old;
  end if;
  perform public.enfileirar_perfil_estilo(new.escritorio_id, new.usuario_id);
  return new;
end;
$$;

revoke all on function perfil_apos_mudanca_de_peca() from public, anon, authenticated;

create trigger perfil_apos_leitura
  after update of status on estilo_documentos
  for each row
  when (new.status = 'lido' and old.status is distinct from 'lido')
  execute function perfil_apos_mudanca_de_peca();

create trigger perfil_apos_remocao
  after delete on estilo_documentos
  for each row
  execute function perfil_apos_mudanca_de_peca();

create function pedir_perfil_estilo() returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  atual record;
begin
  select id, escritorio_id into atual from public.usuarios where auth_user_id = auth.uid();
  if atual.id is null then
    raise exception 'Usuário não encontrado';
  end if;
  perform public.enfileirar_perfil_estilo(atual.escritorio_id, atual.id);
end;
$$;

revoke all on function pedir_perfil_estilo() from public, anon;
grant execute on function pedir_perfil_estilo() to authenticated;
