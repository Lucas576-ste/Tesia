alter table usuarios
  add column alerta_email boolean not null default true,
  add column alerta_dias text[] not null default '{5_uteis,2_uteis,fatal,interno}'
    check (alerta_dias <@ array['5_uteis', '2_uteis', 'fatal', 'interno']);

create table alertas_enviados (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  prazo_id uuid not null references prazos(id) on delete cascade,
  momento text not null,
  data date not null,
  enviado_em timestamptz not null default now(),
  unique (usuario_id, prazo_id, momento, data)
);

alter table alertas_enviados enable row level security;
revoke all on alertas_enviados from anon, authenticated;
