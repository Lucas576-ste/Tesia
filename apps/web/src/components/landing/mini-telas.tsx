import { CheckCircle2, FileText, Upload } from "lucide-react";
import type { ReactNode } from "react";
import { SeloStatus } from "@/components/selo-status";
import type { StatusPrazo } from "@/lib/prazo";
import { cn } from "@/lib/utils";
import { AvatarLia } from "./avatar-lia";

function TelaMini({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div aria-hidden className="text-xs">
      <p className="flex items-center gap-2 bg-menu px-3 py-2 font-medium text-white">
        <span className="size-2 rounded-full bg-destaque" />
        {titulo}
      </p>
      <div className="flex flex-col gap-2 p-3">{children}</div>
    </div>
  );
}

function BalaoLia({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <AvatarLia />
      <p className="rounded-lg rounded-tl-none bg-primaria-fundo px-2 py-1.5 text-texto">
        {children}
      </p>
    </div>
  );
}

function Pendencia({ children }: { children: ReactNode }) {
  return <span className="rounded-sm bg-destaque px-1 font-medium text-menu">{children}</span>;
}

export function MiniUpload() {
  return (
    <TelaMini titulo="Nova intimação">
      <BalaoLia>Recebi! Já estou lendo para você.</BalaoLia>
      <div className="flex flex-col items-center gap-1 rounded-lg border-2 border-dashed border-primaria bg-primaria-fundo p-3 text-center">
        <Upload className="size-5 text-primaria" />
        <p className="font-medium">Arraste os PDFs ou clique para escolher</p>
      </div>
      {["intimacao-contestacao.pdf", "decisao-recurso.pdf"].map((arquivo) => (
        <p key={arquivo} className="flex items-center gap-2 rounded-md border bg-card p-2">
          <FileText className="size-4 shrink-0 text-erro" />
          <span className="min-w-0 flex-1 break-all">{arquivo}</span>
          <CheckCircle2 className="size-4 shrink-0 text-sucesso" />
        </p>
      ))}
    </TelaMini>
  );
}

const contaPrazo = [
  { rotulo: "Publicação", valor: "03/11/2026" },
  { rotulo: "Prazo", valor: "15 dias úteis" },
];

export function MiniAnalise({ comConta = true }: { comConta?: boolean }) {
  return (
    <TelaMini titulo="Análise da intimação">
      <BalaoLia>Li a intimação. Aqui está o que importa:</BalaoLia>
      <p className="font-serif text-sm font-semibold">Banco X x Maria Souza</p>
      <div className="rounded-md border-l-4 border-primaria bg-primaria-fundo p-2">
        <p className="font-semibold text-primaria">O que aconteceu</p>
        <p>Citação em ação de cobrança de cartão de crédito.</p>
      </div>
      <div className="rounded-md border-l-4 border-atencao bg-atencao-fundo p-2">
        <p className="font-semibold text-atencao">Pontos a verificar</p>
        <ul className="list-inside list-disc">
          <li>Contrato não juntado aos autos</li>
          <li>Prescrição da dívida</li>
        </ul>
      </div>
      {comConta && (
        <dl className="flex flex-col gap-1 rounded-md border p-2">
          {contaPrazo.map(({ rotulo, valor }) => (
            <div key={rotulo} className="flex justify-between gap-2">
              <dt>{rotulo}</dt>
              <dd className="tabular-nums">{valor}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-2 rounded-sm bg-destaque px-1 font-semibold text-menu">
            <dt>Vencimento</dt>
            <dd className="tabular-nums">25/11/2026</dd>
          </div>
        </dl>
      )}
      <p className="rounded-md bg-sucesso-fundo p-2 text-sucesso">
        <span className="font-semibold">Peça sugerida:</span> Contestação
      </p>
    </TelaMini>
  );
}

export function MiniRascunho() {
  return (
    <TelaMini titulo="Rascunho da peça">
      <BalaoLia>Escrevi no seu estilo e marquei 2 pontos para você conferir.</BalaoLia>
      <p className="text-center font-serif text-sm font-semibold">CONTESTAÇÃO</p>
      <p>
        Maria Souza, já qualificada nos autos, vem apresentar contestação à ação movida por Banco X.
      </p>
      <p>
        O autor não juntou o contrato que fundamenta a cobrança, ônus que lhe cabe (CPC, art. 373,
        I). <Pendencia>[CONFIRMAR] Citação a conferir</Pendencia>
      </p>
      <p>
        A última fatura em aberto venceu em <Pendencia>[CONFIRMAR] data da fatura</Pendencia>.
      </p>
      <span className="self-end rounded-md bg-primaria px-2 py-1 font-medium text-white">
        Baixar .docx
      </span>
    </TelaMini>
  );
}

const indicadores = [
  { valor: "3", rotulo: "Vencem em até 3 dias", cor: "bg-erro-fundo text-erro" },
  { valor: "2", rotulo: "Rascunhos", cor: "bg-atencao-fundo text-atencao" },
  { valor: "12", rotulo: "Protocolados", cor: "bg-sucesso-fundo text-sucesso" },
];

const prazos: { partes: string; dias: string; cor: string; filete: string; status: StatusPrazo }[] =
  [
    {
      partes: "João Lima x Construtora Y",
      dias: "Hoje",
      cor: "text-erro",
      filete: "border-erro",
      status: "nao_iniciado",
    },
    {
      partes: "Paulo Araújo x Seguradora Z",
      dias: "Amanhã",
      cor: "text-erro",
      filete: "border-erro",
      status: "rascunho_pronto",
    },
    {
      partes: "Banco X x Maria Souza",
      dias: "2 dias úteis",
      cor: "text-atencao",
      filete: "border-atencao",
      status: "nao_iniciado",
    },
  ];

export function MiniPainel() {
  return (
    <TelaMini titulo="Painel de prazos">
      <div className="grid grid-cols-3 gap-2">
        {indicadores.map(({ valor, rotulo, cor }) => (
          <p key={rotulo} className={cn("rounded-md p-2", cor)}>
            <span className="block font-serif text-lg font-semibold tabular-nums">{valor}</span>
            {rotulo}
          </p>
        ))}
      </div>
      <ul className="flex flex-col gap-2">
        {prazos.map(({ partes, dias, cor, filete, status }) => (
          <li key={partes} className={cn("rounded-md border border-l-4 p-2", filete)}>
            <p className="font-medium">{partes}</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <span className={cn("font-medium", cor)}>{dias}</span>
              <SeloStatus status={status} />
            </div>
          </li>
        ))}
      </ul>
    </TelaMini>
  );
}
