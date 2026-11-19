import { CheckCircle2 } from "lucide-react";

const intimacoes = [
  { origem: "DJEN", cliente: "Marina Albuquerque", ato: "Citação · 4ª Vara Cível", hora: "08:02" },
  { origem: "DJEN", cliente: "Construtora Planalto", ato: "Sentença publicada", hora: "08:02" },
  { origem: "PDF", cliente: "Ricardo Fontes", ato: "Decisão interlocutória", hora: "09:41" },
  { origem: "DJEN", cliente: "Helena Prado", ato: "Intimação para réplica", hora: "08:02" },
];

export function CaixaIntimacoes() {
  return (
    <div className="flex flex-col gap-3 bg-[#0f1420] p-4 text-slate-200">
      <div className="flex items-baseline justify-between">
        <p className="text-base font-semibold text-white">Intimações de hoje</p>
        <p className="text-xs text-amber-300">4 novas · OAB/DF 12.345</p>
      </div>
      <ul className="flex flex-col gap-2">
        {intimacoes.map((i) => (
          <li
            key={i.cliente}
            className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2 ring-1 ring-white/5"
          >
            <span
              className={`w-11 shrink-0 rounded-md py-0.5 text-center text-xs font-semibold ${
                i.origem === "DJEN"
                  ? "bg-amber-400/15 text-amber-200"
                  : "bg-sky-400/15 text-sky-200"
              }`}
            >
              {i.origem}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{i.cliente}</p>
              <p className="truncate text-xs text-slate-400">{i.ato}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-xs text-emerald-300">
              <CheckCircle2 className="size-3.5" />
              Analisada
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
