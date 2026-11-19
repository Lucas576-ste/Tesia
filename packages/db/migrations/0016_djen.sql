alter table intimacoes add column djen_id bigint;
create unique index intimacoes_djen_unico on intimacoes (escritorio_id, djen_id) where djen_id is not null;

alter table usuarios
  add column djen_ativo boolean not null default true,
  add column djen_buscado_ate date;

grant update (djen_ativo) on usuarios to authenticated;

update usuarios set djen_ativo = false;
