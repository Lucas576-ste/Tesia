import { Button } from "@/components/ui/button";

type SugestoesLiaProps = { sugestoes: string[]; aoEscolher: (pergunta: string) => void };

export function SugestoesLia({ sugestoes, aoEscolher }: SugestoesLiaProps) {
  return (
    <ul aria-label="Sugestões de perguntas" className="flex flex-wrap gap-2">
      {sugestoes.map((pergunta) => (
        <li key={pergunta}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => aoEscolher(pergunta)}
            className="h-auto rounded-full px-3 py-1.5 text-left whitespace-normal"
          >
            {pergunta}
          </Button>
        </li>
      ))}
    </ul>
  );
}
