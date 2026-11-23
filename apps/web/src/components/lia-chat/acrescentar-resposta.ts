import type { MensagemChat } from "./usar-chat-lia";

export function acrescentarResposta(
  mensagens: MensagemChat[],
  chave: string,
  pedaco: string,
): MensagemChat[] {
  if (mensagens.some((item) => item.chave === chave)) {
    return mensagens.map((item) =>
      item.chave === chave ? { ...item, conteudo: item.conteudo + pedaco } : item,
    );
  }
  return [
    ...mensagens,
    {
      chave,
      mensagemId: null,
      papel: "lia",
      conteudo: pedaco,
      acoes: [],
      avaliacao: null,
    },
  ];
}
