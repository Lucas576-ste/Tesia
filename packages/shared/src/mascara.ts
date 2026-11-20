function asteriscos(quantidade: number) {
  return "*".repeat(Math.max(quantidade, 3));
}

export function mascararNome(nome: string) {
  const [primeiro = "", ...resto] = nome.trim().split(/\s+/);
  if (resto.length === 0) return primeiro;
  const ultimo = resto[resto.length - 1] ?? "";
  return `${primeiro} ${ultimo.charAt(0)}${asteriscos(ultimo.length - 1)}`;
}

export function mascararEmail(email: string) {
  const [usuario = "", dominio = ""] = email.trim().split("@");
  if (!dominio) return asteriscos(usuario.length);
  return `${usuario.slice(0, 2)}${asteriscos(usuario.length - 2)}@${dominio}`;
}

export function mascararTelefone(telefone: string | null) {
  const digitos = (telefone ?? "").replace(/\D/g, "");
  if (digitos.length < 10) return digitos ? asteriscos(digitos.length) : "";
  return `(${digitos.slice(0, 2)}) *****-**${digitos.slice(-2)}`;
}

export function mascararOab(numero: string | null, uf: string | null) {
  if (!numero) return "";
  return `${numero.replace(/[0-9A-Za-z]/g, "*")}${uf ? `/${uf}` : ""}`;
}

export function formatarTelefone(telefone: string | null) {
  const digitos = (telefone ?? "").replace(/\D/g, "");
  if (digitos.length === 11)
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  if (digitos.length === 10)
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return digitos;
}
