create type tipo_pessoa as enum ('pf', 'pj');

alter table clientes
  add column tipo_pessoa tipo_pessoa not null default 'pf',
  add column qualificacao jsonb not null default '{}',
  add column pix text check (char_length(pix) <= 140),
  add column observacoes text check (char_length(observacoes) <= 5000);
