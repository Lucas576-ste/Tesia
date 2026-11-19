const conta = [
  ["Publicação", "03/11"],
  ["Início da contagem", "04/11"],
  ["15 dias úteis, sem o feriado de 20/11", ""],
];

export function AnaliseIntimacao() {
  return (
    <div className="grid gap-3 bg-[#0f1420] p-4 text-slate-200 sm:grid-cols-[1.3fr_1fr]">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-amber-300 uppercase">
            O que aconteceu
          </p>
          <p className="mt-1 text-sm text-slate-200">
            O juiz recebeu a ação de cobrança e mandou citar sua cliente para contestar.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-amber-300 uppercase">
            Pode ser atacado
          </p>
          <ul className="mt-1 flex flex-col gap-1 text-sm">
            <li className="rounded-md bg-white/[0.04] px-2 py-1">
              Prescrição de parte das parcelas
            </li>
            <li className="rounded-md bg-white/[0.04] px-2 py-1">Juros acima do contrato</li>
          </ul>
        </div>
        <p className="text-xs text-slate-400">
          Peça sugerida: <span className="font-medium text-white">Contestação</span>
        </p>
      </div>
      <div className="flex flex-col gap-1.5 rounded-lg bg-white/[0.04] p-3 text-xs ring-1 ring-white/5">
        <p className="text-sm font-semibold text-white">A conta do prazo</p>
        {conta.map(([r, v]) => (
          <div key={r} className="flex justify-between gap-2 text-slate-300">
            <span>{r}</span>
            <span className="tabular-nums">{v}</span>
          </div>
        ))}
        <div className="mt-1 flex justify-between rounded-md bg-amber-400/15 px-2 py-1 font-semibold text-amber-200">
          <span>Vencimento</span>
          <span className="tabular-nums">25/11</span>
        </div>
        <span className="mt-1 rounded-md bg-amber-400 py-1 text-center text-xs font-semibold text-[#0a0e17]">
          Confirmar prazo
        </span>
      </div>
    </div>
  );
}
