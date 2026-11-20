create function usuario_lia_atual() returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.usuarios where auth_user_id = auth.uid()
$$;

revoke all on function usuario_lia_atual() from public, anon;
grant execute on function usuario_lia_atual() to authenticated;

create table conversas_lia (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  usuario_id uuid not null,
  titulo text not null default 'Nova conversa' check (char_length(titulo) <= 120),
  criada_em timestamptz not null default now(),
  atualizada_em timestamptz not null default now(),
  unique (id, escritorio_id),
  foreign key (usuario_id, escritorio_id) references usuarios (id, escritorio_id) on delete cascade
);

create table mensagens_lia (
  id uuid primary key default gen_random_uuid(),
  conversa_id uuid not null,
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  papel text not null check (papel in ('usuario', 'lia')),
  conteudo text not null check (char_length(conteudo) <= 8000),
  contexto_json jsonb,
  avaliacao text check (avaliacao in ('positiva', 'negativa')),
  avaliacao_comentario text check (char_length(avaliacao_comentario) <= 500),
  criada_em timestamptz not null default now(),
  foreign key (conversa_id, escritorio_id) references conversas_lia (id, escritorio_id) on delete cascade
);

create index on conversas_lia (usuario_id, atualizada_em desc);
create index on conversas_lia (criada_em);
create index on mensagens_lia (conversa_id, criada_em);
create index on mensagens_lia (escritorio_id, papel, criada_em);

alter table conversas_lia enable row level security;
alter table mensagens_lia enable row level security;

create policy proprio_usuario on conversas_lia
  for all to authenticated
  using (escritorio_id = escritorio_atual() and usuario_id = usuario_lia_atual())
  with check (escritorio_id = escritorio_atual() and usuario_id = usuario_lia_atual());

create policy proprio_usuario on mensagens_lia
  for all to authenticated
  using (
    escritorio_id = escritorio_atual()
    and exists (
      select 1 from conversas_lia c
      where c.id = conversa_id and c.escritorio_id = escritorio_id
    )
  )
  with check (
    escritorio_id = escritorio_atual()
    and exists (
      select 1 from conversas_lia c
      where c.id = conversa_id and c.escritorio_id = escritorio_id
    )
  );

revoke update on conversas_lia from authenticated;
grant update (titulo, atualizada_em) on conversas_lia to authenticated;
revoke update on mensagens_lia from authenticated;
grant update (avaliacao, avaliacao_comentario) on mensagens_lia to authenticated;

create function perguntas_lia_hoje() returns int
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::int
  from public.mensagens_lia m
  join public.conversas_lia c on c.id = m.conversa_id and c.escritorio_id = m.escritorio_id
  where m.papel = 'usuario'
    and c.usuario_id = public.usuario_lia_atual()
    and (m.criada_em at time zone 'America/Sao_Paulo')::date
      = (now() at time zone 'America/Sao_Paulo')::date
$$;

revoke all on function perguntas_lia_hoje() from public, anon;
grant execute on function perguntas_lia_hoje() to authenticated;

create function lia_apagar_antigas(p_dias int) returns int
language sql
security definer
set search_path = ''
as $$
  with apagadas as (
    delete from public.conversas_lia
    where criada_em < now() - make_interval(days => greatest(p_dias, 1))
    returning 1
  )
  select count(*)::int from apagadas
$$;

revoke all on function lia_apagar_antigas(int) from public, anon, authenticated;
