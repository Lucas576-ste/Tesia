import { Extension } from "@tiptap/core";
import type { Node as NoEditor } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

const PADRAO_PENDENCIA = /\[CONFIRMAR[^\]]*\]/g;

export type Pendencia = {
  de: number;
  ate: number;
  texto: string;
};

export function encontrarPendencias(documento: NoEditor) {
  const pendencias: Pendencia[] = [];
  documento.descendants((no, posicao) => {
    if (!no.isText || !no.text) return;
    for (const achado of no.text.matchAll(PADRAO_PENDENCIA)) {
      const de = posicao + achado.index;
      pendencias.push({ de, ate: de + achado[0].length, texto: achado[0] });
    }
  });
  return pendencias;
}

export const ExtensaoPendencias = Extension.create({
  name: "pendencias",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("pendencias"),
        props: {
          decorations: ({ doc }) =>
            DecorationSet.create(
              doc,
              encontrarPendencias(doc).map(({ de, ate }) =>
                Decoration.inline(de, ate, { class: "pendencia-confirmar" }),
              ),
            ),
        },
      }),
    ];
  },
});
