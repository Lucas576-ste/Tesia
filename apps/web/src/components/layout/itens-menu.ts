import {
  FilePlus2,
  FileText,
  FolderOpen,
  Inbox,
  Gift,
  LayoutDashboard,
  PenLine,
  Settings,
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
  { rotulo: "Intimações", rotuloCurto: "Intimações", href: "/app/intimacoes", icone: Inbox },
  { rotulo: "Processos", rotuloCurto: "Processos", href: "/app/processos", icone: FolderOpen },
  { rotulo: "Peças", rotuloCurto: "Peças", href: "/app/pecas", icone: FileText },
  { rotulo: "Meu estilo", rotuloCurto: "Estilo", href: "/app/estilo", icone: PenLine },
];

export const itemIndicar: ItemMenu = {
  rotulo: "Indicar a Tesia",
  rotuloCurto: "Indicar",
  href: "/app/indicar",
  icone: Gift,
};

function corresponde(href: string, caminho: string) {
  if (href === "/app") return caminho === href;
  return caminho === href || caminho.startsWith(`${href}/`);
}

export const itemConfiguracoes: ItemMenu = {
  rotulo: "Configurações",
  rotuloCurto: "Config.",
  href: "/app/configuracoes",
  icone: Settings,
};

export function itemEstaAtivo(href: string, caminho: string) {
  if (!corresponde(href, caminho)) return false;
  return !itensMenu.some(
    (item) => item.href.length > href.length && corresponde(item.href, caminho),
  );
}
