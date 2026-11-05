import {
  FilePlus2,
  FileText,
  FolderOpen,
  LayoutDashboard,
  PenLine,
  type LucideIcon,
} from "lucide-react";

export type ItemMenu = {
  rotulo: string;
  rotuloCurto: string;
  href: string;
  icone: LucideIcon;
};

export const itensMenu: ItemMenu[] = [
  { rotulo: "Painel", rotuloCurto: "Painel", href: "/app", icone: LayoutDashboard },
  {
    rotulo: "Nova intimação",
    rotuloCurto: "Nova",
    href: "/app/intimacoes/nova",
    icone: FilePlus2,
  },
  { rotulo: "Processos", rotuloCurto: "Processos", href: "/app/processos", icone: FolderOpen },
  { rotulo: "Peças", rotuloCurto: "Peças", href: "/app/pecas", icone: FileText },
  { rotulo: "Meu estilo", rotuloCurto: "Estilo", href: "/app/estilo", icone: PenLine },
];

export function itemEstaAtivo(href: string, caminho: string) {
  if (href === "/app") return caminho === href;
  return caminho === href || caminho.startsWith(`${href}/`);
}
