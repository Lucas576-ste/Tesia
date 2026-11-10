\set ON_ERROR_STOP on

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000a1', 'a@exemplo.com', '{"nome": "Advogada A", "termos_aceitos": true}'),
  ('00000000-0000-0000-0000-0000000000b1', 'b@exemplo.com', '{}');

do $$
declare
  usuario_a record;
  usuario_b record;
begin
  select u.*, e.nome as escritorio_nome into usuario_a
  from usuarios u join escritorios e on e.id = u.escritorio_id
  where u.auth_user_id = '00000000-0000-0000-0000-0000000000a1';
  select u.*, e.nome as escritorio_nome into usuario_b
  from usuarios u join escritorios e on e.id = u.escritorio_id
  where u.auth_user_id = '00000000-0000-0000-0000-0000000000b1';

  assert usuario_a.nome = 'Advogada A', 'Cadastro deveria criar o usuário com o nome';
  assert usuario_a.papel = 'dono', 'Quem cadastra deveria ser dono';
  assert usuario_a.termos_aceitos_em is not null, 'Aceite dos termos deveria ser gravado';
  assert usuario_b.nome = 'b', 'Sem nome, deveria usar o início do e-mail';
  assert usuario_b.escritorio_nome = 'Meu escritório', 'Sem nome, o escritório deveria se chamar Meu escritório';
  assert usuario_b.termos_aceitos_em is null, 'Sem aceite, a data deveria ficar vazia';
  assert usuario_a.escritorio_id <> usuario_b.escritorio_id, 'Cada cadastro deveria ter o próprio escritório';
  assert (select count(*) from assinaturas where status = 'trial' and plano_codigo = 'pro' and periodo_fim = current_date + 7) = 2,
    'Cada cadastro deveria começar com 7 dias de teste no Pro';
end;
$$;

select set_config('teste.esc_a', escritorio_id::text, false)
from usuarios where auth_user_id = '00000000-0000-0000-0000-0000000000a1';
select set_config('teste.esc_b', escritorio_id::text, false)
from usuarios where auth_user_id = '00000000-0000-0000-0000-0000000000b1';

insert into processos (id, escritorio_id, numero_cnj, area, rito) values
  ('00000000-0000-0000-0000-0000000000a3', current_setting('teste.esc_a')::uuid, '0000001-00.2026.8.07.0001', 'civel', 'jec'),
  ('00000000-0000-0000-0000-0000000000b3', current_setting('teste.esc_b')::uuid, '0000002-00.2026.8.07.0001', 'trabalhista', 'trabalhista');

insert into feriados (data, nome, abrangencia, escritorio_id) values
  ('2026-12-01', 'Feriado só do escritório B', 'municipal', current_setting('teste.esc_b')::uuid);

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', false);

do $$
declare
  linhas int;
begin
  assert (select count(*) from processos) = 1, 'A deveria ver só o próprio processo';
  assert (select count(*) from escritorios) = 1, 'A deveria ver só o próprio escritório';
  assert (select count(*) from usuarios) = 1, 'A deveria ver só usuários do próprio escritório';
  assert (select count(*) from assinaturas) = 1, 'A deveria ver só a própria assinatura';
  assert (select count(*) from feriados where escritorio_id is not null) = 0, 'A não deveria ver feriado de B';
  assert (select count(*) from feriados where tribunal = 'TRF1') = 10, 'A deveria ver os feriados do TRF1';
  assert (select count(*) from areas) = 6, 'A deveria ler as áreas';
  assert (select count(*) from regras_prazo) = 20, 'A deveria ler as regras de prazo';
  assert (select count(*) from planos) = 5, 'A deveria ler os planos';

  update processos set parte_contraria = 'invadido' where id = '00000000-0000-0000-0000-0000000000b3';
  get diagnostics linhas = row_count;
  assert linhas = 0, 'A não pode alterar processo de B';

  delete from processos where id = '00000000-0000-0000-0000-0000000000b3';
  get diagnostics linhas = row_count;
  assert linhas = 0, 'A não pode apagar processo de B';

  update assinaturas set plano_codigo = 'sociedade';
  get diagnostics linhas = row_count;
  assert linhas = 0, 'A não pode mudar a própria assinatura';

  update regras_prazo set dias = 1;
  get diagnostics linhas = row_count;
  assert linhas = 0, 'A não pode mudar regras de prazo';

  update usuarios set escritorio_id = current_setting('teste.esc_b')::uuid;
  raise exception 'A não pode se mover para o escritório B';
exception
  when insufficient_privilege then null;
end;
$$;

do $$
begin
  insert into processos (escritorio_id, numero_cnj) values (current_setting('teste.esc_b')::uuid, 'x');
  raise exception 'A não pode criar processo no escritório B';
exception
  when insufficient_privilege then null;
end;
$$;

do $$
begin
  insert into prazos (escritorio_id, processo_id, origem, descricao, data_vencimento)
  values (current_setting('teste.esc_a')::uuid, '00000000-0000-0000-0000-0000000000b3', 'manual', 'x', '2026-11-20');
  raise exception 'A não pode ligar prazo a processo de B';
exception
  when foreign_key_violation then null;
end;
$$;

do $$
begin
  insert into prazos (escritorio_id, processo_id, origem, descricao, data_vencimento, data_prazo_interno)
  values (current_setting('teste.esc_a')::uuid, '00000000-0000-0000-0000-0000000000a3', 'manual', 'x', '2026-11-20', '2026-11-23');
  raise exception 'Prazo interno depois do fatal deveria falhar';
exception
  when check_violation then null;
end;
$$;

insert into prazos (escritorio_id, processo_id, origem, descricao, data_vencimento, data_prazo_interno)
values (current_setting('teste.esc_a')::uuid, '00000000-0000-0000-0000-0000000000a3', 'manual', 'Recurso inominado', '2026-11-20', '2026-11-18');

insert into feriados (data, nome, abrangencia, escritorio_id)
values ('2026-12-02', 'Feriado só do escritório A', 'municipal', current_setting('teste.esc_a')::uuid);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b1', false);

do $$
begin
  assert (select count(*) from processos) = 1, 'B deveria ver só o próprio processo';
  assert (select count(*) from prazos) = 0, 'B não deveria ver prazos de A';
  assert (select count(*) from feriados where escritorio_id is not null) = 1, 'B deveria ver só o próprio feriado';
  assert (select parte_contraria from processos) is null, 'O processo de B não deveria ter sido alterado';
end;
$$;

reset role;
set role anon;
select set_config('request.jwt.claim.sub', '', false);

do $$
begin
  assert (select count(*) from processos) = 0, 'Anônimo não deveria ver processos';
  assert (select count(*) from areas) = 0, 'Anônimo não deveria ver áreas';
  assert (select count(*) from leads) = 0, 'Anônimo não deveria ver leads';
end;
$$;

reset role;
select 'RLS: todos os testes passaram' as resultado;
