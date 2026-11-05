import { NextResponse } from "next/server";
import { envioLeadSchema } from "@/lib/lead";

export async function POST(request: Request) {
  const corpo = await request.json().catch(() => null);
  const resultado = envioLeadSchema.safeParse(corpo);

  if (!resultado.success) {
    return NextResponse.json({ status: "invalido" }, { status: 400 });
  }

  if (process.env.NODE_ENV === "development") {
    return NextResponse.json({ status: "simulado" });
  }

  return NextResponse.json({ status: "fechado" }, { status: 503 });
}
