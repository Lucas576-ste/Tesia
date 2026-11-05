import { BrainCircuit, Download, ShieldCheck, UserCheck } from "lucide-react";
import { Confirmar, mostrarConfirmar } from "./confirmar";
import { SecaoLanding } from "./secao-landing";

export function Seguranca() {
  return (
    <SecaoLanding titulo="Você continua no comando.">
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-6">
        <li className="flex flex-col gap-2">
          <UserCheck aria-hidden className="size-5 text-primaria" />
          <h3 className="text-lg font-semibold">Você revisa e decide.</h3>
          <p className="text-sm text-texto-secundario">
            Nenhum prazo entra no painel sem a sua confirmação. Nenhuma peça é protocolada pela
            Tesia.
          </p>
        </li>
        <li className="flex flex-col gap-2">
          <ShieldCheck aria-hidden className="size-5 text-primaria" />
          <h3 className="text-lg font-semibold">Seus dados protegidos.</h3>
          <p className="text-sm text-texto-secundario">
            Arquivos e banco de dados armazenados no Brasil, com criptografia e acesso restrito ao
            seu escritório.
          </p>
        </li>
        {mostrarConfirmar && (
          <li className="flex flex-col gap-2">
            <BrainCircuit aria-hidden className="size-5 text-primaria" />
            <h3 className="text-lg font-semibold">
              <Confirmar motivo="termos atuais do provedor de IA">
                IA sem treinar com os seus casos.
              </Confirmar>
            </h3>
            <p className="text-sm">
              <Confirmar motivo="termos atuais do provedor de IA">
                Os documentos são usados apenas para gerar a sua análise e o seu rascunho.
              </Confirmar>
            </p>
          </li>
        )}
        <li className="flex flex-col gap-2">
          <Download aria-hidden className="size-5 text-primaria" />
          <h3 className="text-lg font-semibold">Seus dados são seus.</h3>
          <p className="text-sm text-texto-secundario">
            Exporte tudo quando quiser, inclusive ao cancelar.
          </p>
        </li>
      </ul>
    </SecaoLanding>
  );
}
