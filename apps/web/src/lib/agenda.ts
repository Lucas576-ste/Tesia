export const TOKEN_AGENDA = /^[0-9a-f]{48}$/;

export function linkAgenda(origem: string, token: string) {
  return `${origem.replace(/\/$/, "")}/agenda/${token}.ics`;
}
