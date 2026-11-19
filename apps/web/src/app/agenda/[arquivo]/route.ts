import { createClient } from "@supabase/supabase-js";
import { montarIcal, type EventoAgenda } from "@tesia/documentos";
import { nomePartes } from "@tesia/shared";
import { z } from "zod";
import { ipDaRequisicao, limitar, MENSAGEM_LIMITE } from "@/lib/limite";
import { TOKEN_AGENDA } from "@/lib/agenda";
import { ambienteSupabase } from "@/lib/supabase/ambiente";

const linhaSchema = z.object({
  prazo_id: z.uuid(),
  descricao: z.string(),
  tipo: z.string(),
  data_vencimento: z.string(),
  data_prazo_interno: z.string().nullable(),
  hora: z.string().nullable(),
  intimacao_id: z.uuid().nullable(),
  partes: z
    .array(z.object({ nome: z.string(), polo: z.enum(["ativo", "passivo"]).nullable() }))
    .nullable(),
});

function naoEncontrado() {
  return new Response("Agenda não encontrada", { status: 404 });
}

export async function GET(
  requisicao: Request,
  { params }: { params: Promise<{ arquivo: string }> },
) {
  const { arquivo } = await params;
  const token = arquivo.replace(/\.ics$/, "");
  if (!(await limitar(`agenda:${await ipDaRequisicao()}`, 60, 3600))) {
    return new Response(MENSAGEM_LIMITE, { status: 429, headers: { "Retry-After": "3600" } });
  }
  if (!TOKEN_AGENDA.test(token)) return naoEncontrado();

  const { url, chave } = ambienteSupabase();
  const supabase = createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: valida } = await supabase.rpc("agenda_valida", { p_token: token });
  if (valida !== true) return naoEncontrado();
  const { data, error } = await supabase.rpc("agenda_por_token", { p_token: token });
  const linhas = z.array(linhaSchema).safeParse(data);
  if (error || !linhas.success) return naoEncontrado();

  const origem = new URL(requisicao.url).origin;
  const eventos: EventoAgenda[] = linhas.data.flatMap((prazo) => {
    const partes = prazo.partes?.length ? nomePartes(prazo.partes) : null;
    const titulo = partes ? `${prazo.descricao} · ${partes}` : prazo.descricao;
    const link = prazo.intimacao_id
      ? `${origem}/app/intimacoes/${prazo.intimacao_id}`
      : `${origem}/app`;
    const fatal: EventoAgenda = {
      uid: `${prazo.prazo_id}-fatal@tesia`,
      titulo:
        prazo.tipo === "prazo"
          ? titulo
          : `${titulo}${prazo.hora ? ` às ${prazo.hora.slice(0, 5)}` : ""}`,
      data: prazo.data_vencimento,
      descricao: `${prazo.tipo === "prazo" ? "Prazo fatal" : "Compromisso"}. Abrir na Tesia: ${link}`,
      url: link,
    };
    if (!prazo.data_prazo_interno || prazo.data_prazo_interno === prazo.data_vencimento)
      return [fatal];
    return [
      fatal,
      {
        uid: `${prazo.prazo_id}-interno@tesia`,
        titulo: `Prazo interno · ${prazo.descricao}`,
        data: prazo.data_prazo_interno,
        descricao: `Sua data de organização. Prazo fatal em ${prazo.data_vencimento.split("-").reverse().join("/")}. Abrir na Tesia: ${link}`,
        url: link,
      },
    ];
  });

  return new Response(montarIcal(eventos, { nome: "Tesia · Prazos" }), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="tesia-prazos.ics"',
      "Cache-Control": "no-store",
    },
  });
}
