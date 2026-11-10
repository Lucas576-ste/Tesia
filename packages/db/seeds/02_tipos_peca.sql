insert into tipos_peca (area, codigo, nome, estrutura, minutos_economizados) values
  ('civel', 'peticao_inicial', 'Petição inicial', '["enderecamento", "qualificacao", "sintese_fatos", "fundamentos", "pedidos", "valor_causa", "fechamento"]', 180),
  ('civel', 'contestacao', 'Contestação', '["enderecamento", "sintese_inicial", "preliminares", "merito", "pedidos", "fechamento"]', 150),
  ('civel', 'replica', 'Réplica', '["enderecamento", "sintese_contestacao", "preliminares", "merito", "pedidos", "fechamento"]', 90),
  ('civel', 'apelacao', 'Apelação', '["peticao_interposicao", "sintese", "preliminares", "razoes", "pedidos", "fechamento"]', 180),
  ('civel', 'cumprimento_sentenca', 'Cumprimento de sentença', '["enderecamento", "titulo", "calculo", "pedidos", "fechamento"]', 60),
  ('trabalhista', 'reclamacao_trabalhista', 'Reclamação trabalhista', '["enderecamento", "qualificacao", "contrato", "fatos_e_fundamentos", "pedidos", "valor_causa", "fechamento"]', 180),
  ('trabalhista', 'contestacao', 'Contestação', '["enderecamento", "sintese_inicial", "preliminares", "merito", "pedidos", "fechamento"]', 150),
  ('trabalhista', 'recurso_ordinario', 'Recurso ordinário', '["peticao_interposicao", "pressupostos", "razoes", "pedidos", "fechamento"]', 180),
  ('trabalhista', 'manifestacao_calculos', 'Manifestação sobre cálculos', '["enderecamento", "impugnacoes", "pedidos", "fechamento"]', 60),
  ('previdenciario', 'peticao_inicial', 'Petição inicial', '["enderecamento", "qualificacao", "sintese_fatos", "requisitos_beneficio", "fundamentos", "pedidos", "valor_causa", "fechamento"]', 150),
  ('previdenciario', 'recurso_inominado', 'Recurso inominado', '["peticao_interposicao", "sintese", "razoes", "pedidos", "fechamento"]', 120),
  ('previdenciario', 'manifestacao_laudo', 'Manifestação sobre laudo', '["enderecamento", "sintese_laudo", "impugnacoes", "pedidos", "fechamento"]', 60),
  ('previdenciario', 'contrarrazoes', 'Contrarrazões', '["peticao", "sintese_recurso", "razoes", "pedidos", "fechamento"]', 90),
  ('familia', 'divorcio', 'Divórcio', '["enderecamento", "qualificacao", "fatos", "bens_e_guarda", "pedidos", "fechamento"]', 120),
  ('familia', 'alimentos', 'Alimentos', '["enderecamento", "qualificacao", "necessidade_e_possibilidade", "pedidos", "fechamento"]', 120),
  ('familia', 'guarda', 'Guarda', '["enderecamento", "qualificacao", "melhor_interesse", "pedidos", "fechamento"]', 120),
  ('familia', 'contestacao', 'Contestação', '["enderecamento", "sintese_inicial", "preliminares", "merito", "pedidos", "fechamento"]', 150),
  ('geral', 'embargos_declaracao', 'Embargos de declaração', '["enderecamento", "tempestividade", "omissao_contradicao_obscuridade", "pedidos", "fechamento"]', 60),
  ('geral', 'manifestacao_simples', 'Manifestação simples', '["enderecamento", "manifestacao", "fechamento"]', 30)
on conflict (area, codigo) do update
  set nome = excluded.nome,
      estrutura = excluded.estrutura,
      minutos_economizados = excluded.minutos_economizados;
