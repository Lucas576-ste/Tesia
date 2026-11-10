alter table usuarios add column termos_aceitos_em timestamptz;

create function criar_escritorio_do_cadastro() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  nome_usuario text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), split_part(new.email, '@', 1));
  aceite timestamptz := case
    when (new.raw_user_meta_data ->> 'termos_aceitos')::boolean then now()
  end;
  novo_escritorio uuid;
begin
  insert into public.escritorios (nome, plano_atual)
  values (coalesce(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), 'Meu escritório'), 'pro')
  returning id into novo_escritorio;

  insert into public.usuarios (escritorio_id, auth_user_id, nome, email, papel, termos_aceitos_em)
  values (novo_escritorio, new.id, nome_usuario, new.email, 'dono', aceite);

  insert into public.assinaturas (escritorio_id, plano_codigo, status, periodo_inicio, periodo_fim)
  values (novo_escritorio, 'pro', 'trial', current_date, current_date + 7);

  return new;
end;
$$;

revoke all on function criar_escritorio_do_cadastro() from public;

create trigger criar_escritorio_do_cadastro
  after insert on auth.users
  for each row execute function criar_escritorio_do_cadastro();
