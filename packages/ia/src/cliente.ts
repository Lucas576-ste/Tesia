import Anthropic from "@anthropic-ai/sdk";

export type ClienteIa = Anthropic;

export function criarClienteIa(apiKey: string): ClienteIa {
  return new Anthropic({ apiKey });
}

export function ehErroDefinitivoDaApi(erro: unknown) {
  return (
    erro instanceof Anthropic.BadRequestError ||
    erro instanceof Anthropic.NotFoundError ||
    erro instanceof Anthropic.UnprocessableEntityError
  );
}
