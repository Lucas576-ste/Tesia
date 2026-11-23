create type papel_cliente as enum ('cliente', 'parte_contraria', 'testemunha');
create type origem_cliente as enum ('indicacao', 'redes_sociais', 'google', 'parte_contraria', 'outro');

alter table clientes
  add column papel papel_cliente not null default 'cliente',
  add column origem origem_cliente not null default 'outro',
  add column data_nascimento date,
  add column genero text check (genero in ('feminino', 'masculino', 'outro', 'nao_informado')),
  add column representante_id uuid,
  add column excluido_em timestamptz,
  add constraint clientes_representante_fk
    foreign key (representante_id, escritorio_id) references clientes (id, escritorio_id)
    on delete set null (representante_id),
  add constraint clientes_representante_diferente check (representante_id is distinct from id),
  add constraint clientes_papel_origem check ((papel = 'parte_contraria') = (origem = 'parte_contraria'));

update clientes
set documento = nullif(regexp_replace(documento, '\D', '', 'g'), '')
where documento is not null;

create unique index clientes_documento_unico
  on clientes (escritorio_id, documento)
  where documento is not null and excluido_em is null;

create index clientes_escritorio_papel on clientes (escritorio_id, papel);

create function listar_clientes(
  p_busca text default '',
  p_nome_normalizado text default '',
  p_digitos text default '',
  p_papel papel_cliente default null,
  p_origem origem_cliente default null,
  p_excluidos boolean default false,
  p_ordem text default 'nome',
  p_direcao text default 'asc',
  p_pagina int default 1,
  p_tamanho int default 20
) returns table (
  id uuid,
  nome text,
  documento text,
  tipo_pessoa tipo_pessoa,
  papel papel_cliente,
  origem origem_cliente,
  email text,
  telefone text,
  cidade text,
  uf text,
  criado_em timestamptz,
  excluido_em timestamptz,
  processos int,
  total bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  with base as (
    select
      c.id, c.nome, c.nome_normalizado, c.documento, c.tipo_pessoa, c.papel, c.origem,
      c.contato ->> 'email' as email,
      c.contato ->> 'telefone' as telefone,
      c.qualificacao -> 'endereco' ->> 'cidade' as cidade,
      c.qualificacao -> 'endereco' ->> 'uf' as uf,
      c.criado_em, c.excluido_em,
      (select count(*)::int from processos p where p.cliente_id = c.id and p.excluido_em is null) as processos
    from clientes c
    where (c.excluido_em is not null) = p_excluidos
      and (p_papel is null or c.papel = p_papel)
      and (p_origem is null or c.origem = p_origem)
      and (
        coalesce(p_busca, '') = ''
        or (
          left(p_busca, 1) = '#'
          and strpos(lower(coalesce(c.observacoes, '')), lower(p_busca)) > 0
        )
        or (
          left(p_busca, 1) <> '#'
          and (
            (coalesce(p_nome_normalizado, '') <> '' and strpos(c.nome_normalizado, p_nome_normalizado) > 0)
            or (coalesce(p_digitos, '') <> '' and strpos(coalesce(c.documento, ''), p_digitos) > 0)
            or strpos(lower(coalesce(c.contato ->> 'email', '')), lower(p_busca)) > 0
          )
        )
      )
  )
  select
    b.id, b.nome, b.documento, b.tipo_pessoa, b.papel, b.origem, b.email, b.telefone,
    b.cidade, b.uf, b.criado_em, b.excluido_em, b.processos,
    count(*) over () as total
  from base b
  order by
    case when p_ordem = 'nome' and p_direcao = 'asc' then b.nome_normalizado end asc,
    case when p_ordem = 'nome' and p_direcao = 'desc' then b.nome_normalizado end desc,
    case when p_ordem = 'cidade' and p_direcao = 'asc' then b.cidade end asc,
    case when p_ordem = 'cidade' and p_direcao = 'desc' then b.cidade end desc,
    case when p_ordem = 'cadastro' and p_direcao = 'asc' then b.criado_em end asc,
    case when p_ordem = 'cadastro' and p_direcao = 'desc' then b.criado_em end desc,
    b.nome_normalizado asc,
    b.id
  limit greatest(least(p_tamanho, 100), 1)
  offset (greatest(p_pagina, 1) - 1) * greatest(least(p_tamanho, 100), 1)
$$;

revoke all on function listar_clientes(text, text, text, papel_cliente, origem_cliente, boolean, text, text, int, int) from public, anon;
grant execute on function listar_clientes(text, text, text, papel_cliente, origem_cliente, boolean, text, text, int, int) to authenticated;
