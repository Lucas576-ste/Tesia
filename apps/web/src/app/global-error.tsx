"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "sans-serif", padding: 24 }}>
        <h1>Algo deu errado.</h1>
        <p>Já fomos avisados. Tente de novo em instantes.</p>
        <button type="button" onClick={() => retry()}>
          Tentar de novo
        </button>
      </body>
    </html>
  );
}
