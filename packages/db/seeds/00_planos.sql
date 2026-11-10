insert into planos (codigo, nome, preco_mensal, limite_pecas, limite_areas, limite_usuarios, limite_posts, recursos) values
  ('start', 'Start', 79, 10, 1, 1, 0, '{"pacote_extra": 29, "quadro": false, "prazos_manuais": false, "pontos_atacaveis": false, "ajustes_ia": false}'),
  ('pro', 'Pro', 129, 50, null, 1, 0, '{"pacote_extra": 19, "quadro": true, "prazos_manuais": true, "pontos_atacaveis": true, "ajustes_ia": true}'),
  ('sociedade', 'Sociedade', 219, 100, null, 2, 0, '{"pacote_extra": 19, "quadro": true, "prazos_manuais": true, "pontos_atacaveis": true, "ajustes_ia": true, "equipe": true}'),
  ('fundador', 'Cliente Fundador', 79, 50, null, 1, 0, '{"pacote_extra": 19, "quadro": true, "prazos_manuais": true, "pontos_atacaveis": true, "ajustes_ia": true, "vagas": 6}'),
  ('plus', 'Plus', 49, null, null, null, 20, '{"addon": true}')
on conflict (codigo) do update
  set nome = excluded.nome,
      preco_mensal = excluded.preco_mensal,
      limite_pecas = excluded.limite_pecas,
      limite_areas = excluded.limite_areas,
      limite_usuarios = excluded.limite_usuarios,
      limite_posts = excluded.limite_posts,
      recursos = excluded.recursos;
