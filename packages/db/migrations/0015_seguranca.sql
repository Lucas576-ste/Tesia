revoke update on usuarios from authenticated;
grant update (nome, oab_numero, oab_uf, areas, whatsapp, modelo_docx_path, alerta_email, alerta_dias)
  on usuarios to authenticated;

create table limites_uso (
  chave text not null,
  janela timestamptz not null,
  contador int not null default 0,
  primary key (chave, janela)
);

alter table limites_uso enable row level security;
revoke all on limites_uso from anon, authenticated;

create function consumir_limite(p_chave text, p_maximo int, p_segundos int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_janela timestamptz := to_timestamp(floor(extract(epoch from now()) / p_segundos) * p_segundos);
  v_contador int;
begin
  insert into public.limites_uso (chave, janela, contador)
  values (p_chave, v_janela, 1)
  on conflict (chave, janela) do update set contador = public.limites_uso.contador + 1
  returning contador into v_contador;
  if random() < 0.01 then
    delete from public.limites_uso where janela < now() - interval '1 day';
  end if;
  return v_contador <= p_maximo;
end;
$$;

revoke all on function consumir_limite(text, int, int) from public, anon, authenticated;
grant execute on function consumir_limite(text, int, int) to service_role;
