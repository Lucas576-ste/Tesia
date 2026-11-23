alter table suspensoes_tribunal alter column tribunal drop not null;

alter table suspensoes_tribunal
  add constraint suspensao_global_so_do_escritorio
  check (tribunal is not null or escritorio_id is not null);

create unique index suspensoes_proprias_unicas
  on suspensoes_tribunal (escritorio_id, coalesce(tribunal, ''), data_inicio, data_fim)
  where escritorio_id is not null;
