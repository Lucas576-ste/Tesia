const fases = ["Inicial", "Citação", "Defesa", "Instrução", "Sentença"];
const atual = 2;

export function ClienteProcesso() {
  return (
    <div className="flex flex-col gap-4 bg-[#0f1420] p-4 text-slate-200">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-amber-400/20 text-sm font-semibold text-amber-200">
          MA
        </span>
        <div className="min-w-0">
          <p className="text-base font-semibold text-white">Marina Albuquerque</p>
          <p className="truncate text-xs text-slate-400">2 processos · 1 prazo nesta semana</p>
        </div>
      </div>
      <div className="rounded-lg bg-white/[0.04] p-3 ring-1 ring-white/5">
        <p className="text-sm font-medium text-white">Ação de cobrança · 4ª Vara Cível</p>
        <p className="text-xs text-slate-400 tabular-nums">0712345-08.2026.8.07.0001</p>
        <ol className="mt-4 grid grid-cols-5 gap-1">
          {fases.map((fase, i) => (
            <li key={fase} className="flex flex-col items-center gap-1.5">
              <span
                className={`h-1.5 w-full rounded-full ${
                  i < atual ? "bg-emerald-400/70" : i === atual ? "bg-amber-400" : "bg-white/10"
                }`}
              />
              <span
                className={`text-center text-[0.7rem] leading-tight sm:text-xs ${
                  i === atual ? "font-semibold text-amber-200" : "text-slate-400"
                }`}
              >
                {fase}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex items-center justify-between rounded-lg bg-red-500/10 px-3 py-2 text-sm ring-1 ring-red-500/20">
        <span>Contestação</span>
        <span className="text-xs font-medium text-red-300">Vence em 4 dias úteis</span>
      </div>
    </div>
  );
}
