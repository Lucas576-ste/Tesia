"use client";

import { formatarTelefone } from "@tesia/shared";
import { useState } from "react";
import { toast } from "sonner";
import { salvarPerfil } from "@/app/onboarding/acoes";
import { FormularioPerfil } from "@/components/onboarding/formulario-perfil";
import { usePlano } from "@/components/plano/provedor-plano";
import { AREAS_ATUACAO, TRIBUNAIS, type Perfil } from "@/lib/onboarding";
import type { PerfilConta } from "@/lib/perfil-conta";
import { lerOabDaBusca } from "@/lib/busca-oab";
import { BlocoBuscaOab } from "./bloco-busca-oab";
import { CampoLeitura, Chips } from "./campo-leitura";
import { CartaoEditavel } from "./cartao-editavel";

function paraFormulario(conta: PerfilConta): Perfil {
  return {
    nome: conta.nome,
    oab: conta.oab ?? "",
    uf: (conta.uf ?? undefined) as Perfil["uf"],
    areas: AREAS_ATUACAO.filter((area) => conta.areas.includes(area)),
    tribunais: TRIBUNAIS.filter((tribunal) => conta.tribunais.includes(tribunal)),
    whatsapp: conta.whatsapp ?? "",
  };
}

function paraConta(atual: PerfilConta, perfil: Perfil): PerfilConta {
  const antiga = lerOabDaBusca(atual.oab, atual.uf);
  const nova = lerOabDaBusca(perfil.oab, perfil.uf);
  const trocouOab = antiga?.numero !== nova?.numero || antiga?.uf !== nova?.uf;
  return {
    ...atual,
    nome: perfil.nome?.trim() || atual.nome,
    oab: perfil.oab,
    uf: perfil.uf,
    areas: perfil.areas,
    tribunais: perfil.tribunais,
    whatsapp: perfil.whatsapp.replace(/\D/g, "") || null,
    buscaOabAceitaEm: trocouOab ? null : atual.buscaOabAceitaEm,
  };
}

export function AbaPerfil({ conta }: { conta: PerfilConta }) {
  const { maxAreas } = usePlano().plano;
  const [exibido, setExibido] = useState(conta);

  return (
    <div className="flex flex-col gap-4">
      <CartaoEditavel
        titulo="Seu perfil"
        leitura={
          <dl className="flex flex-col gap-3">
            <CampoLeitura rotulo="Nome">{exibido.nome}</CampoLeitura>
            <CampoLeitura rotulo="E-mail">{exibido.email}</CampoLeitura>
            <CampoLeitura rotulo="OAB">
              {exibido.oab ? `${exibido.oab}/${exibido.uf ?? ""}` : "Não informada"}
            </CampoLeitura>
            <CampoLeitura rotulo="Áreas de atuação">
              <Chips itens={exibido.areas} vazio="Nenhuma área escolhida" />
            </CampoLeitura>
            <CampoLeitura rotulo="Tribunais">
              <Chips itens={exibido.tribunais} vazio="Nenhum tribunal escolhido" />
            </CampoLeitura>
            <CampoLeitura rotulo="WhatsApp para alertas">
              {exibido.whatsapp ? formatarTelefone(exibido.whatsapp) : "Não informado"}
            </CampoLeitura>
          </dl>
        }
        edicao={(fechar) => (
          <FormularioPerfil
            comNome
            valoresIniciais={paraFormulario(exibido)}
            maxAreas={maxAreas}
            rotuloBotao="Salvar"
            aoCancelar={fechar}
            salvar={async (perfil) => {
              const resultado = await salvarPerfil(perfil);
              if (!resultado.erro) setExibido((atual) => paraConta(atual, perfil));
              return resultado;
            }}
            aoSalvar={() => {
              toast.success("Perfil salvo.");
              fechar();
            }}
          />
        )}
      />
      <BlocoBuscaOab
        oab={lerOabDaBusca(exibido.oab, exibido.uf)}
        informouOab={Boolean(exibido.oab && exibido.uf)}
        aceitaEm={exibido.buscaOabAceitaEm}
        podeGerenciar={exibido.podeGerenciarBusca}
        temPlano={exibido.temPlanoComBusca}
        aoMudar={(buscaOabAceitaEm) => setExibido((atual) => ({ ...atual, buscaOabAceitaEm }))}
      />
    </div>
  );
}
