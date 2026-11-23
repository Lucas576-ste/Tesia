create index clientes_escritorio_criado on clientes (escritorio_id, criado_em);

create function aniversaria_em(p_nascimento date, p_referencia date, p_periodo text)
returns boolean
language sql
immutable
as $$
  select case
    when p_nascimento is null then false
    when p_periodo = 'mes' then extract(month from p_nascimento) = extract(month from p_referencia)
    when p_periodo = 'hoje' then
      (
        extract(month from p_nascimento) = extract(month from p_referencia)
        and extract(day from p_nascimento) = extract(day from p_referencia)
      )
      or (
        extract(month from p_nascimento) = 2
        and extract(day from p_nascimento) = 29
        and extract(month from p_referencia) = 2
        and extract(day from p_referencia) = 28
        and extract(day from (date_trunc('year', p_referencia) + interval '2 months - 1 day')) = 28
      )
    else false
  end
$$;

drop function listar_clientes(text, text, text, papel_cliente, origem_cliente, boolean, text, text, int, int);

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
  p_tamanho int default 20,
  p_com_processo text default null,
  p_uf text default null,
  p_cidade text default null,
  p_cadastro_de date default null,
  p_cadastro_ate date default null,
  p_aniversario text default null
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
  aniversario_hoje boolean,
  total bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  with hoje as (
    select (now() at time zone 'America/Sao_Paulo')::date as dia
  ),
  base as (
    select
      c.id, c.nome, c.nome_normalizado, c.documento, c.tipo_pessoa, c.papel, c.origem,
      c.contato ->> 'email' as email,
      c.contato ->> 'telefone' as telefone,
      c.qualificacao -> 'endereco' ->> 'cidade' as cidade,
      c.qualificacao -> 'endereco' ->> 'uf' as uf,
      c.criado_em, c.excluido_em, c.data_nascimento,
      (select count(*)::int from processos p where p.cliente_id = c.id and p.excluido_em is null) as processos,
      aniversaria_em(c.data_nascimento, (select dia from hoje), 'hoje') as aniversario_hoje
    from clientes c
    where (c.excluido_em is not null) = p_excluidos
      and (p_papel is null or c.papel = p_papel)
      and (p_origem is null or c.origem = p_origem)
      and (p_uf is null or p_uf = '' or upper(c.qualificacao -> 'endereco' ->> 'uf') = upper(p_uf))
      and (p_cidade is null or p_cidade = '' or lower(c.qualificacao -> 'endereco' ->> 'cidade') = lower(p_cidade))
      and (p_cadastro_de is null or (c.criado_em at time zone 'America/Sao_Paulo')::date >= p_cadastro_de)
      and (p_cadastro_ate is null or (c.criado_em at time zone 'America/Sao_Paulo')::date <= p_cadastro_ate)
      and (p_aniversario is null or p_aniversario = '' or aniversaria_em(c.data_nascimento, (select dia from hoje), p_aniversario))
      and (
        p_com_processo is null
        or p_com_processo = ''
        or (p_com_processo = 'com' and exists (select 1 from processos p where p.cliente_id = c.id and p.excluido_em is null))
        or (p_com_processo = 'sem' and not exists (select 1 from processos p where p.cliente_id = c.id and p.excluido_em is null))
      )
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
    b.cidade, b.uf, b.criado_em, b.excluido_em, b.processos, b.aniversario_hoje,
    count(*) over () as total
  from base b
  order by
    case when p_aniversario = 'mes' then extract(day from b.data_nascimento) end asc,
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

revoke all on function listar_clientes(text, text, text, papel_cliente, origem_cliente, boolean, text, text, int, int, text, text, text, date, date, text) from public, anon;
grant execute on function listar_clientes(text, text, text, papel_cliente, origem_cliente, boolean, text, text, int, int, text, text, text, date, date, text) to authenticated;

create function metricas_clientes()
returns table (
  total int,
  novos_mes_atual int,
  novos_mes_anterior int,
  com_processo int,
  sem_processo int,
  top_origens jsonb,
  faixas_etarias jsonb,
  top_profissoes jsonb,
  ufs jsonb,
  cidades jsonb
)
language sql
stable
security invoker
set search_path = public
as $$
  with hoje as (
    select (now() at time zone 'America/Sao_Paulo')::date as dia
  ),
  ativos as (
    select
      c.id, c.origem, c.data_nascimento,
      (c.criado_em at time zone 'America/Sao_Paulo')::date as cadastro,
      nullif(btrim(c.qualificacao ->> 'profissao'), '') as profissao,
      nullif(btrim(c.qualificacao -> 'endereco' ->> 'uf'), '') as uf,
      nullif(btrim(c.qualificacao -> 'endereco' ->> 'cidade'), '') as cidade,
      exists (select 1 from processos p where p.cliente_id = c.id and p.excluido_em is null) as tem_processo
    from clientes c
    where c.excluido_em is null and c.papel = 'cliente'
  ),
  faixas as (
    select
      case
        when data_nascimento is null then 'sem_data'
        when extract(year from age((select dia from hoje), data_nascimento)) <= 25 then 'ate_25'
        when extract(year from age((select dia from hoje), data_nascimento)) <= 35 then '26_35'
        when extract(year from age((select dia from hoje), data_nascimento)) <= 50 then '36_50'
        when extract(year from age((select dia from hoje), data_nascimento)) <= 65 then '51_65'
        else '66_mais'
      end as faixa
    from ativos
  )
  select
    (select count(*)::int from ativos),
    (select count(*)::int from ativos where date_trunc('month', cadastro) = date_trunc('month', (select dia from hoje))),
    (select count(*)::int from ativos where date_trunc('month', cadastro) = date_trunc('month', (select dia from hoje)) - interval '1 month'),
    (select count(*)::int from ativos where tem_processo),
    (select count(*)::int from ativos where not tem_processo),
    coalesce((select jsonb_agg(jsonb_build_object('chave', origem, 'total', n) order by n desc, origem) from (select origem, count(*)::int n from ativos group by origem order by n desc, origem limit 5) o), '[]'::jsonb),
    coalesce((select jsonb_agg(jsonb_build_object('chave', faixa, 'total', n)) from (select faixa, count(*)::int n from faixas group by faixa) f), '[]'::jsonb),
    coalesce((select jsonb_agg(jsonb_build_object('chave', prof, 'total', n) order by n desc, prof) from (select min(profissao) prof, count(*)::int n from ativos where profissao is not null group by lower(profissao) order by n desc, min(profissao) limit 5) p), '[]'::jsonb),
    coalesce((select jsonb_agg(u order by u) from (select distinct upper(uf) u from ativos where uf is not null) x), '[]'::jsonb),
    coalesce((select jsonb_agg(c order by c) from (select min(cidade) c from ativos where cidade is not null group by lower(cidade)) y), '[]'::jsonb)
$$;

revoke all on function metricas_clientes() from public, anon;
grant execute on function metricas_clientes() to authenticated;
