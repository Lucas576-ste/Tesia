import type pg from "pg";
import { z } from "zod";
import { buscarComunicacoes, FormatoDjenMudou } from "./cliente";
import { eDoAdvogado, paraIntimacao } from "./filtrar";

type Configuracao = {
  registrar: (evento: string, dados: Record<string, unknown>) => void;
  avisarErro: (erro: unknown) => void;
  buscar?: typeof fetch;
  esperar?: (ms: number) => Promise<void>;
};

const advogadoSchema = z.object({
  usuario_id: z.uuid(),
  escritorio_id: z.uuid(),
  oab_numero: z.string(),
  oab_uf: z.string(),
  inicio: z.string(),
});

export async function importarDjen(db: pg.Pool, config: Configuracao, hoje: string) {
  const { rows } = await db.query(
    `select u.id as usuario_id, u.escritorio_id, u.oab_numero, u.oab_uf,
       to_char(greatest(coalesce(u.djen_buscado_ate - 1, $1::date - 7), $1::date - 30), 'YYYY-MM-DD') as inicio
     from usuarios u
     join assinaturas a on a.escritorio_id = u.escritorio_id
     where u.djen_ativo and u.oab_numero is not null and u.oab_uf is not null
       and a.status in ('trial', 'ativa')
       and (a.status = 'trial' or a.plano_codigo in ('pro', 'sociedade', 'fundador'))`,
    [hoje],
  );
  const advogados = z.array(advogadoSchema).parse(rows);
  let novas = 0;

  for (const advogado of advogados) {
    try {
      const comunicacoes = await buscarComunicacoes({
        oab: advogado.oab_numero,
        uf: advogado.oab_uf,
        de: advogado.inicio,
        ate: hoje,
        buscar: config.buscar,
        esperar: config.esperar,
      });
      for (const comunicacao of comunicacoes.filter((item) =>
        eDoAdvogado(item, advogado.oab_numero, advogado.oab_uf),
      )) {
        const linha = paraIntimacao(comunicacao);
        const resultado = await db.query(
          `insert into intimacoes (escritorio_id, origem, texto, data_disponibilizacao, djen_id, status)
           values ($1, 'djen', $2, $3::date, $4, 'recebida')
           on conflict (escritorio_id, djen_id) where djen_id is not null do nothing`,
          [advogado.escritorio_id, linha.texto, linha.data_disponibilizacao, linha.djen_id],
        );
        novas += resultado.rowCount ?? 0;
      }
      await db.query("update usuarios set djen_buscado_ate = $1::date where id = $2", [
        hoje,
        advogado.usuario_id,
      ]);
    } catch (erro) {
      config.avisarErro(erro);
      config.registrar("djen_falhou", {
        usuario_id: advogado.usuario_id,
        erro: erro instanceof Error ? erro.message : String(erro),
      });
      if (erro instanceof FormatoDjenMudou) break;
    }
  }
  config.registrar("djen_importado", { advogados: advogados.length, novas });
  return novas;
}
