import Link from "next/link";
import { SimboloTesia } from "@/components/layout/simbolo-tesia";
import { SeletorTema } from "@/components/tema/seletor-tema";
import { Button } from "@/components/ui/button";

const links = [
  { rotulo: "Como funciona", href: "/#como-funciona" },
  { rotulo: "Preços", href: "/#precos" },
  { rotulo: "Perguntas", href: "/#perguntas" },
];

export function CabecalhoLanding() {
  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4">
        <Link
          href="/"
          className="mr-auto flex min-h-9 items-center gap-2 font-serif text-lg font-semibold"
        >
          <SimboloTesia />
          Tesia
        </Link>
        <nav aria-label="Seções da página" className="hidden items-center gap-1 lg:flex">
          {links.map(({ rotulo, href }) => (
            <Button key={href} asChild variant="ghost" size="sm">
              <Link href={href}>{rotulo}</Link>
            </Button>
          ))}
        </nav>
        <SeletorTema />
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Entrar</Link>
        </Button>
        <Button asChild size="sm" className="hidden md:inline-flex">
          <Link href="/#fundador">Quero ser cliente fundador</Link>
        </Button>
      </div>
    </header>
  );
}
