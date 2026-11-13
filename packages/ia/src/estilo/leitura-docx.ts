import mammoth from "mammoth";

export async function lerDocx(arquivo: Uint8Array) {
  const { value } = await mammoth.extractRawText({ buffer: Buffer.from(arquivo) });
  return value
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function ehDocx(arquivo: Uint8Array) {
  return arquivo[0] === 0x50 && arquivo[1] === 0x4b;
}
