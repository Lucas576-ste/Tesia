function escapar(texto: string) {
  return texto.replace(/[\\()]/g, (c) => `\\${c}`);
}

export function montarPdf(linhas: string[]): Uint8Array {
  const conteudo = [
    "BT /F1 11 Tf 50 780 Td 14 TL",
    ...linhas.map((linha) => `(${escapar(linha)}) Tj T*`),
    "ET",
  ].join("\n");
  const objetos = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${conteudo.length} >>\nstream\n${conteudo}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const posicoes: number[] = [];
  objetos.forEach((objeto, i) => {
    posicoes.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objeto}\nendobj\n`;
  });
  const inicioXref = pdf.length;
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  pdf += posicoes.map((p) => `${String(p).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}
