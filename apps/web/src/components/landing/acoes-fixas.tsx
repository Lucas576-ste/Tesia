"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/medicao";
import { cn } from "@/lib/utils";

export function WhatsappFlutuante() {
  const numero = process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, "");
  if (!numero) return null;

  return (
    <a
      href={`https://wa.me/${numero}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      onClick={() => track("whatsapp_click")}
      className="fixed right-4 bottom-20 z-40 flex size-12 items-center justify-center rounded-full bg-sucesso-forte text-white shadow-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 md:bottom-4"
    >
      <MessageCircle aria-hidden className="size-6" />
    </a>
  );
}

export function CtaCelular() {
  const [formularioVisivel, setFormularioVisivel] = useState(false);

  useEffect(() => {
    const formulario = document.getElementById("fundador");
    if (!formulario) return;

    const observador = new IntersectionObserver(([entrada]) => {
      setFormularioVisivel(entrada?.isIntersecting ?? false);
    });
    observador.observe(formulario);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-card p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden",
        formularioVisivel && "hidden",
      )}
    >
      <Button asChild className="w-full">
        <a href="#fundador">Quero ser cliente fundador</a>
      </Button>
    </div>
  );
}
