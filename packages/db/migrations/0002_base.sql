create extension if not exists pgcrypto;
create extension if not exists vector;

create type papel_usuario as enum ('dono', 'advogado', 'estagiario');
create type rito_processo as enum ('comum', 'jef', 'jec', 'trabalhista', 'criminal', 'outro');
create type polo_processo as enum ('ativo', 'passivo');
create type status_processo as enum ('ativo', 'arquivado');
create type origem_intimacao as enum ('upload', 'djen', 'api_terceiro');
create type status_intimacao as enum ('recebida', 'processando', 'analisada', 'erro');
create type origem_prazo as enum ('intimacao', 'manual');
create type tipo_prazo as enum ('prazo', 'audiencia', 'compromisso');
create type contagem_prazo as enum ('uteis', 'corridos');
create type status_prazo as enum ('sugerido', 'confirmado', 'cumprido', 'perdido', 'descartado');
create type status_peca as enum ('gerando', 'rascunho', 'revisada', 'protocolada');
create type origem_versao as enum ('ia', 'usuario');
create type status_estilo_documento as enum ('processando', 'lido', 'erro');
create type abrangencia_feriado as enum ('nacional', 'estadual', 'municipal', 'tribunal');
create type status_assinatura as enum ('trial', 'ativa', 'inadimplente', 'cancelada');

create function definir_atualizado_em() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create table areas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  ativa boolean not null default false,
  ordem int not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table tipos_peca (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  codigo text not null,
  nome text not null,
  estrutura jsonb not null default '[]',
  instrucoes text,
  minutos_economizados int not null default 0,
  ativa boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (area, codigo)
);

create table regras_prazo (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  rito rito_processo not null,
  tipo_ato text not null,
  tipo_peca_codigo text not null,
  dias int not null check (dias > 0),
  contagem contagem_prazo not null,
  fundamento text not null,
  prioridade int not null default 1,
  ativa boolean not null default false,
  revisada_por text,
  revisada_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (area, rito, tipo_ato, tipo_peca_codigo),
  check (not ativa or revisada_em is not null)
);

create table planos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  preco_mensal numeric(10, 2) not null,
  limite_pecas int,
  limite_areas int,
  limite_usuarios int,
  limite_posts int,
  recursos jsonb not null default '{}',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table escritorios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  documento text,
  plano_atual text references planos (codigo),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table usuarios (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  nome text not null,
  email text not null,
  oab_numero text,
  oab_uf char(2),
  areas text[] not null default '{}',
  papel papel_usuario not null default 'dono',
  whatsapp text,
  modelo_docx_path text,
  calendario_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (id, escritorio_id)
);

create table clientes (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  nome text not null,
  documento text,
  contato jsonb not null default '{}',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (id, escritorio_id)
);

create table processos (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  cliente_id uuid,
  numero_cnj text not null,
  tribunal text,
  orgao text,
  uf char(2),
  municipio text,
  area text,
  rito rito_processo,
  polo polo_processo,
  parte_contraria text,
  status status_processo not null default 'ativo',
  excluido_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (escritorio_id, numero_cnj),
  unique (id, escritorio_id),
  foreign key (cliente_id, escritorio_id) references clientes (id, escritorio_id)
);

create table intimacoes (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  processo_id uuid,
  origem origem_intimacao not null default 'upload',
  arquivo_path text,
  texto text,
  data_disponibilizacao date,
  data_publicacao date,
  tipo_ato text,
  resultado text,
  extracao jsonb,
  resumo text,
  status status_intimacao not null default 'recebida',
  excluido_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (id, escritorio_id),
  foreign key (processo_id, escritorio_id) references processos (id, escritorio_id)
);

create table prazos (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  processo_id uuid,
  intimacao_id uuid,
  origem origem_prazo not null,
  tipo tipo_prazo not null default 'prazo',
  hora time,
  responsavel_id uuid,
  regra_prazo_id uuid references regras_prazo (id),
  descricao text not null,
  dias int,
  contagem contagem_prazo,
  data_inicio date,
  data_vencimento date not null,
  data_vencimento_sugerida date,
  data_prazo_interno date,
  memoria_calculo jsonb,
  confirmado_por uuid,
  confirmado_em timestamptz,
  status status_prazo not null default 'sugerido',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (id, escritorio_id),
  foreign key (processo_id, escritorio_id) references processos (id, escritorio_id),
  foreign key (intimacao_id, escritorio_id) references intimacoes (id, escritorio_id),
  foreign key (responsavel_id, escritorio_id) references usuarios (id, escritorio_id),
  foreign key (confirmado_por, escritorio_id) references usuarios (id, escritorio_id),
  check (tipo = 'prazo' or data_prazo_interno is null),
  check (data_prazo_interno is null or data_prazo_interno <= data_vencimento),
  check (data_inicio is null or data_inicio <= data_vencimento),
  check (origem = 'manual' or intimacao_id is not null)
);

create table pecas (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  processo_id uuid not null,
  intimacao_id uuid,
  prazo_id uuid,
  tipo_peca_id uuid not null references tipos_peca (id),
  responsavel_id uuid,
  titulo text not null,
  conteudo jsonb not null default '{}',
  versao int not null default 1,
  pendencias jsonb not null default '[]',
  fontes jsonb not null default '[]',
  ajustes_usados int not null default 0 check (ajustes_usados >= 0),
  status status_peca not null default 'gerando',
  excluido_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (id, escritorio_id),
  foreign key (processo_id, escritorio_id) references processos (id, escritorio_id),
  foreign key (intimacao_id, escritorio_id) references intimacoes (id, escritorio_id),
  foreign key (prazo_id, escritorio_id) references prazos (id, escritorio_id),
  foreign key (responsavel_id, escritorio_id) references usuarios (id, escritorio_id)
);

create table pecas_versoes (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  peca_id uuid not null,
  versao int not null,
  conteudo jsonb not null,
  origem origem_versao not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (peca_id, versao),
  foreign key (peca_id, escritorio_id) references pecas (id, escritorio_id) on delete cascade
);

create table estilo_documentos (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  usuario_id uuid not null,
  arquivo_path text not null,
  tipo_peca_id uuid references tipos_peca (id),
  area text,
  texto text,
  status status_estilo_documento not null default 'processando',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (id, escritorio_id),
  foreign key (usuario_id, escritorio_id) references usuarios (id, escritorio_id) on delete cascade
);

create table estilo_trechos (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  estilo_documento_id uuid not null,
  secao text not null,
  texto text not null,
  embedding vector(1024),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  foreign key (estilo_documento_id, escritorio_id)
    references estilo_documentos (id, escritorio_id) on delete cascade
);

create table perfis_estilo (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  usuario_id uuid not null unique,
  guia jsonb not null default '{}',
  resumo_exibicao text[] not null default '{}',
  atualizado_com int not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  foreign key (usuario_id, escritorio_id) references usuarios (id, escritorio_id) on delete cascade
);

create table convites (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  email text not null,
  papel papel_usuario not null default 'advogado',
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  convidado_por uuid not null,
  expira_em timestamptz not null default now() + interval '7 days',
  aceito_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  foreign key (convidado_por, escritorio_id) references usuarios (id, escritorio_id)
);

create table assinaturas (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null unique references escritorios (id) on delete cascade,
  plano_codigo text not null references planos (codigo),
  addons text[] not null default '{}',
  status status_assinatura not null default 'trial',
  asaas_customer_id text,
  asaas_subscription_id text,
  periodo_inicio date,
  periodo_fim date,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table uso_mensal (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  competencia text not null check (competencia ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  pecas_geradas int not null default 0,
  pecas_extras int not null default 0,
  posts_gerados int not null default 0,
  tokens_entrada bigint not null default 0,
  tokens_saida bigint not null default 0,
  custo_estimado numeric(12, 4) not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (escritorio_id, competencia)
);

create table uso_ia (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  job_id text,
  etapa text not null,
  modelo text not null,
  tokens_entrada int not null default 0,
  tokens_cache int not null default 0,
  tokens_saida int not null default 0,
  custo_estimado numeric(12, 6) not null default 0,
  duracao_ms int,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table auditoria (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references escritorios (id) on delete cascade,
  usuario_id uuid,
  acao text not null,
  entidade text not null,
  entidade_id uuid,
  ip inet,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table feriados (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  nome text not null,
  abrangencia abrangencia_feriado not null,
  uf char(2),
  municipio text,
  tribunal text,
  fonte text,
  escritorio_id uuid references escritorios (id) on delete cascade,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique nulls not distinct (data, abrangencia, uf, municipio, tribunal, escritorio_id)
);

create table suspensoes_tribunal (
  id uuid primary key default gen_random_uuid(),
  tribunal text not null,
  data_inicio date not null,
  data_fim date not null,
  motivo text not null,
  fonte text,
  escritorio_id uuid references escritorios (id) on delete cascade,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  check (data_inicio <= data_fim)
);

create index on usuarios (escritorio_id);
create index on clientes (escritorio_id);
create index on processos (escritorio_id) where excluido_em is null;
create index on intimacoes (escritorio_id, criado_em desc) where excluido_em is null;
create index on prazos (escritorio_id, data_vencimento) where status in ('sugerido', 'confirmado');
create index on prazos (processo_id);
create index on pecas (escritorio_id, criado_em desc) where excluido_em is null;
create index on pecas_versoes (escritorio_id);
create index on estilo_documentos (escritorio_id, usuario_id);
create index on estilo_trechos (escritorio_id);
create index on estilo_trechos using hnsw (embedding vector_cosine_ops);
create index on perfis_estilo (escritorio_id);
create index on convites (escritorio_id);
create index on uso_ia (escritorio_id, criado_em desc);
create index on auditoria (escritorio_id, criado_em desc);
create index on feriados (data);
create index on feriados (escritorio_id);
create index on suspensoes_tribunal (escritorio_id);
create index on regras_prazo (area, rito, tipo_ato) where ativa;

do $$
declare
  tabela text;
begin
  foreach tabela in array array[
    'areas', 'tipos_peca', 'regras_prazo', 'planos', 'escritorios', 'usuarios', 'clientes',
    'processos', 'intimacoes', 'prazos', 'pecas', 'pecas_versoes', 'estilo_documentos',
    'estilo_trechos', 'perfis_estilo', 'convites', 'assinaturas', 'uso_mensal', 'uso_ia',
    'auditoria', 'feriados', 'suspensoes_tribunal'
  ]
  loop
    execute format(
      'create trigger definir_atualizado_em before update on %I for each row execute function definir_atualizado_em()',
      tabela
    );
  end loop;
end;
$$;
