import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6">
      <span className="text-sm font-semibold tracking-wide text-primaria">Tesia</span>
      <h1 className="text-4xl font-semibold text-texto">Da intimação à peça, no seu estilo</h1>
      <p className="text-lg text-texto-secundario">
        Leia a intimação, confira o prazo com a conta explicada e receba um rascunho escrito do seu
        jeito para revisar e protocolar.
      </p>
      <div>
        <Button>Começar</Button>
      </div>
    </main>
  );
}
