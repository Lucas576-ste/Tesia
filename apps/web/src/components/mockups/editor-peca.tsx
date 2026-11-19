import { Download } from "lucide-react";

function Confirmar({ children }: { children: string }) {
  return (
    <mark className="rounded bg-amber-300/60 px-1 font-sans text-xs font-semibold text-amber-900 ring-1 ring-amber-500/50">
      [CONFIRMAR: {children}]
    </mark>
  );
}

export function EditorPeca() {
  return (
    <div className="flex flex-col gap-3 bg-[#0f1420] p-4 text-slate-200">
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-semibold text-white">Contestação · Marina Albuquerque</p>
        <span className="flex shrink-0 items-center gap-1 rounded-md bg-amber-400 px-2 py-1 text-xs font-semibold text-[#0a0e17]">
          <Download className="size-3.5" />
          Baixar .docx
        </span>
      </div>
      <div className="flex flex-col gap-2 rounded-lg bg-[#f7f3ea] p-4 font-serif text-sm leading-relaxed text-slate-800">
        <p className="text-center font-semibold">DA PRESCRIÇÃO</p>
        <p>
          As parcelas vencidas antes de <Confirmar>data</Confirmar> estão prescritas, nos termos do
          art. 206, § 5º, I, do Código Civil.
        </p>
        <p>
          Ainda que assim não fosse, o contrato prevê juros de <Confirmar>taxa</Confirmar> ao mês,
          muito abaixo do cobrado na inicial.
        </p>
      </div>
      <p className="text-xs text-slate-400">2 pontos para você conferir · estilo: suas 3 peças</p>
    </div>
  );
}
