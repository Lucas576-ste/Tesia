alter table usuarios
  add column tribunais text[] not null default '{}';

grant update (tribunais) on usuarios to authenticated;

create table pedidos_dados (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  usuario_id uuid not null,
  tipo text not null check (tipo in ('exportacao', 'exclusao')),
  criado_em timestamptz not null default now(),
  atendido_em timestamptz,
  foreign key (usuario_id, escritorio_id) references usuarios (id, escritorio_id) on delete cascade
);

create index on pedidos_dados (escritorio_id, criado_em desc);

alter table pedidos_dados enable row level security;

create policy proprio_escritorio_leitura on pedidos_dados
  for select to authenticated
  using (escritorio_id = escritorio_atual());

create policy proprio_escritorio_envio on pedidos_dados
  for insert to authenticated
  with check (escritorio_id = escritorio_atual());

revoke update, delete on pedidos_dados from authenticated;
