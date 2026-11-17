alter table pecas
  add column ajuste_pedido text,
  add column ajuste_status text check (ajuste_status in ('pendente', 'processando', 'concluido', 'erro')),
  add column ajuste_erro text;

create function enfileirar_ajuste_peca() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.fila (escritorio_id, tipo, dados)
  values (new.escritorio_id, 'ajustar_peca', jsonb_build_object('peca_id', new.id));
  return new;
end;
$$;

revoke all on function enfileirar_ajuste_peca() from public, anon, authenticated;

create trigger enfileirar_ajuste_peca
  after update of ajuste_status on pecas
  for each row
  when (new.ajuste_status = 'pendente' and old.ajuste_status is distinct from 'pendente')
  execute function enfileirar_ajuste_peca();
