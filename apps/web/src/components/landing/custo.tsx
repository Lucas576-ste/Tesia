import { Revelar } from "./revelar";

export function Custo() {
  return (
    <section className="bg-menu text-white">
      <Revelar className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pb-12 text-center text-lg md:pb-16">
        <p>
          Cada prazo carrega a confiança de um cliente e uma reputação construída ao longo de anos.
        </p>
        <p className="text-menu-texto">
          E cada hora escrevendo peça repetida é uma hora a menos atendendo, captando clientes ou
          descansando.
        </p>
      </Revelar>
    </section>
  );
}
