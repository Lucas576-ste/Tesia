insert into areas (codigo, nome, ativa, ordem) values
  ('civel', 'Cível/consumidor', true, 1),
  ('trabalhista', 'Trabalhista', true, 2),
  ('previdenciario', 'Previdenciário', true, 3),
  ('familia', 'Família', true, 4),
  ('criminal', 'Criminal', false, 5),
  ('tributario', 'Tributário', false, 6)
on conflict (codigo) do update
  set nome = excluded.nome, ativa = excluded.ativa, ordem = excluded.ordem;
