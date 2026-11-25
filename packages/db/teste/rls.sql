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

insert into clientes (escritorio_id, nome, tipo_pessoa, qualificacao, pix, observacoes) values
  (current_setting('teste.esc_a')::uuid, 'Cliente de A', 'pf', '{"rg": "123"}', 'chave-a', 'nota de A');

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
  assert (select count(*) from clientes) = 0, 'B não deveria ver clientes, PIX nem qualificação de A';
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

insert into estilo_correcoes (escritorio_id, usuario_id, item_id, parte, texto_item, avaliacao, correcao)
select escritorio_id, id, 'fatos-x', 'fatos', 'Narra em ordem cronológica', 'errado', 'Começo pelo pedido'
from usuarios;

do $$
begin
  assert (select count(*) from estilo_correcoes) = 1, 'B deveria ver só a própria correção';
  insert into pedidos_dados (escritorio_id, usuario_id, tipo)
  select escritorio_id, id, 'exportacao' from usuarios;
  assert (select count(*) from pedidos_dados) = 1, 'B deveria ver só o próprio pedido de dados';

  insert into conversas_lia (escritorio_id, usuario_id)
  select escritorio_id, id from usuarios;
  insert into mensagens_lia (conversa_id, escritorio_id, papel, conteudo)
  select id, escritorio_id, 'usuario', 'Como uso a Tesia?' from conversas_lia;
  assert (select count(*) from conversas_lia) = 1, 'B deveria ver só a própria conversa da Lia';
  assert (select perguntas_lia_hoje()) = 1, 'B deveria ter 1 pergunta hoje';
  assert (select count(*) from mensagens_lia) = 1, 'B deveria ver só as próprias mensagens da Lia';
  insert into estilo_correcoes (escritorio_id, usuario_id, item_id, parte, texto_item, avaliacao)
  select current_setting('teste.esc_a')::uuid, id, 'fatos-y', 'fatos', 'x', 'certo' from usuarios;
  raise exception 'B não pode gravar correção no escritório de A';
exception
  when insufficient_privilege or foreign_key_violation then null;
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

do $$
declare
  a uuid := current_setting('teste.esc_a')::uuid;
  b uuid := current_setting('teste.esc_b')::uuid;
  id_original uuid;
  id_nova uuid;
  ativos_a int;
begin
  insert into clientes (escritorio_id, nome, nome_normalizado, documento, origem)
  values (a, 'Maria Duplicada', 'maria duplicada', '52998224725', 'indicacao')
  returning id into id_original;

  begin
    insert into clientes (escritorio_id, nome, nome_normalizado, documento)
    values (a, 'Outra Maria', 'outra maria', '52998224725');
    assert false, 'Documento repetido no mesmo escritório deveria ser bloqueado';
  exception when unique_violation then null;
  end;

  insert into clientes (escritorio_id, nome, nome_normalizado, documento)
  values (b, 'Maria do Outro', 'maria do outro', '52998224725');

  update clientes set excluido_em = now() where id = id_original;
  insert into clientes (escritorio_id, nome, nome_normalizado, documento)
  values (a, 'Maria Nova', 'maria nova', '52998224725')
  returning id into id_nova;

  begin
    update clientes set excluido_em = null where id = id_original;
    assert false, 'Restaurar um cliente com documento já usado por outro ativo deveria falhar';
  exception when unique_violation then null;
  end;

  begin
    insert into clientes (escritorio_id, nome, nome_normalizado, papel, origem)
    values (a, 'Papel torto', 'papel torto', 'parte_contraria', 'outro');
    assert false, 'Parte contrária só pode ter a origem parte contrária';
  exception when check_violation then null;
  end;

  insert into clientes (escritorio_id, nome, nome_normalizado, papel, origem, observacoes)
  values (a, 'Fulano Adverso', 'fulano adverso', 'parte_contraria', 'parte_contraria', 'parte #adversa');

  insert into clientes (escritorio_id, nome, nome_normalizado, observacoes, contato, qualificacao)
  select a, 'Lista ' || n, 'lista ' || n,
    case when n % 5 = 0 then 'veio por #indicacao' end,
    jsonb_build_object('email', 'lista' || n || '@exemplo.com'),
    jsonb_build_object('endereco', jsonb_build_object('cidade', case when n % 2 = 0 then 'Brasília' else 'Goiânia' end, 'uf', 'DF'))
  from generate_series(1, 25) n;

  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);

  select count(*) into ativos_a from clientes where excluido_em is null;
  assert (select max(total) from listar_clientes(p_tamanho => 10)) = ativos_a, 'O total da lista deveria ser o de clientes ativos';
  assert (select count(*) from listar_clientes(p_tamanho => 10, p_pagina => 1)) = 10, 'A primeira página deveria ter 10 linhas';
  assert (select count(*) from listar_clientes(p_tamanho => 10, p_pagina => 3)) = ativos_a - 20, 'A terceira página deveria ter o resto';
  assert (select count(*) from listar_clientes(p_busca => '#indicacao', p_tamanho => 50)) = 5, 'A busca por hashtag deveria achar 5';
  assert (select count(*) from listar_clientes(p_busca => '52998224725', p_digitos => '52998224725', p_tamanho => 50)) = 1, 'A busca por documento deveria achar só o cliente ativo';
  assert (select count(*) from listar_clientes(p_busca => 'lista7@exemplo', p_tamanho => 50)) = 1, 'A busca por e-mail deveria achar 1';
  assert (select count(*) from listar_clientes(p_busca => 'lista 1', p_nome_normalizado => 'lista 1', p_tamanho => 50)) = 11, 'A busca por nome deveria achar Lista 1 e Lista 10 a 19';
  assert (select count(*) from listar_clientes(p_papel => 'parte_contraria', p_tamanho => 50)) = 1, 'O filtro de papel deveria achar a parte contrária';
  assert (select count(*) from listar_clientes(p_origem => 'indicacao', p_excluidos => true, p_tamanho => 50)) = 1, 'A lista de excluídos deveria trazer o cliente excluído';
  assert (select count(*) from listar_clientes(p_excluidos => false, p_origem => 'indicacao', p_tamanho => 50)) = 0, 'Excluído não deveria aparecer na lista normal';
  assert (select cidade from listar_clientes(p_ordem => 'cidade', p_direcao => 'asc', p_busca => 'lista', p_nome_normalizado => 'lista', p_tamanho => 1)) = 'Brasília', 'A ordenação por cidade deveria começar por Brasília';

  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b1', true);
  assert (select count(*) from listar_clientes(p_busca => 'lista', p_nome_normalizado => 'lista', p_tamanho => 50)) = 0, 'B não deveria ver clientes de A na lista';
  assert (select max(total) from listar_clientes(p_tamanho => 50)) = (select count(*) from clientes where excluido_em is null), 'B deveria ver só os próprios clientes';
  reset role;
end;
$$;

do $$
declare
  a uuid := current_setting('teste.esc_a')::uuid;
  b uuid := current_setting('teste.esc_b')::uuid;
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  outro_dia date;
  id_com uuid;
  esperado_total int;
  esperado_com int;
  esperado_novos int;
  linha record;
begin
  assert aniversaria_em('2000-02-29', '2027-02-28', 'hoje'), '29/02 deveria comemorar em 28/02 de ano comum';
  assert not aniversaria_em('2000-02-29', '2028-02-28', 'hoje'), '29/02 não deveria comemorar em 28/02 de ano bissexto';
  assert aniversaria_em('2000-02-29', '2028-02-29', 'hoje'), '29/02 deveria comemorar em 29/02';
  assert aniversaria_em('2000-02-29', '2027-02-10', 'mes'), '29/02 deveria cair no mês de fevereiro';
  assert not aniversaria_em('1990-01-05', '2027-12-31', 'mes'), 'Janeiro não deveria cair em dezembro';
  assert not aniversaria_em(null, '2027-12-31', 'hoje'), 'Sem data não deveria aniversariar';

  outro_dia := make_date(
    extract(year from hoje)::int - 40,
    extract(month from hoje)::int,
    case when extract(day from hoje) = 15 then 16 else 15 end
  );

  insert into clientes (escritorio_id, nome, nome_normalizado, data_nascimento, qualificacao, criado_em)
  values
    (a, 'Metrica Hoje', 'metrica hoje', (hoje - interval '30 years')::date,
      '{"profissao":"Advogado","endereco":{"cidade":"Santos","uf":"sp"}}', now()),
    (a, 'Metrica Mes', 'metrica mes', outro_dia,
      '{"profissao":"advogado","endereco":{"cidade":"santos","uf":"SP"}}', now() - interval '45 days'),
    (a, 'Metrica Outro Mes', 'metrica outro mes', (hoje + interval '2 months' - interval '25 years')::date,
      '{"profissao":"Médica","endereco":{"cidade":"Niterói","uf":"RJ"}}', now() - interval '3 days'),
    (a, 'Metrica Sem Data', 'metrica sem data', null,
      '{"profissao":"ADVOGADO"}', now());

  insert into clientes (escritorio_id, nome, nome_normalizado, papel, origem)
  values (a, 'Metrica Testemunha', 'metrica testemunha', 'testemunha', 'outro');

  select id into id_com from clientes where escritorio_id = a and nome = 'Metrica Hoje';
  insert into processos (escritorio_id, cliente_id, numero_cnj) values (a, id_com, 'METRICA-0001');

  select count(*) into esperado_total from clientes where escritorio_id = a and excluido_em is null and papel = 'cliente';
  select count(*) into esperado_com from clientes c
    where escritorio_id = a and excluido_em is null and papel = 'cliente'
      and exists (select 1 from processos p where p.cliente_id = c.id and p.excluido_em is null);
  select count(*) into esperado_novos from clientes
    where escritorio_id = a and excluido_em is null and papel = 'cliente'
      and date_trunc('month', criado_em at time zone 'America/Sao_Paulo') = date_trunc('month', hoje);

  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);

  assert (select count(*) from listar_clientes(p_busca => 'metrica', p_nome_normalizado => 'metrica', p_com_processo => 'com', p_tamanho => 50)) = 1, 'Com processo deveria achar 1';
  assert (select count(*) from listar_clientes(p_busca => 'metrica', p_nome_normalizado => 'metrica', p_com_processo => 'sem', p_tamanho => 50)) = 4, 'Sem processo deveria achar 4';
  assert (select count(*) from listar_clientes(p_uf => 'sp', p_tamanho => 50)) = 2, 'UF sem diferenciar caixa deveria achar 2';
  assert (select count(*) from listar_clientes(p_cidade => 'SANTOS', p_tamanho => 50)) = 2, 'Cidade sem diferenciar caixa deveria achar 2';
  assert (select count(*) from listar_clientes(p_cidade => 'Niterói', p_uf => 'SP', p_tamanho => 50)) = 0, 'Cidade e UF juntas deveriam se somar';
  assert (select count(*) from listar_clientes(p_busca => 'metrica', p_nome_normalizado => 'metrica', p_cadastro_de => hoje - 10, p_tamanho => 50)) = 4, 'Cadastro recente deveria excluir o antigo';
  assert (select count(*) from listar_clientes(p_busca => 'metrica', p_nome_normalizado => 'metrica', p_cadastro_ate => hoje - 30, p_tamanho => 50)) = 1, 'Cadastro até 30 dias atrás deveria achar só o antigo';
  assert (select count(*) from listar_clientes(p_busca => 'metrica', p_nome_normalizado => 'metrica', p_cadastro_de => hoje - 50, p_cadastro_ate => hoje - 40, p_tamanho => 50)) = 1, 'O período fechado deveria achar o antigo';
  assert (select count(*) from listar_clientes(p_aniversario => 'hoje', p_busca => 'metrica', p_nome_normalizado => 'metrica', p_tamanho => 50)) = 1, 'Aniversário de hoje deveria achar 1';
  assert (select count(*) from listar_clientes(p_aniversario => 'mes', p_busca => 'metrica', p_nome_normalizado => 'metrica', p_tamanho => 50)) = 2, 'Aniversário do mês deveria achar 2';
  assert (select aniversario_hoje from listar_clientes(p_busca => 'metrica hoje', p_nome_normalizado => 'metrica hoje', p_tamanho => 5) limit 1), 'A linha deveria marcar aniversário hoje';
  assert (select nome from listar_clientes(p_aniversario => 'mes', p_busca => 'metrica', p_nome_normalizado => 'metrica', p_tamanho => 50) limit 1)
    = case when extract(day from hoje) < extract(day from outro_dia) then 'Metrica Hoje' else 'Metrica Mes' end,
    'Aniversariantes do mês deveriam vir em ordem de dia';

  select * into linha from metricas_clientes();
  assert linha.total = esperado_total, 'O total das métricas deveria bater com os clientes ativos';
  assert linha.com_processo = esperado_com, 'Com processo deveria bater';
  assert linha.com_processo + linha.sem_processo = linha.total, 'Com e sem processo deveriam somar o total';
  assert linha.novos_mes_atual = esperado_novos, 'Novos do mês deveriam bater';
  assert (select count(*) from jsonb_array_elements(linha.top_profissoes) e where lower(e ->> 'chave') = 'advogado') = 1, 'Profissões iguais com caixa diferente deveriam agrupar';
  assert (select (e ->> 'total')::int from jsonb_array_elements(linha.top_profissoes) e where lower(e ->> 'chave') = 'advogado') = 3, 'Advogado deveria somar 3';
  assert jsonb_array_length(linha.top_origens) <= 5, 'Top de origens deveria ter no máximo 5';
  assert jsonb_array_length(linha.top_profissoes) <= 5, 'Top de profissões deveria ter no máximo 5';
  assert (select (e ->> 'total')::int from jsonb_array_elements(linha.faixas_etarias) e where e ->> 'chave' = 'ate_25') >= 1, 'Faixa até 25 deveria ter ao menos 1';
  assert (select (e ->> 'total')::int from jsonb_array_elements(linha.faixas_etarias) e where e ->> 'chave' = 'sem_data') >= 1, 'Sem data deveria contar';
  assert linha.ufs ? 'SP' and linha.ufs ? 'RJ', 'As UFs deveriam vir em maiúsculas e sem repetir';
  assert (select count(*) from jsonb_array_elements_text(linha.cidades) c where lower(c) = 'santos') = 1, 'Cidades iguais com caixa diferente deveriam agrupar';

  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b1', true);
  select * into linha from metricas_clientes();
  assert linha.total = (select count(*) from clientes where escritorio_id = b and excluido_em is null and papel = 'cliente'), 'B deveria ver só as suas métricas';
  assert not (linha.ufs ? 'SP'), 'B não deveria ver UFs de A';
  assert (select count(*) from listar_clientes(p_uf => 'SP', p_tamanho => 50)) = 0, 'B não deveria achar clientes de A por UF';
  reset role;
end;
$$;

do $$
declare
  a uuid := current_setting('teste.esc_a')::uuid;
  b uuid := current_setting('teste.esc_b')::uuid;
  achados int;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);

  insert into feriados (escritorio_id, data, nome, abrangencia, tribunal)
  values (a, '2027-06-10', 'Feriado próprio para todos', 'tribunal', null),
         (a, '2027-06-11', 'Feriado próprio só do TJDFT', 'tribunal', 'TJDFT');
  insert into suspensoes_tribunal (escritorio_id, tribunal, data_inicio, data_fim, motivo)
  values (a, null, '2027-07-01', '2027-07-03', 'Suspensão própria para todos'),
         (a, 'TRT10', '2027-08-01', '2027-08-02', 'Suspensão própria só do TRT10');

  begin
    insert into feriados (escritorio_id, data, nome, abrangencia, tribunal)
    values (a, '2027-06-10', 'Duplicado', 'tribunal', null);
    assert false, 'O mesmo dia com o mesmo escopo deveria ser bloqueado';
  exception when unique_violation then null;
  end;

  begin
    insert into suspensoes_tribunal (escritorio_id, tribunal, data_inicio, data_fim, motivo)
    values (a, null, '2027-07-01', '2027-07-03', 'Duplicada');
    assert false, 'A mesma suspensão deveria ser bloqueada, mesmo sem tribunal';
  exception when unique_violation then null;
  end;

  begin
    insert into suspensoes_tribunal (escritorio_id, tribunal, data_inicio, data_fim, motivo)
    values (a, null, '2027-09-05', '2027-09-01', 'Invertida');
    assert false, 'Período com fim antes do início deveria falhar';
  exception when check_violation then null;
  end;

  begin
    insert into feriados (escritorio_id, data, nome, abrangencia)
    values (b, '2027-06-21', 'Em nome de B', 'tribunal');
    assert false, 'A não deveria gravar feriado em nome de B';
  exception when insufficient_privilege then null;
  end;

  assert (select count(*) from feriados where escritorio_id = a and data between '2027-06-01' and '2027-06-30') = 2, 'A deveria ver os seus 2 feriados';
  assert (select count(*) from suspensoes_tribunal where escritorio_id = a and data_inicio >= '2027-07-01') = 2, 'A deveria ver as suas 2 suspensões';

  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b1', true);
  assert (select count(*) from feriados where nome like 'Feriado próprio%') = 0, 'B não deveria ver feriados de A';
  assert (select count(*) from suspensoes_tribunal where motivo like 'Suspensão própria%') = 0, 'B não deveria ver suspensões de A';
  delete from feriados where nome like 'Feriado próprio%';
  delete from suspensoes_tribunal where motivo like 'Suspensão própria%';

  reset role;
  assert (select count(*) from feriados where nome like 'Feriado próprio%') = 2, 'B não deveria ter apagado feriados de A';
  assert (select count(*) from suspensoes_tribunal where motivo like 'Suspensão própria%') = 2, 'B não deveria ter apagado suspensões de A';

  select count(*) into achados from feriados
   where (escritorio_id is null or escritorio_id = a)
     and (
       (abrangencia = 'tribunal' and tribunal = 'TJDFT')
       or (abrangencia = 'estadual' and uf = 'DF')
       or (abrangencia = 'nacional')
       or (escritorio_id = a and tribunal is null)
     )
     and nome like 'Feriado próprio%';
  assert achados = 2, 'Para o TJDFT deveriam valer o feriado de todos e o do TJDFT';

  select count(*) into achados from feriados
   where (escritorio_id is null or escritorio_id = a)
     and (
       (abrangencia = 'tribunal' and tribunal = 'TRT10')
       or (abrangencia = 'nacional')
       or (escritorio_id = a and tribunal is null)
     )
     and nome like 'Feriado próprio%';
  assert achados = 1, 'Para o TRT10 deveria valer só o feriado de todos';

  select count(*) into achados from feriados
   where (escritorio_id is null or escritorio_id = a)
     and (
       (abrangencia = 'tribunal' and tribunal = null)
       or (escritorio_id = a and tribunal is null)
     )
     and nome like 'Feriado próprio%';
  assert achados = 1, 'Sem tribunal no processo deveria valer só o feriado de todos';

  select count(*) into achados from suspensoes_tribunal
   where (escritorio_id is null or escritorio_id = a)
     and (tribunal = 'TRT10' or (escritorio_id = a and tribunal is null))
     and motivo like 'Suspensão própria%';
  assert achados = 2, 'Para o TRT10 deveriam valer a suspensão de todos e a do TRT10';

  select count(*) into achados from suspensoes_tribunal
   where (escritorio_id is null or escritorio_id = a)
     and (tribunal = 'TJDFT' or (escritorio_id = a and tribunal is null))
     and motivo like 'Suspensão própria%';
  assert achados = 1, 'Para o TJDFT deveria valer só a suspensão de todos';

  select count(*) into achados from suspensoes_tribunal
   where (escritorio_id is null or escritorio_id = b)
     and (tribunal = 'TRT10' or (escritorio_id = b and tribunal is null))
     and motivo like 'Suspensão própria%';
  assert achados = 0, 'O escritório B não deveria receber suspensões de A';
end;
$$;

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000c1', 'c@exemplo.com', '{"nome": "Estagiario C"}');
update usuarios set escritorio_id = current_setting('teste.esc_a')::uuid, papel = 'estagiario'
where auth_user_id = '00000000-0000-0000-0000-0000000000c1';

reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', false);

do $$
declare
  a uuid := current_setting('teste.esc_a')::uuid;
  dono_a uuid;
  achados int;
begin
  select id into dono_a from usuarios where auth_user_id = '00000000-0000-0000-0000-0000000000a1';

  insert into termos_monitorados (escritorio_id, responsavel_id, tipo, oab_numero, oab_uf)
  values (a, dono_a, 'advogado', '12345', 'DF');
  insert into termos_monitorados (escritorio_id, responsavel_id, tipo, documento, nome)
  values (a, dono_a, 'pf', '52998224725', 'Maria da Silva');

  begin
    insert into termos_monitorados (escritorio_id, responsavel_id, tipo, oab_numero, oab_uf)
    values (a, dono_a, 'advogado', '12345', 'DF');
    assert false, 'OAB repetida no mesmo escritório deveria ser bloqueada';
  exception when unique_violation then null;
  end;

  begin
    insert into termos_monitorados (escritorio_id, tipo, documento, nome)
    values (a, 'pf', '123', 'Documento curto');
    assert false, 'CPF com tamanho errado deveria ser bloqueado';
  exception when check_violation then null;
  end;

  begin
    insert into termos_monitorados (escritorio_id, tipo, documento)
    values (a, 'pj', '11222333000181');
    assert false, 'Termo de pessoa sem nome deveria ser bloqueado';
  exception when check_violation then null;
  end;

  begin
    insert into termos_monitorados (escritorio_id, tipo, oab_numero, oab_uf)
    values (current_setting('teste.esc_b')::uuid, 'advogado', '999', 'SP');
    assert false, 'Não deveria criar termo em outro escritório';
  exception when insufficient_privilege then null;
  end;

  begin
    update termos_monitorados set oab_numero = '777' where oab_numero = '12345';
    assert false, 'Não deveria trocar a OAB de um termo';
  exception when insufficient_privilege then null;
  end;

  update termos_monitorados set status = 'inativo' where oab_numero = '12345';
  select count(*) into achados from termos_monitorados where status = 'inativo';
  assert achados = 1, 'O dono deveria pausar o termo';
end;
$$;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000c1', false);
do $$
declare
  achados int;
begin
  select count(*) into achados from termos_monitorados;
  assert achados = 2, 'O estagiário deveria ver os termos do escritório';
  begin
    insert into termos_monitorados (escritorio_id, tipo, oab_numero, oab_uf)
    values (current_setting('teste.esc_a')::uuid, 'advogado', '555', 'DF');
    assert false, 'Estagiário não deveria criar termo';
  exception when insufficient_privilege then null;
  end;
  update termos_monitorados set status = 'monitorando';
  select count(*) into achados from termos_monitorados where status = 'monitorando';
  assert achados = 0, 'Estagiário não deveria alterar termo';
end;
$$;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b1', false);
do $$
declare
  achados int;
begin
  select count(*) into achados from termos_monitorados;
  assert achados = 0, 'O escritório B não deveria ver termos de A';
  select count(*) into achados from andamentos_processo;
  assert achados = 0, 'O escritório B não deveria ver andamentos de A';
end;
$$;

reset role;
do $$
declare
  a uuid := current_setting('teste.esc_a')::uuid;
  termo uuid;
  novo uuid;
  vinculados int;
begin
  select id into termo from termos_monitorados where oab_numero = '12345';

  insert into intimacoes (escritorio_id, origem, texto, termo_id, fonte, numero_processo, hash, status)
  values (a, 'djen', 'Intimação', termo, 'diario', '07234567820268070001', 'hash-1', 'recebida');
  insert into intimacoes (escritorio_id, origem, texto, termo_id, fonte, numero_processo, hash, status)
  values (a, 'djen', 'Outra', termo, 'diario', '07234567820268070001', 'hash-1', 'recebida')
  on conflict (escritorio_id, hash) where hash is not null do nothing;
  assert (select count(*) from intimacoes where hash = 'hash-1') = 1,
    'A mesma publicação duas vezes deveria virar uma só intimação';

  insert into intimacoes (escritorio_id, origem, texto, hash, status)
  values (current_setting('teste.esc_b')::uuid, 'djen', 'Mesma publicação em outro escritório', 'hash-1', 'recebida');
  assert (select count(*) from intimacoes where hash = 'hash-1') = 2,
    'O mesmo hash em outro escritório deveria ser aceito';

  insert into andamentos_processo (escritorio_id, numero_processo, termo_id, hash, texto)
  values (a, '07234567820268070001', termo, 'hash-2', 'Processo distribuído');
  insert into andamentos_processo (escritorio_id, numero_processo, termo_id, hash, texto)
  values (a, '07234567820268070001', termo, 'hash-2', 'Processo distribuído')
  on conflict (escritorio_id, hash) do nothing;
  assert (select count(*) from andamentos_processo where hash = 'hash-2') = 1,
    'O mesmo andamento duas vezes deveria virar um só';

  insert into processos (escritorio_id, numero_cnj, area, rito)
  values (a, '0723456-78.2026.8.07.0001', 'civel', 'comum') returning id into novo;
  select count(*) into vinculados from andamentos_processo where processo_id = novo;
  assert vinculados = 1, 'Criar o processo deveria vincular os andamentos pelo CNJ';
  select count(*) into vinculados from intimacoes where processo_id = novo and escritorio_id = a;
  assert vinculados = 1, 'Criar o processo deveria vincular as intimações pelo CNJ';
  assert (select processo_id from intimacoes where escritorio_id = current_setting('teste.esc_b')::uuid and hash = 'hash-1') is null,
    'O processo de A não deveria vincular publicações de B';
end;
$$;

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', false);
do $$
declare
  dono_a uuid;
  dono_b uuid;
  nota uuid;
begin
  reset role;
  select id into dono_a from usuarios where auth_user_id = '00000000-0000-0000-0000-0000000000a1';
  select id into dono_b from usuarios where auth_user_id = '00000000-0000-0000-0000-0000000000b1';
  insert into notificacoes (escritorio_id, usuario_id, tipo, titulo)
  values (current_setting('teste.esc_a')::uuid, dono_a, 'intimacao', 'Nova intimação')
  returning id into nota;
  insert into notificacoes (escritorio_id, usuario_id, tipo, titulo)
  values (current_setting('teste.esc_b')::uuid, dono_b, 'intimacao', 'Outra');
  set role authenticated;
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', false);

  assert (select count(*) from notificacoes) = 1, 'Cada usuário deveria ver só as próprias notificações';
  update notificacoes set lida_em = now() where id = nota;
  assert (select count(*) from notificacoes where lida_em is not null) = 1, 'Deveria marcar como lida';
  begin
    update notificacoes set titulo = 'Trocado' where id = nota;
    assert false, 'Não deveria alterar o texto da notificação';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into notificacoes (escritorio_id, usuario_id, tipo, titulo)
    values (current_setting('teste.esc_a')::uuid, dono_a, 'x', 'y');
    assert false, 'Usuário não deveria criar notificação';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

select 'RLS: todos os testes passaram' as resultado;
