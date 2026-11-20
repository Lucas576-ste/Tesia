import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { limitar, MENSAGEM_LIMITE } from "@/lib/limite";
import { lerPlano } from "@/lib/plano-servidor";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { separarAcoes, type IdsDaTela } from "@/lib/lia/acoes";
import { montarContexto } from "@/lib/lia/contexto";
import { registrarUsoLia } from "@/lib/lia/custo";
import { codificarEvento, type EventoLia } from "@/lib/lia/eventos";
import { limiteLia, MAXIMO_CARACTERES } from "@/lib/lia/limites";
import { montarSistema, VERSAO_PROMPT_LIA } from "@/lib/lia/prompt";
import {
  decidirPergunta,
  gerarResposta,
  MENSAGEM_ERRO,
  MODELO_LIA,
  turnosParaModelo,
} from "@/lib/lia/responder";

const MENSAGENS_NO_HISTORICO = 12;

const corpoSchema = z.object({
  conversaId: z.uuid().optional(),
  mensagem: z.string().trim().min(1).max(MAXIMO_CARACTERES),
  rota: z.string().max(200).startsWith("/app"),
  reenvio: z.boolean().optional(),
});

function json(corpo: Record<string, unknown>, status: number) {
  return Response.json(corpo, { status, headers: { "Cache-Control": "no-store" } });
}

const linhaMensagemSchema = z.object({ papel: z.string(), conteudo: z.string() });

export async function POST(requisicao: Request) {
  const usuario = await usuarioAtual();
  if (!usuario) return json({ mensagem: "Sua sessão expirou. Entre de novo." }, 401);
  const corpo = corpoSchema.safeParse(await requisicao.json().catch(() => null));
  if (!corpo.success) return json({ mensagem: "Mensagem inválida." }, 400);
  if (!(await limitar(`lia:${usuario.id}`, 20, 60))) {
    return json({ mensagem: MENSAGEM_LIMITE }, 429);
  }

  const { conversaId: idInformado, mensagem, rota } = corpo.data;
  const supabase = await criarClienteServidor();
  const estado = await lerPlano();
  const limite = limiteLia(estado.id);
  const { data: usoDia } = await supabase.rpc("perguntas_lia_hoje");
  const usadas = z.number().safeParse(usoDia).data ?? 0;

  let reenvio = false;
  if (corpo.data.reenvio && idInformado) {
    const { data: ultima } = await supabase
      .from("mensagens_lia")
      .select("papel, conteudo")
      .eq("conversa_id", idInformado)
      .order("criada_em", { ascending: false })
      .limit(1)
      .maybeSingle();
    const linha = linhaMensagemSchema.safeParse(ultima).data;
    reenvio = linha?.papel === "usuario" && linha.conteudo === mensagem;
  }

  const decisao = decidirPergunta({ mensagem, usadas, limite, reenvio });
  if (decisao.tipo === "limite") {
    return json(
      {
        mensagem: `Você chegou ao limite de ${limite} perguntas de hoje. Elas voltam amanhã.`,
        uso: { usadas, limite },
      },
      429,
    );
  }

  let conversaId = idInformado;
  if (conversaId) {
    const { data } = await supabase
      .from("conversas_lia")
      .select("id")
      .eq("id", conversaId)
      .maybeSingle();
    if (!data) return json({ mensagem: "Conversa não encontrada." }, 404);
  } else {
    const { data, error } = await supabase
      .from("conversas_lia")
      .insert({
        escritorio_id: usuario.escritorio_id,
        usuario_id: usuario.id,
        titulo: mensagem.slice(0, 60),
      })
      .select("id")
      .single();
    const criada = z.object({ id: z.uuid() }).safeParse(data).data;
    if (error || !criada) return json({ mensagem: MENSAGEM_ERRO }, 500);
    conversaId = criada.id;
  }

  if (!reenvio) {
    const { error } = await supabase.from("mensagens_lia").insert({
      conversa_id: conversaId,
      escritorio_id: usuario.escritorio_id,
      papel: "usuario",
      conteudo: mensagem,
      contexto_json: { rota, plano: estado.plano.nome },
    });
    if (error) return json({ mensagem: MENSAGEM_ERRO }, 500);
  }

  const idDaConversa = conversaId;
  const usadasDepois = usadas + (reenvio ? 0 : 1);
  const codificador = new TextEncoder();

  const fluxo = new ReadableStream<Uint8Array>({
    async start(controlador) {
      const enviar = (evento: EventoLia) => {
        try {
          controlador.enqueue(codificador.encode(codificarEvento(evento)));
        } catch {
          return;
        }
      };
      const salvar = async (texto: string) => {
        const { data } = await supabase
          .from("mensagens_lia")
          .insert({
            conversa_id: idDaConversa,
            escritorio_id: usuario.escritorio_id,
            papel: "lia",
            conteudo: texto,
          })
          .select("id")
          .single();
        await supabase
          .from("conversas_lia")
          .update({ atualizada_em: new Date().toISOString() })
          .eq("id", idDaConversa);
        return z.object({ id: z.uuid() }).safeParse(data).data?.id ?? null;
      };

      enviar({ tipo: "inicio", conversaId: idDaConversa });

      if (decisao.tipo === "juridica") {
        enviar({ tipo: "texto", valor: decisao.resposta });
        const mensagemId = await salvar(decisao.resposta);
        enviar({
          tipo: "fim",
          mensagemId,
          acoes: [],
          uso: { usadas: usadasDepois, limite },
        });
        controlador.close();
        return;
      }

      const chave = process.env.ANTHROPIC_API_KEY;
      if (!chave) {
        enviar({ tipo: "erro", mensagem: MENSAGEM_ERRO });
        controlador.close();
        return;
      }

      const inicio = Date.now();
      const [{ contexto, ids }, { data: historico }] = await Promise.all([
        montarContexto(rota, estado.plano.nome),
        supabase
          .from("mensagens_lia")
          .select("papel, conteudo")
          .eq("conversa_id", idDaConversa)
          .order("criada_em", { ascending: false })
          .limit(MENSAGENS_NO_HISTORICO),
      ]);
      const turnos = turnosParaModelo(
        (z.array(linhaMensagemSchema).safeParse(historico).data ?? []).reverse(),
      );

      const resultado = await gerarResposta(
        new Anthropic({ apiKey: chave }) as never,
        { sistema: montarSistema(contexto), mensagens: turnos, signal: requisicao.signal },
        (pedaco) => enviar({ tipo: "texto", valor: pedaco }),
      );

      if (resultado.falhou && !resultado.texto.trim()) {
        enviar({ tipo: "erro", mensagem: MENSAGEM_ERRO });
        controlador.close();
        return;
      }

      const { texto, acoes } = separarAcoes(resultado.texto, ids as IdsDaTela);
      const mensagemId = texto ? await salvar(texto) : null;
      if (resultado.uso) {
        await registrarUsoLia(
          usuario.escritorio_id,
          resultado.uso,
          MODELO_LIA,
          VERSAO_PROMPT_LIA,
          Date.now() - inicio,
        );
      }
      enviar({ tipo: "fim", mensagemId, acoes, uso: { usadas: usadasDepois, limite } });
      controlador.close();
    },
  });

  return new Response(fluxo, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
