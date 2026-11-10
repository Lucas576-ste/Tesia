insert into feriados (data, nome, abrangencia, uf, tribunal, fonte) values
  ('2026-04-01', 'Quarta-feira da Semana Santa', 'tribunal', 'DF', 'TRF1', 'Lei 5.010/1966, art. 62'),
  ('2026-04-02', 'Quinta-feira da Semana Santa', 'tribunal', 'DF', 'TRF1', 'Lei 5.010/1966, art. 62'),
  ('2026-08-11', 'Dia da criação dos cursos jurídicos', 'tribunal', 'DF', 'TRF1', 'Lei 5.010/1966, art. 62'),
  ('2026-11-01', 'Todos os Santos', 'tribunal', 'DF', 'TRF1', 'Lei 5.010/1966, art. 62'),
  ('2026-12-08', 'Dia da Justiça', 'tribunal', 'DF', 'TRF1', 'Lei 5.010/1966, art. 62'),
  ('2027-03-24', 'Quarta-feira da Semana Santa', 'tribunal', 'DF', 'TRF1', 'Lei 5.010/1966, art. 62'),
  ('2027-03-25', 'Quinta-feira da Semana Santa', 'tribunal', 'DF', 'TRF1', 'Lei 5.010/1966, art. 62'),
  ('2027-08-11', 'Dia da criação dos cursos jurídicos', 'tribunal', 'DF', 'TRF1', 'Lei 5.010/1966, art. 62'),
  ('2027-11-01', 'Todos os Santos', 'tribunal', 'DF', 'TRF1', 'Lei 5.010/1966, art. 62'),
  ('2027-12-08', 'Dia da Justiça', 'tribunal', 'DF', 'TRF1', 'Lei 5.010/1966, art. 62'),
  ('2026-04-01', 'Quarta-feira da Semana Santa', 'tribunal', 'DF', 'TRT10', 'Lei 5.010/1966, art. 62 (conferir no calendário do TRT10)'),
  ('2026-04-02', 'Quinta-feira da Semana Santa', 'tribunal', 'DF', 'TRT10', 'Lei 5.010/1966, art. 62 (conferir no calendário do TRT10)'),
  ('2026-08-11', 'Dia da criação dos cursos jurídicos', 'tribunal', 'DF', 'TRT10', 'Lei 5.010/1966, art. 62 (conferir no calendário do TRT10)'),
  ('2026-11-01', 'Todos os Santos', 'tribunal', 'DF', 'TRT10', 'Lei 5.010/1966, art. 62 (conferir no calendário do TRT10)'),
  ('2026-12-08', 'Dia da Justiça', 'tribunal', 'DF', 'TRT10', 'Lei 5.010/1966, art. 62 (conferir no calendário do TRT10)'),
  ('2027-03-24', 'Quarta-feira da Semana Santa', 'tribunal', 'DF', 'TRT10', 'Lei 5.010/1966, art. 62 (conferir no calendário do TRT10)'),
  ('2027-03-25', 'Quinta-feira da Semana Santa', 'tribunal', 'DF', 'TRT10', 'Lei 5.010/1966, art. 62 (conferir no calendário do TRT10)'),
  ('2027-08-11', 'Dia da criação dos cursos jurídicos', 'tribunal', 'DF', 'TRT10', 'Lei 5.010/1966, art. 62 (conferir no calendário do TRT10)'),
  ('2027-11-01', 'Todos os Santos', 'tribunal', 'DF', 'TRT10', 'Lei 5.010/1966, art. 62 (conferir no calendário do TRT10)'),
  ('2027-12-08', 'Dia da Justiça', 'tribunal', 'DF', 'TRT10', 'Lei 5.010/1966, art. 62 (conferir no calendário do TRT10)')
on conflict (data, abrangencia, uf, municipio, tribunal, escritorio_id) do update
  set nome = excluded.nome, fonte = excluded.fonte;
