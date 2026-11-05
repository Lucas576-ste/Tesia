import { CtaCelular, WhatsappFlutuante } from "@/components/landing/acoes-fixas";
import { Areas } from "@/components/landing/areas";
import { ComoFunciona } from "@/components/landing/como-funciona";
import { ConhecaLia } from "@/components/landing/conheca-lia";
import { CtaFinal } from "@/components/landing/cta-final";
import { Custo } from "@/components/landing/custo";
import { Diferenciais } from "@/components/landing/diferenciais";
import { Dor } from "@/components/landing/dor";
import { Fundador } from "@/components/landing/fundador";
import { Heroi } from "@/components/landing/heroi";
import { Perguntas } from "@/components/landing/perguntas";
import { Precos } from "@/components/landing/precos";
import { RastreadorRolagem } from "@/components/landing/rastreador-rolagem";
import { ProvedorMovimento } from "@/components/landing/revelar";
import { Seguranca } from "@/components/landing/seguranca";

export default function LandingPage() {
  return (
    <ProvedorMovimento>
      <Heroi />
      <Dor />
      <Custo />
      <ConhecaLia />
      <ComoFunciona />
      <Diferenciais />
      <Seguranca />
      <Areas />
      <Fundador />
      <Precos />
      <Perguntas />
      <CtaFinal />
      <WhatsappFlutuante />
      <CtaCelular />
      <RastreadorRolagem />
    </ProvedorMovimento>
  );
}
