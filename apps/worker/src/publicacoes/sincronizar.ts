import type pg from "pg";
import { z } from "zod";
import { FormatoDjenMudou } from "../djen/cliente.js";
import { gravarPublicacao } from "./gravar.js";
import { FalhaAutenticacao, type ProvedorPublicacoes, type Termo } from "./tipos.js";

type Banco = Pick<pg.Pool, "query">;

type Configuracao = {
  registrar: (evento: string, dados: Record<string, unknown>) => void;
  avisarErro: (erro: unknown) => void;
  provedorDoTermo: (termo: Termo) => ProvedorPublicacoes;
};

const termoSchema = z.object({
  id: z.uuid(),
  escritorio_id: z.uuid(),
  responsavel_id: z.uuid().nullable(),
  tipo: z.enum(["advogado", "pf", "pj"]),
  oab_numero: z.string().nullable(),
  oab_uf: z.string().nullable(),
  documento: z.string().nullable(),
  nome: z.string().nullable(),
  ufs: z.array(z.string()),
  inicio: z.string(),
});

async function avisarFalhaDeAutenticacao(db: Banco, termo: Termo, mensagem: string) {
  const { rows } = await db.query(
    "select coalesce($2::uuid, (select id from usuarios where escritorio_id = $1 order by criado_em limit 1)) as id",
    [termo.escritorio_id, termo.responsavel_id],
  );
  const usuario = (rows[0] as { id: string | null } | undefined)?.id;
  if (!usuario) return;
  await db.query(
    `insert into notificacoes (escritorio_id, usuario_id, tipo, titulo, texto, href)
     values ($1, $2, 'termo', 'Falha na busca de intimações', $3, '/app/configuracoes?aba=perfil')`,
    [termo.escritorio_id, usuario, `${mensagem}. Confira a busca da sua OAB em Configurações.`],
  );
}

export async function sincronizarTermos(
  db: Banco,
  config: Configuracao,
  hoje: string,
  { somenteNovos = false }: { somenteNovos?: boolean } = {},
) {
  const { rows } = await db.query(
    `select t.id, t.escritorio_id, t.responsavel_id, t.tipo, t.oab_numero, t.oab_uf, t.documento,
       t.nome, t.ufs,
       to_char(greatest(coalesce(t.buscado_ate - 1, $1::date - 7), $1::date - 30), 'YYYY-MM-DD') as inicio
     from termos_monitorados t
     join assinaturas a on a.escritorio_id = t.escritorio_id
     where t.status = any($2::status_termo[])
       and a.status in ('trial', 'ativa')
       and (a.status = 'trial' or a.plano_codigo in ('pro', 'sociedade', 'fundador'))
     order by t.criado_em`,
    [hoje, somenteNovos ? ["sincronizando"] : ["sincronizando", "monitorando"]],
  );
  const termos = z.array(termoSchema).parse(rows);
  let intimacoes = 0;
  let andamentos = 0;

  for (const { inicio, ...termo } of termos) {
    try {
      const publicacoes = await config.provedorDoTermo(termo).buscar(termo, inicio, hoje);
      for (const publicacao of publicacoes) {
        const resultado = await gravarPublicacao(db, termo, publicacao, hoje);
        if (resultado === "intimacao") intimacoes += 1;
        if (resultado === "andamento") andamentos += 1;
      }
      await db.query(
        `update termos_monitorados
         set status = 'monitorando', ultima_sincronizacao_em = now(), ultimo_erro = null,
             buscado_ate = $2::date
         where id = $1`,
        [termo.id, hoje],
      );
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : String(erro);
      if (erro instanceof FalhaAutenticacao) {
        await db.query(
          "update termos_monitorados set status = 'falha_autenticacao', ultimo_erro = $2 where id = $1",
          [termo.id, mensagem],
        );
        await avisarFalhaDeAutenticacao(db, termo, mensagem);
      } else {
        await db.query(
          "update termos_monitorados set status = 'monitorando', ultimo_erro = $2 where id = $1",
          [termo.id, mensagem],
        );
        config.avisarErro(erro);
      }
      config.registrar("termo_falhou", { termo_id: termo.id, erro: mensagem });
      if (erro instanceof FormatoDjenMudou) break;
    }
  }
  if (!somenteNovos || termos.length > 0) {
    config.registrar("termos_sincronizados", { termos: termos.length, intimacoes, andamentos });
  }
  return { intimacoes, andamentos };
}
