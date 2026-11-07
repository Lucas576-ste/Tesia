"use client";

import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ArrowLeft, Download, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
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
import type { PecaExemplo } from "@/lib/pecas-exemplo";
import { usePlanoDemo } from "@/components/plano/provedor-plano-demo";
import { BarraFormatacao } from "./barra-formatacao";
import { ExtensaoPendencias, encontrarPendencias, type Pendencia } from "./extensao-pendencias";
import { PainelAjuste } from "./painel-ajuste";
import { PainelFontes } from "./painel-fontes";
import { PainelPendencias } from "./painel-pendencias";
import { PainelVersoes, type VersaoPeca } from "./painel-versoes";

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

export function TelaEditor({ peca, temAnalise }: { peca: PecaExemplo; temAnalise: boolean }) {
  const { recursosPro } = usePlanoDemo().plano;
  const [aba, setAba] = useState("peca");
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [protocolada, setProtocolada] = useState(peca.status === "protocolado");
  const [modal, setModal] = useState<"baixar" | "protocolar" | null>(null);
  const [versoes, setVersoes] = useState<VersaoPeca[]>([]);
  const conteudos = useRef(new Map<number, JSONContent>());

  const editor = useEditor({
    immediatelyRender: false,
    editable: peca.status !== "protocolado",
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } }), ExtensaoPendencias],
    content: peca.conteudo,
    editorProps: {
      attributes: { class: "editor-peca", "aria-label": "Texto da peça" },
      scrollMargin: 96,
      scrollThreshold: 96,
    },
    onCreate: ({ editor: criado }) => {
      setPendencias(encontrarPendencias(criado.state.doc));
      conteudos.current.set(1, criado.getJSON());
      setVersoes([{ numero: 1, rotulo: "Versão 1, escrita pela Lia" }]);
    },
    onUpdate: ({ editor: atual }) => setPendencias(encontrarPendencias(atual.state.doc)),
  });

  function irParaPendencia({ de, ate }: Pendencia) {
    setAba("peca");
    requestAnimationFrame(() => {
      editor?.chain().focus().setTextSelection({ from: de, to: ate }).scrollIntoView().run();
    });
  }

  function salvarVersao() {
    if (!editor) return;
    const numero = versoes.length + 1;
    conteudos.current.set(numero, editor.getJSON());
    setVersoes((atuais) => [...atuais, { numero, rotulo: `Versão ${numero}, salva por você` }]);
    toast.success(`Versão ${numero} guardada nesta página.`);
  }

  function restaurar(numero: number) {
    const conteudo = conteudos.current.get(numero);
    if (!editor || !conteudo) return;
    editor.commands.setContent(conteudo, { emitUpdate: true });
    toast.success(`Versão ${numero} restaurada.`);
  }

  function baixar() {
    setModal(null);
    toast.info("Demonstração: o arquivo .docx ainda não é gerado.");
  }

  function aoClicarBaixar() {
    if (pendencias.length > 0) setModal("baixar");
    else baixar();
  }

  function mudarProtocolo(valor: boolean) {
    setProtocolada(valor);
    editor?.setEditable(!valor);
    setModal(null);
    if (valor) toast.success("Peça marcada como protocolada.");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href={temAnalise ? `/app/intimacoes/${peca.id}` : "/app/pecas"}>
          <ArrowLeft aria-hidden />
          {temAnalise ? "Voltar à análise" : "Voltar às peças"}
        </Link>
      </Button>
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold text-titulo md:text-3xl">{peca.tipo}</h1>
          <Badge variant="secondary">Dados de exemplo</Badge>
          {protocolada ? (
            <Badge className="border-transparent bg-sucesso-fundo text-sucesso">Protocolada</Badge>
          ) : (
            <Badge className="border-transparent bg-atencao-fundo text-atencao">Rascunho</Badge>
          )}
        </div>
        <p className="text-sm text-texto-secundario">
          {peca.partes} · <span className="whitespace-nowrap tabular-nums">{peca.cnj}</span>
        </p>
        <p className="text-sm">
          {peca.vencimento && (
            <>
              Prazo fatal: <span className="font-medium tabular-nums">{peca.vencimento}</span>
              <span className="text-texto-secundario"> · </span>
            </>
          )}
          <span className="text-texto-secundario">Demonstração: as edições não são salvas.</span>
        </p>
      </header>
      <BalaoLia className="text-sm">{falaLia(pendencias.length, protocolada)}</BalaoLia>
      <p className="flex items-center gap-2 text-sm text-texto-secundario">
        <ShieldAlert aria-hidden className="size-4 shrink-0" />
        Rascunho gerado por IA. Revise antes de protocolar.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button variant="outline" onClick={aoClicarBaixar}>
          <Download aria-hidden />
          Baixar .docx
        </Button>
        {protocolada ? (
          <Button variant="outline" onClick={() => mudarProtocolo(false)}>
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
              <PainelFontes peca={peca} temAnalise={temAnalise} />
              {recursosPro && <PainelAjuste desativado={protocolada} />}
              <PainelVersoes
                versoes={versoes}
                desativado={protocolada}
                aoSalvar={salvarVersao}
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
              <Button onClick={() => mudarProtocolo(true)}>Confirmar</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
