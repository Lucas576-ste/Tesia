import { Bell, CalendarDays, FileText, LayoutDashboard, Users } from "lucide-react";

const prazos = [
  {
    cliente: "Marina Albuquerque",
    peca: "Contestação",
    processo: "0712345-08.2026.8.07.0001",
    selo: "Vence hoje",
    cor: "bg-red-500/15 text-red-300 ring-red-500/30",
  },
  {
    cliente: "Construtora Planalto",
    peca: "Embargos de declaração",
    processo: "0709876-21.2026.8.07.0016",
    selo: "2 dias úteis",
    cor: "bg-amber-400/15 text-amber-200 ring-amber-400/30",
  },
  {
    cliente: "Ricardo Fontes",
    peca: "Réplica",
    processo: "0701122-33.2026.8.07.0003",
    selo: "6 dias úteis",
    cor: "bg-sky-400/15 text-sky-200 ring-sky-400/30",
  },
  {
    cliente: "Helena Prado",
    peca: "Recurso inominado",
    processo: "0705544-90.2026.8.07.0009",
    selo: "Em dia",
    cor: "bg-emerald-400/15 text-emerald-200 ring-emerald-400/30",
  },
];

const icones = [LayoutDashboard, Bell, CalendarDays, Users, FileText];

export function PainelEscuro() {
  return (
    <div className="flex h-full min-h-80 bg-[#0f1420] md:min-h-[25rem] text-slate-200">
      <nav aria-hidden className="flex w-12 shrink-0 flex-col items-center gap-4 bg-[#0a0e17] py-4">
        <span className="mb-2 grid size-7 place-items-center rounded-md bg-amber-400 text-xs font-bold text-[#0a0e17]">
          T
        </span>
        {icones.map((Icone, i) => (
          <Icone key={i} className={i === 0 ? "size-4 text-amber-300" : "size-4 text-slate-500"} />
        ))}
      </nav>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-base font-semibold text-white">Atenção agora</p>
          <p className="text-xs text-slate-400">Qui, 19 de novembro</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["1", "vence hoje"],
            ["3", "nesta semana"],
            ["12", "em dia"],
          ].map(([n, r]) => (
            <div key={r} className="rounded-lg bg-white/5 py-2">
              <p className="text-lg font-bold text-white tabular-nums">{n}</p>
              <p className="text-xs text-slate-400">{r}</p>
            </div>
          ))}
        </div>
        <ul className="flex flex-col gap-2">
          {prazos.map((p) => (
            <li
              key={p.processo}
              className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3 py-2 ring-1 ring-white/5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {p.peca} · {p.cliente}
                </p>
                <p className="truncate text-xs text-slate-400 tabular-nums">{p.processo}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${p.cor}`}
              >
                {p.selo}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
