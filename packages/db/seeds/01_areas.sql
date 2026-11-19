insert into areas (codigo, nome, ativa, ordem) values
  ('civel', 'Cível/consumidor', true, 1),
  ('trabalhista', 'Trabalhista', true, 2),
  ('previdenciario', 'Previdenciário', true, 3),
  ('familia', 'Família', true, 4),
  ('criminal', 'Criminal', true, 5),
  ('tributario', 'Tributário', true, 6),
  ('empresarial', 'Empresarial e bancário', true, 7),
  ('administrativo', 'Administrativo e servidor público', true, 8)
on conflict (codigo) do update
  set nome = excluded.nome, ativa = excluded.ativa, ordem = excluded.ordem;
