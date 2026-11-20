alter table usuarios
  add column estilo_aprender_revisoes boolean not null default true;

grant update (estilo_aprender_revisoes) on usuarios to authenticated;

create table estilo_correcoes (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  usuario_id uuid not null,
  item_id text not null,
  parte text not null check (parte in ('abertura', 'fatos', 'fundamentacao', 'pedidos', 'fechamento')),
  texto_item text not null,
  avaliacao text not null check (avaliacao in ('certo', 'errado')),
  correcao text,
  criado_em timestamptz not null default now(),
  aplicada_em timestamptz,
  unique (usuario_id, item_id),
  foreign key (usuario_id, escritorio_id) references usuarios (id, escritorio_id) on delete cascade
);

create index on estilo_correcoes (escritorio_id);

alter table estilo_correcoes enable row level security;

create policy proprio_escritorio on estilo_correcoes
  for all to authenticated
  using (escritorio_id = escritorio_atual())
  with check (escritorio_id = escritorio_atual());

alter table perfis_estilo
  add column exemplo text,
  add column exemplo_pedido_em timestamptz,
  add column exemplo_gerado_em timestamptz,
  add column exemplo_erro boolean not null default false;

create function pedir_exemplo_estilo() returns void
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
  if not exists (
    select 1 from public.perfis_estilo
    where usuario_id = atual.id and guia <> '{}'::jsonb
  ) then
    return;
  end if;
  if (
    select count(*) from public.fila
    where escritorio_id = atual.escritorio_id
      and tipo = 'gerar_exemplo_estilo'
      and criado_em > now() - interval '1 hour'
  ) >= 20 then
    raise exception 'Limite de exemplos por hora atingido';
  end if;
  if exists (
    select 1 from public.fila
    where tipo = 'gerar_exemplo_estilo'
      and status in ('pendente', 'executando')
      and dados ->> 'usuario_id' = atual.id::text
  ) then
    return;
  end if;

  update public.perfis_estilo set exemplo_pedido_em = now() where usuario_id = atual.id;
  insert into public.fila (escritorio_id, tipo, dados)
  values (atual.escritorio_id, 'gerar_exemplo_estilo', jsonb_build_object('usuario_id', atual.id));
end;
$$;

revoke all on function pedir_exemplo_estilo() from public, anon;
grant execute on function pedir_exemplo_estilo() to authenticated;
