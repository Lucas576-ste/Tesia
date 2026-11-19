import { faseDoAto, normalizarNome, type AnaliseGravada } from "@tesia/shared";
import type { PoolClient } from "pg";
import { z } from "zod";

export function nomeDoCliente({ dados }: Pick<AnaliseGravada, "dados">) {
  if (!dados.polo_cliente) return null;
  const nomes = dados.partes
    .filter((parte) => parte.polo === dados.polo_cliente)
    .map((parte) => parte.nome.trim())
    .filter(Boolean);
  return nomes.length ? nomes.join(", ") : null;
}

export async function ligarCliente(
  db: PoolClient,
  escritorioId: string,
  processoId: string,
  analise: AnaliseGravada,
) {
  const nome = nomeDoCliente(analise);
  if (!nome) return;
  const { rows } = await db.query(
    "select cliente_id from processos where id = $1 and escritorio_id = $2",
    [processoId, escritorioId],
  );
  if (rows[0]?.cliente_id) return;
  const normalizado = normalizarNome(nome);
  const existente = await db.query(
    "select id from clientes where escritorio_id = $1 and nome_normalizado = $2 order by criado_em limit 1",
    [escritorioId, normalizado],
  );
  let clienteId = z.object({ id: z.uuid() }).safeParse(existente.rows[0]).data?.id;
  if (!clienteId) {
    const criado = await db.query(
      "insert into clientes (escritorio_id, nome, nome_normalizado) values ($1, $2, $3) returning id",
      [escritorioId, nome, normalizado],
    );
    clienteId = z.object({ id: z.uuid() }).parse(criado.rows[0]).id;
  }
  await db.query(
    "update processos set cliente_id = $3 where id = $1 and escritorio_id = $2 and cliente_id is null",
    [processoId, escritorioId, clienteId],
  );
}

export async function atualizarFase(
  db: PoolClient,
  escritorioId: string,
  processoId: string,
  intimacaoId: string,
  tipoAto: string,
) {
  const { rows } = await db.query(
    `select p.rito::text as rito, i.origem::text as origem, i.criado_em
     from processos p, intimacoes i
     where p.id = $1 and p.escritorio_id = $2 and i.id = $3`,
    [processoId, escritorioId, intimacaoId],
  );
  const linha = z
    .object({ rito: z.string().nullable(), origem: z.string(), criado_em: z.date() })
    .safeParse(rows[0]);
  if (!linha.success) return;
  const fase = faseDoAto(linha.data.rito, tipoAto);
  if (!fase) return;
  await db.query(
    `update processos
     set fase = $3, fase_origem = $4, fase_atualizada_em = $5
     where id = $1 and escritorio_id = $2 and encerrado_em is null
       and (fase_atualizada_em is null or fase_atualizada_em <= $5)`,
    [
      processoId,
      escritorioId,
      fase,
      linha.data.origem === "djen" ? "djen" : "intimacao",
      linha.data.criado_em,
    ],
  );
}
