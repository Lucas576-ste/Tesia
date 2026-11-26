alter table usuarios add column busca_oab_aceita_em timestamptz;

grant update (busca_oab_aceita_em) on usuarios to authenticated;

update usuarios u set busca_oab_aceita_em = now()
where exists (
  select 1 from termos_monitorados t
  where t.tipo = 'advogado'
    and t.responsavel_id = u.id
    and t.oab_numero = ltrim(regexp_replace(u.oab_numero, '[^0-9]', '', 'g'), '0')
    and t.oab_uf = u.oab_uf
);
