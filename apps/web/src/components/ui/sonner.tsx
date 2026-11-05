"use client";

import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const cores = {
  "--normal-bg": "var(--popover)",
  "--normal-text": "var(--popover-foreground)",
  "--normal-border": "var(--border)",
} as CSSProperties;

const icones = {
  success: <CircleCheck className="size-5 text-sucesso" />,
  error: <CircleAlert className="size-5 text-erro" />,
  warning: <TriangleAlert className="size-5 text-atencao" />,
  info: <Info className="size-5 text-texto-secundario" />,
};

function Toaster(props: ToasterProps) {
  return (
    <Sonner theme="light" icons={icones} mobileOffset={{ bottom: 80 }} style={cores} {...props} />
  );
}

export { Toaster };
