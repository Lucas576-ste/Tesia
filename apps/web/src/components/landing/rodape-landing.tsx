import Link from "next/link";
import { SimboloTesia } from "@/components/layout/simbolo-tesia";
import { Confirmar } from "./confirmar";

const links = [
  { rotulo: "Como funciona", href: "/#como-funciona" },
  { rotulo: "Preços", href: "/#precos" },
  { rotulo: "Perguntas frequentes", href: "/#perguntas" },
  { rotulo: "Termos de uso", href: "/termos" },
  { rotulo: "Privacidade", href: "/privacidade" },
];

export function RodapeLanding() {
  const email = process.env.NEXT_PUBLIC_CONTATO_EMAIL;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP;

  return (
    <footer className="border-t bg-card pb-16 md:pb-0">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-texto-secundario">
        <p className="flex items-center gap-2 text-texto">
          <SimboloTesia />
          Tesia — da intimação à peça, no seu estilo.
        </p>
        <nav aria-label="Rodapé" className="flex flex-wrap gap-x-4 gap-y-1">
          {links.map(({ rotulo, href }) => (
            <Link key={href} href={href} className="hover:text-texto hover:underline">
              {rotulo}
            </Link>
          ))}
        </nav>
        {(email || whatsapp) && (
          <p>
            Contato: {email} {email && whatsapp && "·"} {whatsapp}
          </p>
        )}
        <p>
          <Confirmar motivo="CNPJ e razão social">CNPJ e razão social</Confirmar>
        </p>
        <p>
          A Tesia é uma ferramenta de apoio. A revisão e a responsabilidade pelas peças e prazos são
          do advogado.
        </p>
      </div>
    </footer>
  );
}
