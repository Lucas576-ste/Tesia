alter table intimacoes add column tratada_por uuid references usuarios (id) on delete set null;
alter table prazos add column observacoes text;

create index on intimacoes (escritorio_id, tratamento, criado_em desc) where excluido_em is null;
create index on intimacoes (escritorio_id, uf) where excluido_em is null;

create function listar_intimacoes(
  p_busca text default '',
  p_digitos text default '',
  p_uf text default null,
  p_de date default null,
  p_ate date default null,
  p_tipo text default null,
  p_termo uuid default null,
  p_tratamento tratamento_intimacao default null,
  p_aguardando boolean default false,
  p_pagina int default 1,
  p_tamanho int default 25
) returns table (
  id uuid,
  status status_intimacao,
  origem origem_intimacao,
  criado_em timestamptz,
  publicada_em date,
  tratamento tratamento_intimacao,
  concluida_em timestamptz,
  numero_processo text,
  processo_id uuid,
  tribunal text,
  uf char(2),
  tipo_publicacao text,
  termo_id uuid,
  termo_nome text,
  responsavel_id uuid,
  responsavel_nome text,
  dados jsonb,
  pecas jsonb,
  prazo_confirmado boolean,
  total bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  with base as (
    select
      i.id, i.status, i.origem, i.criado_em, i.publicada_em, i.tratamento, i.concluida_em,
      i.numero_processo, i.processo_id, i.tribunal, i.uf, i.tipo_publicacao, i.termo_id,
      coalesce(t.nome, case when t.id is not null then 'OAB ' || t.oab_numero || '/' || t.oab_uf end) as termo_nome,
      i.responsavel_id, u.nome as responsavel_nome,
      i.extracao -> 'dados' as dados, i.extracao -> 'pecas' as pecas,
      exists (
        select 1 from prazos pz
        where pz.intimacao_id = i.id and pz.status in ('confirmado', 'cumprido')
      ) as prazo_confirmado,
      coalesce(i.publicada_em, (i.criado_em at time zone 'America/Sao_Paulo')::date) as data_ref
    from intimacoes i
    left join termos_monitorados t on t.id = i.termo_id
    left join usuarios u on u.id = i.responsavel_id
    where i.excluido_em is null
      and (p_uf is null or p_uf = '' or upper(i.uf) = upper(p_uf))
      and (p_tipo is null or p_tipo = '' or i.tipo_publicacao = p_tipo)
      and (p_termo is null or i.termo_id = p_termo)
      and (p_tratamento is null or i.tratamento = p_tratamento)
      and (
        not p_aguardando
        or (
          i.status = 'analisada' and i.tratamento = 'pendente'
          and not exists (
            select 1 from prazos pz
            where pz.intimacao_id = i.id and pz.status in ('confirmado', 'cumprido')
          )
        )
      )
      and (
        coalesce(p_busca, '') = ''
        or strpos(lower(coalesce(i.texto, '')), lower(p_busca)) > 0
        or strpos(lower(coalesce((i.extracao -> 'dados' -> 'partes')::text, '')), lower(p_busca)) > 0
        or (
          coalesce(p_digitos, '') <> ''
          and (
            strpos(coalesce(i.numero_processo, ''), p_digitos) > 0
            or strpos(regexp_replace(coalesce(i.extracao -> 'dados' ->> 'numero_processo', ''), '[^0-9]', '', 'g'), p_digitos) > 0
          )
        )
      )
  ), filtrada as (
    select b.* from base b
    where (p_de is null or b.data_ref >= p_de) and (p_ate is null or b.data_ref <= p_ate)
  )
  select
    f.id, f.status, f.origem, f.criado_em, f.publicada_em, f.tratamento, f.concluida_em,
    f.numero_processo, f.processo_id, f.tribunal, f.uf, f.tipo_publicacao, f.termo_id, f.termo_nome,
    f.responsavel_id, f.responsavel_nome, f.dados, f.pecas, f.prazo_confirmado,
    count(*) over () as total
  from filtrada f
  order by f.data_ref desc, f.criado_em desc, f.id
  limit greatest(least(p_tamanho, 5000), 1)
  offset (greatest(p_pagina, 1) - 1) * greatest(least(p_tamanho, 5000), 1)
$$;

revoke all on function listar_intimacoes(text, text, text, date, date, text, uuid, tratamento_intimacao, boolean, int, int) from public, anon;
grant execute on function listar_intimacoes(text, text, text, date, date, text, uuid, tratamento_intimacao, boolean, int, int) to authenticated;
