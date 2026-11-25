import { formatarCnj } from "@tesia/shared";
import type pg from "pg";
import type { PublicacaoExterna, Termo } from "./tipos.js";

type Banco = Pick<pg.Pool, "query">;

export type ResultadoGravacao = "intimacao" | "andamento" | "repetida";

async function achar<T>(db: Banco, sql: string, valores: unknown[]) {
  const { rows } = await db.query(sql, valores);
  return (rows[0] as T | undefined) ?? null;
}

async function processoDoNumero(db: Banco, escritorioId: string, numero: string | null) {
  if (!numero) return null;
  const processo = await achar<{ id: string }>(
    db,
    `select id from processos
     where escritorio_id = $1 and excluido_em is null
       and regexp_replace(numero_cnj, '[^0-9]', '', 'g') = $2
     limit 1`,
    [escritorioId, numero],
  );
  return processo?.id ?? null;
}

async function responsavelDoTermo(db: Banco, termo: Termo) {
  if (termo.responsavel_id) return termo.responsavel_id;
  const dono = await achar<{ id: string }>(
    db,
    "select id from usuarios where escritorio_id = $1 order by criado_em limit 1",
    [termo.escritorio_id],
  );
  return dono?.id ?? null;
}

async function criarTarefaENotificacao(
  db: Banco,
  termo: Termo,
  intimacaoId: string,
  processoId: string | null,
  numero: string | null,
  hoje: string,
) {
  const responsavel = await responsavelDoTermo(db, termo);
  if (!responsavel) return;
  const tarefa = await achar<{ id: string }>(
    db,
    `insert into prazos (escritorio_id, processo_id, origem, tipo, responsavel_id, descricao,
       data_vencimento, status)
     values ($1, $2, 'manual', 'compromisso', $3, $4, $5::date, 'confirmado')
     returning id`,
    [
      termo.escritorio_id,
      processoId,
      responsavel,
      numero ? `Intimação Judicial · ${formatarCnj(numero)}` : "Intimação Judicial",
      hoje,
    ],
  );
  await db.query("update intimacoes set tarefa_id = $1, responsavel_id = $2 where id = $3", [
    tarefa?.id ?? null,
    responsavel,
    intimacaoId,
  ]);
  await db.query(
    `insert into notificacoes (escritorio_id, usuario_id, tipo, titulo, texto, href)
     values ($1, $2, 'intimacao', 'Nova intimação', $3, $4)`,
    [
      termo.escritorio_id,
      responsavel,
      numero ? `Processo ${formatarCnj(numero)}` : "Intimação recebida pela busca automática",
      `/app/intimacoes/${intimacaoId}`,
    ],
  );
}

export async function gravarPublicacao(
  db: Banco,
  termo: Termo,
  publicacao: PublicacaoExterna,
  hoje: string,
): Promise<ResultadoGravacao> {
  const processoId = await processoDoNumero(db, termo.escritorio_id, publicacao.numeroProcesso);

  if (publicacao.classificacao === "andamento") {
    if (!publicacao.numeroProcesso) return "repetida";
    const resultado = await db.query(
      `insert into andamentos_processo (escritorio_id, processo_id, numero_processo, termo_id,
         djen_id, hash, tribunal, tipo_publicacao, texto, publicada_em)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::date)
       on conflict (escritorio_id, hash) do nothing`,
      [
        termo.escritorio_id,
        processoId,
        publicacao.numeroProcesso,
        termo.id,
        publicacao.idExterno,
        publicacao.hash,
        publicacao.tribunal,
        publicacao.tipoPublicacao,
        publicacao.texto,
        publicacao.publicadaEm,
      ],
    );
    return (resultado.rowCount ?? 0) > 0 ? "andamento" : "repetida";
  }

  const { rows } = await db.query(
    `insert into intimacoes (escritorio_id, processo_id, origem, texto, data_disponibilizacao,
       djen_id, status, termo_id, fonte, tribunal, uf, tipo_publicacao, numero_processo,
       publicada_em, hash)
     values ($1, $2, 'djen', $3, $4::date, $5, 'recebida', $6, $7, $8, $9, $10, $11, $4::date, $12)
     on conflict do nothing
     returning id`,
    [
      termo.escritorio_id,
      processoId,
      publicacao.texto,
      publicacao.publicadaEm,
      publicacao.idExterno,
      termo.id,
      publicacao.fonte,
      publicacao.tribunal,
      publicacao.uf,
      publicacao.tipoPublicacao,
      publicacao.numeroProcesso,
      publicacao.hash,
    ],
  );
  const nova = rows[0] as { id: string } | undefined;
  if (!nova) return "repetida";
  await criarTarefaENotificacao(db, termo, nova.id, processoId, publicacao.numeroProcesso, hoje);
  return "intimacao";
}
