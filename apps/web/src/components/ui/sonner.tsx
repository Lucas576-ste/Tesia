"use client";

import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const cores = {
  "--normal-bg": "var(--popover)",
  "--normal-text": "var(--popover-foreground)",
  "--normal-border": "var(--border)",
  "--success-bg": "var(--color-sucesso-fundo)",
  "--success-text": "var(--color-sucesso)",
  "--success-border": "var(--color-sucesso-fundo)",
  "--error-bg": "var(--color-erro-fundo)",
  "--error-text": "var(--color-erro)",
  "--error-border": "var(--color-erro-fundo)",
} as CSSProperties;

function Toaster(props: ToasterProps) {
  return <Sonner theme="light" richColors mobileOffset={{ bottom: 80 }} style={cores} {...props} />;
}

export { Toaster };
