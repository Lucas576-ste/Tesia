alter table usuarios
  add column modelo_status text
    check (modelo_status in ('processando', 'ativo', 'erro')),
  add column modelo_nome text,
  add column modelo_enviado_em timestamptz,
  add column modelo_erro text;

update usuarios
  set modelo_status = 'ativo',
      modelo_nome = 'Timbrado.docx',
      modelo_enviado_em = atualizado_em
  where modelo_docx_path is not null;

grant update (modelo_status, modelo_nome, modelo_enviado_em, modelo_erro)
  on usuarios to authenticated;
