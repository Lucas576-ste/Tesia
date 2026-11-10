import { z } from "zod";

export type EstadoFormulario = {
  erro?: string;
  sucesso?: string;
  email?: string;
};

const email = z.email("Informe um e-mail válido.").trim().toLowerCase();
const novaSenha = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .max(72, "A senha pode ter no máximo 72 caracteres.");

export const cadastroSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome.").max(120),
  email,
  senha: novaSenha,
  aceite: z.literal("on", { error: "Aceite os termos de uso e a política de privacidade." }),
});

export const loginSchema = z.object({
  email,
  senha: z.string().min(1, "Informe a senha."),
  proximo: z.string().optional(),
});

export const recuperacaoSchema = z.object({ email });

export const novaSenhaSchema = z.object({ senha: novaSenha });

const MENSAGENS_ERRO: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_confirmed: "Confirme seu e-mail pelo link que enviamos antes de entrar.",
  user_already_exists: "Já existe uma conta com este e-mail.",
  email_exists: "Já existe uma conta com este e-mail.",
  weak_password: "Escolha uma senha mais forte, com letras e números.",
  same_password: "A nova senha precisa ser diferente da atual.",
  over_email_send_rate_limit: "Muitos e-mails enviados. Tente de novo em alguns minutos.",
  over_request_rate_limit: "Muitas tentativas. Tente de novo em alguns minutos.",
  email_address_invalid: "Este e-mail não foi aceito. Confira o endereço.",
};

export function mensagemErroAutenticacao(codigo: string | undefined) {
  return (codigo && MENSAGENS_ERRO[codigo]) ?? "Não foi possível concluir agora. Tente de novo.";
}

export function primeiroErro(erro: z.ZodError) {
  return erro.issues[0]?.message ?? "Confira os dados informados.";
}

export function destinoSeguro(destino: string | null | undefined, padrao = "/app") {
  if (!destino || !destino.startsWith("/") || destino.startsWith("//") || destino.includes("\\"))
    return padrao;
  return destino;
}
