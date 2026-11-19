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
  assert (select count(*) from assinaturas where status = 'trial' and plano_codigo = 'pro' and periodo_fim = current_date + 11) = 2,
    'Cada cadastro deveria começar com 11 dias de teste no Pro';
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
  assert (select count(*) from areas) = 8, 'A deveria ler as áreas';
  assert (select count(*) from regras_prazo) = 58, 'A deveria ler as regras de prazo';
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

insert into storage.objects (bucket_id, name)
select 'intimacoes', current_setting('teste.esc_a') || '/intimacao.pdf';

do $$
begin
  insert into storage.objects (bucket_id, name)
  values ('intimacoes', current_setting('teste.esc_b') || '/invasao.pdf');
  raise exception 'A não pode enviar arquivo na pasta de B';
exception
  when insufficient_privilege then null;
end;
$$;

do $$
begin
  insert into storage.objects (bucket_id, name) values ('intimacoes', 'sem-pasta.pdf');
  raise exception 'Arquivo fora de pasta deveria ser recusado';
exception
  when insufficient_privilege then null;
end;
$$;

insert into intimacoes (escritorio_id, arquivo_path)
values (current_setting('teste.esc_a')::uuid, current_setting('teste.esc_a') || '/intimacao.pdf');

do $$
begin
  insert into intimacoes (escritorio_id, arquivo_path)
  values (current_setting('teste.esc_a')::uuid, current_setting('teste.esc_b') || '/x.pdf');
  raise exception 'Intimação não pode apontar para arquivo de outro escritório';
exception
  when check_violation then null;
end;
$$;

insert into storage.objects (bucket_id, name)
select 'estilo', current_setting('teste.esc_a') || '/u/peca.docx';

do $$
begin
  insert into storage.objects (bucket_id, name)
  values ('estilo', current_setting('teste.esc_b') || '/u/invasao.docx');
  raise exception 'A não pode enviar peça de estilo na pasta de B';
exception
  when insufficient_privilege then null;
end;
$$;

insert into storage.objects (bucket_id, name)
select 'modelos', current_setting('teste.esc_a') || '/u/modelo.docx';

do $$
begin
  insert into storage.objects (bucket_id, name)
  values ('modelos', current_setting('teste.esc_b') || '/u/modelo.docx');
  raise exception 'A não pode enviar modelo na pasta de B';
exception
  when insufficient_privilege then null;
end;
$$;

insert into estilo_documentos (escritorio_id, usuario_id, arquivo_path, nome_arquivo)
select escritorio_id, id, escritorio_id || '/u/peca.docx', 'peca.docx'
from usuarios where auth_user_id = '00000000-0000-0000-0000-0000000000a1';

do $$
begin
  insert into estilo_documentos (escritorio_id, usuario_id, arquivo_path, nome_arquivo)
  select escritorio_id, id, current_setting('teste.esc_b') || '/u/x.docx', 'x.docx'
  from usuarios where auth_user_id = '00000000-0000-0000-0000-0000000000a1';
  raise exception 'Peça de estilo não pode apontar para arquivo de outro escritório';
exception
  when check_violation then null;
end;
$$;

insert into estilo_trechos (escritorio_id, estilo_documento_id, secao, texto)
select escritorio_id, id, 'fatos', 'Trecho de teste' from estilo_documentos;

do $$
begin
  assert (select count(*) from storage.objects) = 3, 'A deveria ver só os próprios arquivos';
  perform 1 from fila;
  raise exception 'Usuário logado não pode ler a fila';
exception
  when insufficient_privilege then null;
end;
$$;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b1', false);

do $$
begin
  assert (select count(*) from processos) = 1, 'B deveria ver só o próprio processo';
  assert (select count(*) from prazos) = 0, 'B não deveria ver prazos de A';
  assert (select count(*) from feriados where escritorio_id is not null) = 1, 'B deveria ver só o próprio feriado';
  assert (select parte_contraria from processos) is null, 'O processo de B não deveria ter sido alterado';
  assert (select count(*) from estilo_documentos) = 0, 'B não deveria ver peças de estilo de A';
  assert (select count(*) from estilo_trechos) = 0, 'B não deveria ver trechos de A';
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

do $$
begin
  perform 1 from fila;
  raise exception 'Anônimo não pode ler a fila';
exception
  when insufficient_privilege then null;
end;
$$;

reset role;

do $$
begin
  assert (select count(*) from fila where tipo = 'analisar_intimacao' and status = 'pendente'
    and escritorio_id = current_setting('teste.esc_a')::uuid) = 1,
    'Intimação nova deveria criar um job na fila';
end;
$$;

do $$
begin
  assert (select count(*) from fila where tipo = 'processar_peca_estilo' and status = 'pendente'
    and escritorio_id = current_setting('teste.esc_a')::uuid) = 1,
    'Peça de estilo nova deveria criar um job na fila';
end;
$$;

update estilo_documentos set status = 'lido';
update estilo_documentos set status = 'lido', texto = 'x';

do $$
begin
  assert (select count(*) from fila where tipo = 'gerar_perfil_estilo'
    and escritorio_id = current_setting('teste.esc_a')::uuid) = 1,
    'Peça lida deveria criar um único job de perfil';
  assert (select pedido_em is not null from perfis_estilo
    where escritorio_id = current_setting('teste.esc_a')::uuid),
    'Peça lida deveria marcar o pedido do perfil';
end;
$$;

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b1', false);
select pedir_perfil_estilo();

do $$
begin
  assert (select count(*) from perfis_estilo) = 1, 'B deveria ver só o próprio perfil';
end;
$$;

do $$
begin
  perform public.enfileirar_perfil_estilo(current_setting('teste.esc_a')::uuid, '00000000-0000-0000-0000-000000000000');
  raise exception 'Usuário logado não pode chamar a função interna de enfileirar';
exception
  when insufficient_privilege then null;
end;
$$;

reset role;

do $$
begin
  assert (select count(*) from fila where tipo = 'gerar_perfil_estilo') = 2,
    'O botão de B deveria criar um job só para B';
  assert (select count(*) from fila f join usuarios u on u.id = (f.dados ->> 'usuario_id')::uuid
    where f.tipo = 'gerar_perfil_estilo' and u.auth_user_id = '00000000-0000-0000-0000-0000000000b1') = 1,
    'O job de B deveria ser do usuário B';
end;
$$;

delete from estilo_documentos;

do $$
begin
  assert (select count(*) from fila where tipo = 'gerar_perfil_estilo') = 2,
    'Remover peça lida com job pendente não deveria duplicar o job';
end;
$$;

insert into pecas (escritorio_id, tipo_peca_id, titulo, status)
select current_setting('teste.esc_a')::uuid, id, 'Apelação', 'gerando'
from tipos_peca where codigo = 'apelacao' and area = 'civel';

do $$
begin
  assert (select count(*) from fila where tipo = 'gerar_peca'
    and escritorio_id = current_setting('teste.esc_a')::uuid) = 1,
    'Peça nova deveria criar o job de geração';
end;
$$;

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', false);

do $$
declare
  uso record;
begin
  select * into uso from uso_pecas_atual();
  assert uso.usadas = 1, 'A deveria ter 1 peça em geração contada';
  assert uso.limite = 7, 'O teste grátis deveria ter limite de 7 peças por dia';
end;
$$;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b1', false);

do $$
declare
  uso record;
begin
  select * into uso from uso_pecas_atual();
  assert uso.usadas = 0, 'B não deveria contar as peças de A';
  assert (select count(*) from pecas) = 0, 'B não deveria ver as peças de A';
end;
$$;

reset role;

update pecas set status = 'rascunho' where escritorio_id = current_setting('teste.esc_a')::uuid;

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b1', false);
update pecas set ajuste_pedido = 'invasão', ajuste_status = 'pendente';

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', false);
update pecas set ajuste_pedido = 'reforce os atestados', ajuste_status = 'pendente';

reset role;

do $$
begin
  assert (select count(*) from fila where tipo = 'ajustar_peca') = 1,
    'Só o pedido de ajuste do próprio escritório deveria criar job';
  assert (select ajuste_pedido from pecas where escritorio_id = current_setting('teste.esc_a')::uuid) = 'reforce os atestados',
    'B não deveria conseguir pedir ajuste na peça de A';
end;
$$;

insert into prazos (escritorio_id, origem, descricao, data_vencimento, status)
values (current_setting('teste.esc_a')::uuid, 'manual', 'Audiência de teste', '2026-12-10', 'confirmado'),
       (current_setting('teste.esc_a')::uuid, 'manual', 'Prazo descartado', '2026-12-11', 'descartado');

set role anon;
select set_config('request.jwt.claim.sub', '', false);

do $$
declare
  token_a text;
begin
  reset role;
  select calendario_token into token_a from usuarios where auth_user_id = '00000000-0000-0000-0000-0000000000a1';
  set role anon;
  assert (select count(*) from agenda_por_token(token_a)) = 1,
    'A agenda deveria trazer só os prazos confirmados de A (teste grátis)';
  assert (select count(*) from agenda_por_token(token_a) where descricao = 'Prazo descartado') = 0,
    'Prazo descartado não deveria ir para a agenda';
  assert (select count(*) from agenda_por_token('token-invalido')) = 0, 'Token inválido não deveria trazer nada';
  assert agenda_valida(token_a), 'Token de A deveria ser válido';
  assert not agenda_valida(repeat('a', 48)), 'Token inexistente não deveria ser válido';
  assert (select count(*) from agenda_por_token(repeat('a', 48))) = 0, 'Token inexistente não deveria trazer nada';
end;
$$;

reset role;
update assinaturas set status = 'ativa', plano_codigo = 'start' where escritorio_id = current_setting('teste.esc_a')::uuid;

do $$
declare
  token_a text;
begin
  select calendario_token into token_a from usuarios where auth_user_id = '00000000-0000-0000-0000-0000000000a1';
  assert (select count(*) from agenda_por_token(token_a)) = 0, 'Plano Start não deveria ter agenda';
  assert not agenda_valida(token_a), 'Plano Start não deveria ter agenda válida';
end;
$$;

update assinaturas set status = 'trial', plano_codigo = 'pro' where escritorio_id = current_setting('teste.esc_a')::uuid;

do $$
declare
  antigo text;
  token_b text;
  novo text;
begin
  select calendario_token into antigo from usuarios where auth_user_id = '00000000-0000-0000-0000-0000000000a1';
  select calendario_token into token_b from usuarios where auth_user_id = '00000000-0000-0000-0000-0000000000b1';
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);
  novo := gerar_novo_link_agenda();
  assert novo ~ '^[0-9a-f]{48}$', 'Novo token deveria ter 48 caracteres hexadecimais';
  assert novo <> antigo, 'Novo token deveria ser diferente';
  assert (select count(*) from agenda_por_token(antigo)) = 0, 'Token antigo deveria parar de funcionar';
  assert (select count(*) from agenda_por_token(novo)) = 1, 'Token novo deveria funcionar';
  reset role;
  assert (select calendario_token from usuarios where auth_user_id = '00000000-0000-0000-0000-0000000000b1') = token_b,
    'Trocar o link de A não deveria mexer no de B';
end;
$$;

do $$
declare
  esc_original uuid;
begin
  select escritorio_id into esc_original from usuarios where auth_user_id = '00000000-0000-0000-0000-0000000000a1';
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);
  update usuarios set nome = 'Advogada A2', alerta_dias = '{fatal}' where auth_user_id = '00000000-0000-0000-0000-0000000000a1';
  begin
    update usuarios set papel = 'dono' where auth_user_id = '00000000-0000-0000-0000-0000000000a1';
    assert false, 'Usuário não deveria conseguir mudar o próprio papel';
  exception when insufficient_privilege then null;
  end;
  begin
    update usuarios set escritorio_id = current_setting('teste.esc_b')::uuid where auth_user_id = '00000000-0000-0000-0000-0000000000a1';
    assert false, 'Usuário não deveria conseguir mudar de escritório';
  exception when insufficient_privilege then null;
  end;
  begin
    update usuarios set email = 'outro@exemplo.com' where auth_user_id = '00000000-0000-0000-0000-0000000000a1';
    assert false, 'Usuário não deveria conseguir mudar o e-mail direto na tabela';
  exception when insufficient_privilege then null;
  end;
  begin
    perform consumir_limite('x', 1, 60);
    assert false, 'Usuário não deveria chamar consumir_limite';
  exception when insufficient_privilege then null;
  end;
  begin
    perform count(*) from alertas_enviados;
    assert false, 'Usuário não deveria ler alertas_enviados';
  exception when insufficient_privilege then null;
  end;
  assert (select count(*) from processos where escritorio_id = current_setting('teste.esc_b')::uuid) = 0,
    'A não deveria ver processos de B';
  reset role;
  assert (select nome from usuarios where auth_user_id = '00000000-0000-0000-0000-0000000000a1') = 'Advogada A2',
    'Usuário deveria conseguir editar o próprio nome';
  assert (select escritorio_id from usuarios where auth_user_id = '00000000-0000-0000-0000-0000000000a1') = esc_original,
    'Escritório deveria continuar o mesmo';
  assert consumir_limite('teste', 2, 60) and consumir_limite('teste', 2, 60) and not consumir_limite('teste', 2, 60),
    'O terceiro uso deveria estourar o limite de 2';
end;
$$;

do $$
begin
  assert exists (
    select 1 from regras_prazo r join tipos_peca t on t.codigo = r.tipo_peca_codigo and t.area in (r.area, 'geral')
    where r.area = 'civel' and r.rito = 'jec' and r.tipo_ato = 'sentenca' and r.tipo_peca_codigo = 'recurso_inominado' and r.prioridade = 1
  ), 'Sentença do JEC cível deveria ter recurso inominado como peça principal';
end;
$$;

\set email 'B@Exemplo.com'
\i scripts/ativar-fundador.sql

do $$
begin
  assert (select plano_codigo || '/' || status::text || '/' || (periodo_fim - current_date)::text
          from assinaturas where escritorio_id = current_setting('teste.esc_b')::uuid) = 'fundador/ativa/15',
    'O script deveria ativar o fundador por 15 dias';
  assert (select plano_codigo from assinaturas where escritorio_id = current_setting('teste.esc_a')::uuid) <> 'fundador',
    'O script não deveria mexer em outra conta';
end;
$$;

do $$
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);
  update usuarios set djen_ativo = false where auth_user_id = '00000000-0000-0000-0000-0000000000a1';
  begin
    update usuarios set djen_buscado_ate = current_date where auth_user_id = '00000000-0000-0000-0000-0000000000a1';
    assert false, 'Usuário não deveria mexer na data da busca do DJEN';
  exception when insufficient_privilege then null;
  end;
  reset role;
  assert (select not djen_ativo from usuarios where auth_user_id = '00000000-0000-0000-0000-0000000000a1'),
    'Usuário deveria conseguir desligar a busca no DJEN';
  insert into intimacoes (escritorio_id, origem, texto, djen_id) values (current_setting('teste.esc_a')::uuid, 'djen', 'x', 42);
  insert into intimacoes (escritorio_id, origem, texto, djen_id) values (current_setting('teste.esc_a')::uuid, 'djen', 'x', 42)
    on conflict (escritorio_id, djen_id) where djen_id is not null do nothing;
  assert (select count(*) from intimacoes where djen_id = 42) = 1, 'A mesma comunicação do DJEN não deveria entrar duas vezes';
end;
$$;

do $$
declare
  uso record;
begin
  update assinaturas set status = 'trial', plano_codigo = 'pro' where escritorio_id = current_setting('teste.esc_b')::uuid;
  insert into pecas (escritorio_id, tipo_peca_id, titulo, status)
  select current_setting('teste.esc_b')::uuid, (select id from tipos_peca where codigo = 'apelacao' and area = 'civel'), 'Teste ' || n, 'rascunho'
  from generate_series(1, 7) n;
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b1', true);
  select * into uso from uso_pecas_atual();
  assert uso.usadas = 7 and uso.limite = 7, 'Teste grátis deveria ter limite de 7 peças por dia, e 7 já usadas';
  reset role;
end;
$$;

select 'RLS: todos os testes passaram' as resultado;
