import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Confirmar, mostrarConfirmar } from "./confirmar";
import { SecaoLanding } from "./secao-landing";

const linhas = [
  [
    "Lê a intimação e resume o que aconteceu",
    "Sim",
    "Só se você colar o texto",
    "Em alguns planos",
  ],
  ["Calcula o prazo e mostra a conta", "Sim", "Não", "Calcula, sem detalhar a conta"],
  ["Escreve no seu estilo, a partir das suas peças", "Sim", "Não", "Usa modelos prontos"],
  ["Usa os documentos do processo", "Sim", "Só se você colar", "Varia"],
  ["Destaca o que precisa ser conferido", "Sim", "Não", "Não"],
  ["Pensada para o advogado solo", "Sim", "—", "Pensados para escritórios"],
];

const destaques = [
  {
    titulo: "A Lia escreve como você.",
    texto: "Aprende com as suas peças antigas, não com um modelo genérico.",
  },
  {
    titulo: "Prazo com a conta à vista.",
    texto: "A IA lê o documento; o cálculo é feito por regras fixas, e você vê cada etapa.",
  },
  {
    titulo: "Nada de jurisprudência inventada sem aviso.",
    texto: "Toda citação aparece marcada para você conferir na fonte oficial.",
  },
];

const colunaConfirmar = "bg-amber-200 text-menu";

export function Diferenciais() {
  return (
    <SecaoLanding fundo="branco" titulo="Feita para escrever como você, não como uma máquina.">
      <ul className="flex flex-col gap-3 md:hidden">
        {linhas.map(([recurso, tesia, ia, gestao]) => (
          <li key={recurso} className="rounded-xl border p-4">
            <h3 className="font-sans text-sm font-semibold">{recurso}</h3>
            <dl className="mt-2 flex flex-col gap-1 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-texto-secundario">Tesia</dt>
                <dd className="text-right font-medium text-sucesso">{tesia}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-texto-secundario">IA genérica</dt>
                <dd className="text-right">{ia}</dd>
              </div>
              {mostrarConfirmar && (
                <div
                  data-confirmar
                  className={cn(colunaConfirmar, "flex justify-between gap-4 rounded-sm px-1")}
                >
                  <dt className="shrink-0">Sistemas de gestão</dt>
                  <dd className="text-right">{gestao}</dd>
                </div>
              )}
            </dl>
          </li>
        ))}
      </ul>
      <div className="hidden rounded-xl border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <span className="sr-only">Recurso</span>
              </TableHead>
              <TableHead>Tesia</TableHead>
              <TableHead>IA genérica</TableHead>
              {mostrarConfirmar && (
                <TableHead data-confirmar className={colunaConfirmar}>
                  Sistemas de gestão completos
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map(([recurso, tesia, ia, gestao]) => (
              <TableRow key={recurso}>
                <TableCell className="font-medium">{recurso}</TableCell>
                <TableCell className="font-medium text-sucesso">{tesia}</TableCell>
                <TableCell className="text-texto-secundario">{ia}</TableCell>
                {mostrarConfirmar && <TableCell className={colunaConfirmar}>{gestao}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs">
        <Confirmar motivo="revisar a coluna antes de publicar; não citar nomes de concorrentes">
          Coluna de sistemas de gestão
        </Confirmar>
      </p>
      <ul className="grid gap-6 md:grid-cols-3">
        {destaques.map(({ titulo, texto }) => (
          <li key={titulo}>
            <h3 className="text-lg font-semibold">{titulo}</h3>
            <p className="mt-1 text-sm text-texto-secundario">{texto}</p>
          </li>
        ))}
      </ul>
    </SecaoLanding>
  );
}
