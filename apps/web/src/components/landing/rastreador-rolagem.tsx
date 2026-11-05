"use client";

import { useEffect } from "react";
import { track } from "@/lib/medicao";

export function RastreadorRolagem() {
  useEffect(() => {
    const disparados = new Set<number>();

    function aoRolar() {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const percentual = (window.scrollY / total) * 100;

      if (percentual >= 50 && !disparados.has(50)) {
        disparados.add(50);
        track("scroll_50");
      }
      if (percentual >= 90 && !disparados.has(90)) {
        disparados.add(90);
        track("scroll_90");
      }
    }

    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  return null;
}
