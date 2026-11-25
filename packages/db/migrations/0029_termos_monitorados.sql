create type tipo_termo as enum ('advogado', 'pf', 'pj');
create type status_termo as enum ('sincronizando', 'monitorando', 'falha_autenticacao', 'inativo');
create type tratamento_intimacao as enum ('pendente', 'concluida', 'ignorada');
create type fonte_publicacao as enum ('diario', 'eletronico');

create function papel_atual() returns papel_usuario
language sql
stable
security definer
set search_path = ''
as $$
  select papel from public.usuarios where auth_user_id = auth.uid()
$$;

revoke all on function papel_atual() from public, anon;
grant execute on function papel_atual() to authenticated;

create table termos_monitorados (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  responsavel_id uuid,
  tipo tipo_termo not null,
  oab_numero text,
  oab_uf char(2),
  documento text,
  nome text,
  ufs text[] not null default '{}',
  status status_termo not null default 'sincronizando',
  ultima_sincronizacao_em timestamptz,
  ultimo_erro text,
  buscado_ate date,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (id, escritorio_id),
  foreign key (responsavel_id, escritorio_id) references usuarios (id, escritorio_id),
  check (
    (tipo = 'advogado' and oab_numero is not null and oab_uf is not null and documento is null)
    or (tipo <> 'advogado' and documento is not null and oab_numero is null and oab_uf is null
        and nome is not null)
  ),
  check (tipo <> 'pf' or documento ~ '^[0-9]{11}$'),
  check (tipo <> 'pj' or documento ~ '^[0-9]{14}$')
);

create unique index termos_oab_unico on termos_monitorados (escritorio_id, oab_numero, oab_uf)
  where tipo = 'advogado';
create unique index termos_documento_unico on termos_monitorados (escritorio_id, tipo, documento)
  where documento is not null;
create index on termos_monitorados (escritorio_id, status);

create trigger definir_atualizado_em before update on termos_monitorados
  for each row execute function definir_atualizado_em();

alter table termos_monitorados enable row level security;

create policy termos_leitura on termos_monitorados for select to authenticated
  using (escritorio_id = escritorio_atual());
create policy termos_escrita on termos_monitorados for all to authenticated
  using (escritorio_id = escritorio_atual() and papel_atual() in ('dono', 'advogado'))
  with check (escritorio_id = escritorio_atual() and papel_atual() in ('dono', 'advogado'));

revoke update on termos_monitorados from authenticated;
grant update (responsavel_id, nome, ufs, status, buscado_ate) on termos_monitorados to authenticated;

alter table intimacoes
  add column termo_id uuid references termos_monitorados (id) on delete set null,
  add column fonte fonte_publicacao,
  add column tribunal text,
  add column uf char(2),
  add column tipo_publicacao text,
  add column numero_processo text,
  add column publicada_em date,
  add column hash text,
  add column tratamento tratamento_intimacao not null default 'pendente',
  add column responsavel_id uuid references usuarios (id) on delete set null,
  add column tarefa_id uuid references prazos (id) on delete set null;

update intimacoes set tratamento = 'concluida' where concluida_em is not null;
update intimacoes set fonte = 'diario' where origem = 'djen';

create unique index intimacoes_hash_unico on intimacoes (escritorio_id, hash) where hash is not null;
create index on intimacoes (escritorio_id, numero_processo) where numero_processo is not null;

create table andamentos_processo (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  processo_id uuid,
  numero_processo text not null,
  termo_id uuid references termos_monitorados (id) on delete set null,
  djen_id bigint,
  hash text not null,
  tribunal text,
  tipo_publicacao text,
  texto text not null,
  publicada_em date,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (escritorio_id, hash),
  foreign key (processo_id, escritorio_id) references processos (id, escritorio_id)
);

create index on andamentos_processo (escritorio_id, numero_processo);
create index on andamentos_processo (processo_id, publicada_em desc) where processo_id is not null;

create trigger definir_atualizado_em before update on andamentos_processo
  for each row execute function definir_atualizado_em();

alter table andamentos_processo enable row level security;
create policy proprio_escritorio on andamentos_processo for all to authenticated
  using (escritorio_id = escritorio_atual()) with check (escritorio_id = escritorio_atual());

create function vincular_publicacoes_ao_processo() returns trigger
language plpgsql
set search_path = ''
as $$
declare
  digitos text := regexp_replace(new.numero_cnj, '[^0-9]', '', 'g');
begin
  update public.andamentos_processo set processo_id = new.id
   where escritorio_id = new.escritorio_id and processo_id is null and numero_processo = digitos;
  update public.intimacoes set processo_id = new.id
   where escritorio_id = new.escritorio_id and processo_id is null and numero_processo = digitos;
  return new;
end;
$$;

create trigger vincular_publicacoes after insert on processos
  for each row execute function vincular_publicacoes_ao_processo();

create table notificacoes (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  usuario_id uuid not null references usuarios (id) on delete cascade,
  tipo text not null,
  titulo text not null,
  texto text,
  href text,
  lida_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index on notificacoes (usuario_id, criado_em desc);
create index on notificacoes (usuario_id) where lida_em is null;

create trigger definir_atualizado_em before update on notificacoes
  for each row execute function definir_atualizado_em();

alter table notificacoes enable row level security;
create policy notificacoes_leitura on notificacoes for select to authenticated
  using (usuario_id = usuario_lia_atual());
create policy notificacoes_marcar_lida on notificacoes for update to authenticated
  using (usuario_id = usuario_lia_atual()) with check (usuario_id = usuario_lia_atual());

revoke update on notificacoes from authenticated;
grant update (lida_em) on notificacoes to authenticated;

insert into termos_monitorados (escritorio_id, responsavel_id, tipo, oab_numero, oab_uf, nome, status, buscado_ate)
select escritorio_id, id, 'advogado', ltrim(regexp_replace(oab_numero, '[^0-9]', '', 'g'), '0'), oab_uf, nome,
  'monitorando', djen_buscado_ate
from usuarios
where djen_ativo and oab_numero ~ '[1-9]' and oab_uf is not null
on conflict do nothing;
