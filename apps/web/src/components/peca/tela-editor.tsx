"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ArrowLeft, Download, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { buscarVersao, marcarProtocolada, salvarVersao } from "@/app/app/pecas/acoes";
import { toast } from "sonner";
import { EstadoCarregando } from "@/components/estado-carregando";
import { BalaoLia } from "@/components/lia/balao-lia";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PecaEditor } from "@/lib/peca";
import { AvisoPro } from "@/components/plano/aviso-pro";
import { usePlano } from "@/components/plano/provedor-plano";
import { BarraFormatacao } from "./barra-formatacao";
import { ExtensaoPendencias, encontrarPendencias, type Pendencia } from "./extensao-pendencias";
import { PainelAjuste } from "./painel-ajuste";
import { PainelFontes } from "./painel-fontes";
import { PainelPendencias } from "./painel-pendencias";
import { PainelVersoes } from "./painel-versoes";

const conteudoAba = "data-[state=inactive]:hidden lg:data-[state=inactive]:block";

function textoPendencias(quantidade: number) {
  return quantidade === 1 ? "1 pendência" : `${quantidade} pendências`;
}

function falaLia(quantidade: number, protocolada: boolean) {
  if (protocolada) return "Esta peça já foi protocolada. Reabra se precisar alterar o texto.";
  if (quantidade === 0) return "Não há pontos marcados no texto. Faça sua revisão final.";
  if (quantidade === 1) return "Escrevi no seu estilo e marquei 1 ponto para você conferir.";
  return `Escrevi no seu estilo e marquei ${quantidade} pontos para você conferir.`;
}

export function TelaEditor({ peca }: { peca: PecaEditor }) {
  const { recursosPro } = usePlano().plano;
  const [aba, setAba] = useState("peca");
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [protocolada, setProtocolada] = useState(peca.status === "protocolada");
  const [modal, setModal] = useState<"baixar" | "protocolar" | null>(null);
  const [versoes, setVersoes] = useState(peca.versoes);
  const [alterado, setAlterado] = useState(false);
  const [salvando, iniciar] = useTransition();

  const editor = useEditor({
    immediatelyRender: false,
    editable: peca.status !== "protocolada",
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } }), ExtensaoPendencias],
    content: peca.documento,
    editorProps: {
      attributes: { class: "editor-peca", "aria-label": "Texto da peça" },
      scrollMargin: 96,
      scrollThreshold: 96,
    },
    onCreate: ({ editor: criado }) => setPendencias(encontrarPendencias(criado.state.doc)),
    onUpdate: ({ editor: atual }) => {
      setPendencias(encontrarPendencias(atual.state.doc));
      setAlterado(true);
    },
  });

  useEffect(() => {
    if (!alterado) return;
    const avisar = (evento: BeforeUnloadEvent) => evento.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [alterado]);

  function irParaPendencia({ de, ate }: Pendencia) {
    setAba("peca");
    requestAnimationFrame(() => {
      editor?.chain().focus().setTextSelection({ from: de, to: ate }).scrollIntoView().run();
    });
  }

  function salvar() {
    if (!editor) return;
    const documento = editor.getJSON();
    iniciar(async () => {
      const resultado = await salvarVersao(peca.id, documento);
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      const agora = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());
      setVersoes((atuais) => [
        ...atuais,
        { numero: resultado.versao, origem: "usuario", data: agora },
      ]);
      setAlterado(false);
      toast.success(`Versão ${resultado.versao} salva.`);
    });
  }

  function restaurar(numero: number) {
    iniciar(async () => {
      const resultado = await buscarVersao(peca.id, numero);
      if ("erro" in resultado || !editor) {
        toast.error("erro" in resultado ? resultado.erro : "Editor indisponível.");
        return;
      }
      editor.commands.setContent(resultado.documento, { emitUpdate: true });
      toast.success(`Versão ${numero} carregada. Salve para manter este texto.`);
    });
  }

  function baixar() {
    setModal(null);
    const link = document.createElement("a");
    link.href = `/app/pecas/${peca.id}/docx`;
    link.download = "";
    link.click();
  }

  function aoClicarBaixar() {
    if (alterado) {
      toast.error("Salve a versão antes de baixar. O .docx usa o texto salvo.");
      return;
    }
    if (pendencias.length > 0) setModal("baixar");
    else baixar();
  }

  function mudarProtocolo(valor: boolean) {
    if (valor && alterado) {
      toast.error("Salve a versão antes de marcar como protocolada.");
      setModal(null);
      return;
    }
    iniciar(async () => {
      const resultado = await marcarProtocolada(peca.id, valor);
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      setProtocolada(valor);
      editor?.setEditable(!valor);
      setModal(null);
      toast.success(valor ? "Peça marcada como protocolada." : "Peça reaberta para edição.");
    });
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href={peca.intimacaoId ? `/app/intimacoes/${peca.intimacaoId}` : "/app/pecas"}>
          <ArrowLeft aria-hidden />
          {peca.intimacaoId ? "Voltar à análise" : "Voltar às peças"}
        </Link>
      </Button>
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold text-titulo md:text-3xl">{peca.tipo}</h1>
          {protocolada ? (
            <Badge className="border-transparent bg-sucesso-fundo text-sucesso">Protocolada</Badge>
          ) : (
            <Badge className="border-transparent bg-atencao-fundo text-atencao">Rascunho</Badge>
          )}
        </div>
        <p className="text-sm text-texto-secundario">
          {peca.partes}
          {peca.cnj && (
            <>
              {" "}
              · <span className="whitespace-nowrap tabular-nums">{peca.cnj}</span>
            </>
          )}
        </p>
        <p className="text-sm">
          {peca.vencimento && (
            <>
              Prazo fatal: <span className="font-medium tabular-nums">{peca.vencimento}</span>
              <span className="text-texto-secundario"> · </span>
            </>
          )}
          <span className="text-texto-secundario">
            {alterado ? "Alterações não salvas" : "Tudo salvo"}
          </span>
        </p>
      </header>
      <BalaoLia className="text-sm">{falaLia(pendencias.length, protocolada)}</BalaoLia>
      {peca.aviso && (
        <p role="note" className="rounded-md bg-atencao-fundo p-3 text-sm text-atencao">
          {peca.aviso}
        </p>
      )}
      <p className="flex items-center gap-2 text-sm text-texto-secundario">
        <ShieldAlert aria-hidden className="size-4 shrink-0" />
        Rascunho gerado por IA. Revise antes de protocolar.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button variant="outline" onClick={aoClicarBaixar}>
          <Download aria-hidden />
          Baixar .docx
        </Button>
        {!protocolada && (
          <Button variant="outline" onClick={salvar} disabled={salvando || !alterado}>
            {salvando ? "Salvando..." : "Salvar versão"}
          </Button>
        )}
        {protocolada ? (
          <Button variant="outline" onClick={() => mudarProtocolo(false)} disabled={salvando}>
            Reabrir peça
          </Button>
        ) : (
          <Button onClick={() => setModal("protocolar")}>Marcar como protocolado</Button>
        )}
      </div>
      <Tabs value={aba} onValueChange={setAba}>
        <TabsList className="lg:hidden">
          <TabsTrigger value="peca">Peça</TabsTrigger>
          <TabsTrigger value="painel">Pendências e fontes</TabsTrigger>
        </TabsList>
        <div className="grid items-start gap-5 lg:grid-cols-[3fr_2fr]">
          <TabsContent value="peca" forceMount className={conteudoAba}>
            <div className="tema-claro overflow-hidden rounded-md border bg-card shadow-xs focus-within:ring-[3px] focus-within:ring-ring/50">
              {editor ? (
                <BarraFormatacao editor={editor} desativada={protocolada} />
              ) : (
                <div className="p-4">
                  <EstadoCarregando />
                </div>
              )}
              <EditorContent editor={editor} />
            </div>
          </TabsContent>
          <TabsContent value="painel" forceMount className={conteudoAba}>
            <div className="flex flex-col gap-4">
              <PainelPendencias pendencias={pendencias} aoEscolher={irParaPendencia} />
              <PainelFontes fontes={peca.fontes} intimacaoId={peca.intimacaoId} />
              {recursosPro ? (
                <PainelAjuste
                  pecaId={peca.id}
                  ajuste={peca.ajuste}
                  desativado={protocolada}
                  alterado={alterado}
                  aoAtingirLimite={() =>
                    toast.error(
                      "Você chegou ao limite de peças de hoje. Este ajuste contaria como peça nova.",
                    )
                  }
                />
              ) : (
                <AvisoPro
                  titulo="Ajustes pela Lia"
                  descricao="Peça mudanças no rascunho em poucas palavras, sem reescrever à mão."
                />
              )}
              <PainelVersoes
                versoes={versoes}
                desativado={protocolada}
                salvando={salvando}
                podeSalvar={alterado}
                aoSalvar={salvar}
                aoRestaurar={restaurar}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
      <Dialog
        open={modal !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setModal(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modal === "baixar"
                ? `Há ${textoPendencias(pendencias.length)} no texto`
                : "Marcar como protocolado?"}
            </DialogTitle>
            <DialogDescription>
              {modal === "baixar"
                ? "Você pode baixar assim mesmo, mas confira esses pontos antes de protocolar."
                : "Confirme só depois de protocolar no sistema do tribunal."}
              {modal === "protocolar" &&
                pendencias.length > 0 &&
                ` Ainda há ${textoPendencias(pendencias.length)} no texto.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            {modal === "baixar" ? (
              <Button onClick={baixar}>Baixar assim mesmo</Button>
            ) : (
              <Button onClick={() => mudarProtocolo(true)} disabled={salvando}>
                Confirmar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
