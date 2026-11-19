\set ON_ERROR_STOP on

with alvo as (
  select u.escritorio_id
  from public.usuarios u
  join auth.users a on a.id = u.auth_user_id
  where lower(a.email) = lower(:'email')
),
alterada as (
  update public.assinaturas s
  set plano_codigo = 'fundador', status = 'ativa', periodo_inicio = current_date, periodo_fim = current_date + 15
  from alvo
  where s.escritorio_id = alvo.escritorio_id
  returning s.escritorio_id, s.plano_codigo, s.status, s.periodo_fim
)
select
  case when count(*) = 1 then 'Fundador ativado até ' || to_char(max(periodo_fim), 'DD/MM/YYYY')
       else 'Nenhuma conta encontrada com este e-mail' end as resultado
from alterada;
