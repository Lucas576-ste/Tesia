export function somenteDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

function digitoVerificador(base: string, pesos: number[]) {
  const soma = pesos.reduce((total, peso, i) => total + Number(base[i]) * peso, 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function validarCpf(valor: string) {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const d1 = digitoVerificador(cpf, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = digitoVerificador(cpf, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
}

export function validarCnpj(valor: string) {
  const cnpj = somenteDigitos(valor);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const d1 = digitoVerificador(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = digitoVerificador(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === Number(cnpj[12]) && d2 === Number(cnpj[13]);
}

export function mascararCpf(valor: string) {
  return somenteDigitos(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function mascararCnpj(valor: string) {
  return somenteDigitos(valor)
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function mascararDocumento(valor: string, tipo: "pf" | "pj") {
  return tipo === "pf" ? mascararCpf(valor) : mascararCnpj(valor);
}
