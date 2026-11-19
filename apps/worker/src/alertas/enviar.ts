import type pg from "pg";
import { z } from "zod";
import { escolherAvisos, montarEmail, type PrazoAlerta } from "./escolher";

type Configuracao = {
  chaveResend: string | undefined;
  remetente: string;
  urlApp: string;
  registrar: (evento: string, dados: Record<string, unknown>) => void;
};

const linhaSchema = z.object({
  id: z.uuid(),
  usuario_id: z.uuid(),
  nome: z.string(),
  email: z.string(),
  alerta_dias: z.array(z.string()),
  tipo: z.string(),
  descricao: z.string(),
  partes: z.string().nullable(),
  vencimento: z.string(),
  interno: z.string().nullable(),
  hora: z.string().nullable(),
  intimacao_id: z.uuid().nullable(),
});

export function hojeBrasilia(agora = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(agora);
}

export function horaBrasilia(agora = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(agora),
  );
}

async function enviarEmail(
  config: Configuracao,
  para: string,
  email: ReturnType<typeof montarEmail>,
) {
  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.chaveResend}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: config.remetente,
      to: [para],
      subject: email.assunto,
      text: email.texto,
      html: email.html,
    }),
  });
  if (!resposta.ok) throw new Error(`Resend respondeu ${resposta.status}`);
}

export async function enviarAlertas(db: pg.Pool, config: Configuracao, hoje = hojeBrasilia()) {
  if (!config.chaveResend) {
    config.registrar("alertas_sem_chave", {});
    return 0;
  }
  const { rows } = await db.query(
    `select p.id, u.id as usuario_id, u.nome, a.email, u.alerta_dias, p.tipo::text, p.descricao,
       coalesce(pr.partes, pr.parte_contraria) as partes, p.data_vencimento::text as vencimento,
       p.data_prazo_interno::text as interno, p.hora::text, p.intimacao_id
     from prazos p
     join usuarios u on u.escritorio_id = p.escritorio_id and u.alerta_email
     join auth.users a on a.id = u.auth_user_id
     left join processos pr on pr.id = p.processo_id
     where p.status = 'confirmado' and p.data_vencimento between $1::date and $1::date + 10
       and (p.responsavel_id is null or p.responsavel_id = u.id)`,
    [hoje],
  );
  const linhas = z.array(linhaSchema).parse(rows);
  const { rows: enviadosHoje } = await db.query(
    "select usuario_id, prazo_id, momento from alertas_enviados where data = $1::date",
    [hoje],
  );
  const jaEnviados = new Set(
    enviadosHoje.map((linha) => `${linha.usuario_id}:${linha.prazo_id}:${linha.momento}`),
  );
  const usuarios = new Map(linhas.map((linha) => [linha.usuario_id, linha]));
  const prazos: PrazoAlerta[] = linhas.map((linha) => ({
    id: linha.id,
    usuarioId: linha.usuario_id,
    tipo: linha.tipo,
    descricao: linha.descricao,
    partes: linha.partes ?? "Sem processo",
    vencimento: linha.vencimento,
    interno: linha.interno,
    hora: linha.hora,
    link: linha.intimacao_id
      ? `${config.urlApp}/app/intimacoes/${linha.intimacao_id}`
      : `${config.urlApp}/app`,
  }));
  const escolhidos = new Map([...usuarios].map(([id, linha]) => [id, linha.alerta_dias]));
  const avisos = escolherAvisos(prazos, hoje, escolhidos, jaEnviados);

  let enviados = 0;
  for (const [usuarioId, lista] of avisos) {
    const usuario = usuarios.get(usuarioId);
    if (!usuario) continue;
    try {
      await enviarEmail(
        config,
        usuario.email,
        montarEmail(usuario.nome.split(" ")[0] ?? usuario.nome, lista),
      );
      for (const { prazo, momento } of lista) {
        await db.query(
          `insert into alertas_enviados (usuario_id, prazo_id, momento, data) values ($1, $2, $3, $4::date)
           on conflict do nothing`,
          [usuarioId, prazo.id, momento, hoje],
        );
      }
      enviados += 1;
    } catch (erro) {
      config.registrar("alerta_falhou", {
        usuario_id: usuarioId,
        erro: erro instanceof Error ? erro.message : String(erro),
      });
    }
  }
  config.registrar("alertas_enviados", { emails: enviados, data: hoje });
  return enviados;
}
