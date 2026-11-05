create table leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  oab text not null,
  uf char(2) not null,
  area text not null,
  whatsapp text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  criado_em timestamptz not null default now()
);

alter table leads enable row level security;
