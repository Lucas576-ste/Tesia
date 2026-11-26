import { montarPlanilha } from "@tesia/documentos";
import { z } from "zod";
import { filtrosIntimacoesDaUrl, LIMITE_EXPORTACAO } from "@/lib/intimacoes-lista";
import { listarIntimacoesParaExportar } from "@/lib/intimacoes-lista-servidor";
import { limitar, MENSAGEM_LIMITE } from "@/lib/limite";
import { ROTULOS_SITUACAO } from "@/lib/situacao-intimacao";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const TIPO_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const textoSchema = z.array(z.object({ id: z.uuid(), texto: z.string().nullable() }));

async function textosDasIntimacoes(ids: string[]) {
  const supabase = await criarClienteServidor();
  const mapa = new Map<string, string>();
  for (let inicio = 0; inicio < ids.length; inicio += 200) {
    const { data } = await supabase
      .from("intimacoes")
      .select("id, texto")
      .in("id", ids.slice(inicio, inicio + 200));
    for (const { id, texto } of textoSchema.safeParse(data).data ?? []) mapa.set(id, texto ?? "");
  }
  return mapa;
}

export async function GET(requisicao: Request) {
  const usuario = await usuarioAtual();
  if (!usuario) return new Response("Não autorizado", { status: 401 });
  if (!(await limitar(`exportar-intimacoes:${usuario.id}`, 20, 3600))) {
    return new Response(MENSAGEM_LIMITE, { status: 429, headers: { "Retry-After": "3600" } });
  }
  const parametros = Object.fromEntries(new URL(requisicao.url).searchParams);
  const filtros = filtrosIntimacoesDaUrl(parametros);
  const { linhas } = await listarIntimacoesParaExportar(filtros, LIMITE_EXPORTACAO);
  const textos = await textosDasIntimacoes(linhas.map(({ id }) => id));

  const arquivo = montarPlanilha(
    [
      { titulo: "Data", largura: 12 },
      { titulo: "Processo", largura: 28 },
      { titulo: "Partes", largura: 40 },
      { titulo: "Tribunal", largura: 12 },
      { titulo: "UF", largura: 6 },
      { titulo: "Tipo", largura: 22 },
      { titulo: "Termo", largura: 24 },
      { titulo: "Responsável", largura: 22 },
      { titulo: "Situação", largura: 22 },
      { titulo: "Peça sugerida", largura: 26 },
      { titulo: "Conteúdo", largura: 80 },
    ],
    linhas.map((linha) => [
      linha.data,
      linha.cnj ?? "",
      linha.partes,
      linha.tribunal ?? "",
      linha.uf ?? "",
      linha.tipo ?? "",
      linha.termo ?? "",
      linha.responsavelNome ?? "",
      ROTULOS_SITUACAO[linha.situacao],
      linha.peca ?? "",
      (textos.get(linha.id) ?? "").slice(0, 3000),
    ]),
    "Intimações",
  );
  const dia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(
    new Date(),
  );
  return new Response(Buffer.from(arquivo), {
    headers: {
      "Content-Type": TIPO_XLSX,
      "Content-Disposition": `attachment; filename="intimacoes-${dia}.xlsx"`,
      "Cache-Control": "private, no-store",
    },
  });
}
