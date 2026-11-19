import { redirect } from "next/navigation";

type ProcessosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProcessosPage({ searchParams }: ProcessosPageProps) {
  const { novo } = await searchParams;
  redirect(`/app/clientes?aba=processos${novo === "1" ? "&novo=1" : ""}`);
}
