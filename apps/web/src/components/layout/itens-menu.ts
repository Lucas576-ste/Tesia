import {
  CalendarClock,
  FileText,
  Gift,
  Inbox,
  LayoutDashboard,
  PenLine,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type ItemMenu = {
  rotulo: string;
  rotuloCurto: string;
  href: string;
  icone: LucideIcon;
  tambem?: string[];
  contador?: "intimacoes" | "rascunhos";
  foraDoCelular?: boolean;
};

export const itensMenu: ItemMenu[] = [
  { rotulo: "Painel", rotuloCurto: "Painel", href: "/app", icone: LayoutDashboard },
  {
    rotulo: "Intimações",
    rotuloCurto: "Intimações",
    href: "/app/intimacoes",
    icone: Inbox,
    contador: "intimacoes",
  },
  { rotulo: "Prazos", rotuloCurto: "Prazos", href: "/app/prazos", icone: CalendarClock },
  {
    rotulo: "Peças",
    rotuloCurto: "Peças",
    href: "/app/pecas",
    icone: FileText,
    contador: "rascunhos",
  },
  {
    rotulo: "Clientes",
    rotuloCurto: "Clientes",
    href: "/app/clientes",
    icone: Users,
    tambem: ["/app/processos"],
  },
  {
    rotulo: "Meu estilo",
    rotuloCurto: "Estilo",
    href: "/app/estilo",
    icone: PenLine,
    foraDoCelular: true,
  },
];

export const itemIndicar: ItemMenu = {
  rotulo: "Indicar a Tesia",
  rotuloCurto: "Indicar",
  href: "/app/indicar",
  icone: Gift,
};

export const itemConfiguracoes: ItemMenu = {
  rotulo: "Configurações",
  rotuloCurto: "Config.",
  href: "/app/configuracoes",
  icone: Settings,
};

function corresponde(href: string, caminho: string) {
  if (href === "/app") return caminho === href;
  return caminho === href || caminho.startsWith(`${href}/`);
}

export function itemEstaAtivo(href: string, caminho: string) {
  const item = [...itensMenu, itemIndicar, itemConfiguracoes].find((atual) => atual.href === href);
  return [href, ...(item?.tambem ?? [])].some((alvo) => corresponde(alvo, caminho));
}
