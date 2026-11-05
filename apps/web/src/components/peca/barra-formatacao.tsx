"use client";

import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { Bold, Heading3, Italic, List, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function BotaoFormato({
  rotulo,
  icone: Icone,
  ativo,
  desativado,
  aoClicar,
}: {
  rotulo: string;
  icone: LucideIcon;
  ativo: boolean;
  desativado: boolean;
  aoClicar: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={rotulo}
      aria-pressed={ativo}
      disabled={desativado}
      onClick={aoClicar}
      className={cn(ativo && "bg-primaria-fundo text-primaria")}
    >
      <Icone aria-hidden />
    </Button>
  );
}

export function BarraFormatacao({ editor, desativada }: { editor: Editor; desativada: boolean }) {
  const ativos = useEditorState({
    editor,
    selector: ({ editor: atual }) => ({
      negrito: atual.isActive("bold"),
      italico: atual.isActive("italic"),
      titulo: atual.isActive("heading", { level: 3 }),
      lista: atual.isActive("bulletList"),
    }),
  });

  return (
    <div
      role="toolbar"
      aria-label="Formatação"
      className="flex flex-wrap gap-1 border-b bg-card p-1"
    >
      <BotaoFormato
        rotulo="Negrito"
        icone={Bold}
        ativo={ativos.negrito}
        desativado={desativada}
        aoClicar={() => editor.chain().focus().toggleBold().run()}
      />
      <BotaoFormato
        rotulo="Itálico"
        icone={Italic}
        ativo={ativos.italico}
        desativado={desativada}
        aoClicar={() => editor.chain().focus().toggleItalic().run()}
      />
      <BotaoFormato
        rotulo="Título"
        icone={Heading3}
        ativo={ativos.titulo}
        desativado={desativada}
        aoClicar={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />
      <BotaoFormato
        rotulo="Lista"
        icone={List}
        ativo={ativos.lista}
        desativado={desativada}
        aoClicar={() => editor.chain().focus().toggleBulletList().run()}
      />
    </div>
  );
}
