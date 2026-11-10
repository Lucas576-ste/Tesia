create function escritorio_atual() returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select escritorio_id from public.usuarios where auth_user_id = auth.uid()
$$;

revoke all on function escritorio_atual() from public;
grant execute on function escritorio_atual() to authenticated;

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
    execute format('alter table %I enable row level security', tabela);
  end loop;

  foreach tabela in array array['areas', 'tipos_peca', 'regras_prazo', 'planos']
  loop
    execute format(
      'create policy leitura_logado on %I for select to authenticated using (true)',
      tabela
    );
  end loop;

  foreach tabela in array array[
    'clientes', 'processos', 'intimacoes', 'prazos', 'pecas', 'pecas_versoes',
    'estilo_documentos', 'estilo_trechos', 'perfis_estilo', 'convites'
  ]
  loop
    execute format(
      'create policy proprio_escritorio on %I for all to authenticated using (escritorio_id = escritorio_atual()) with check (escritorio_id = escritorio_atual())',
      tabela
    );
  end loop;

  foreach tabela in array array['usuarios', 'assinaturas', 'uso_mensal', 'uso_ia', 'auditoria']
  loop
    execute format(
      'create policy leitura_proprio_escritorio on %I for select to authenticated using (escritorio_id = escritorio_atual())',
      tabela
    );
  end loop;

  foreach tabela in array array['feriados', 'suspensoes_tribunal']
  loop
    execute format(
      'create policy leitura_global_ou_propria on %I for select to authenticated using (escritorio_id is null or escritorio_id = escritorio_atual())',
      tabela
    );
    execute format(
      'create policy escrita_propria on %I for all to authenticated using (escritorio_id = escritorio_atual()) with check (escritorio_id = escritorio_atual())',
      tabela
    );
  end loop;
end;
$$;

create policy leitura_proprio on escritorios
  for select to authenticated using (id = escritorio_atual());

create policy edicao_proprio on escritorios
  for update to authenticated using (id = escritorio_atual()) with check (id = escritorio_atual());

create policy edicao_propria on usuarios
  for update to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid() and escritorio_id = escritorio_atual());
