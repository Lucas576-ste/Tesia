import { vi } from "vitest";
import type { ClienteIa } from "../src/cliente.js";

export function clienteFalso(saida: unknown, stopReason = "end_turn") {
  const parse = vi.fn(async () => ({
    stop_reason: stopReason,
    parsed_output: saida,
    usage: {
      input_tokens: 3000,
      output_tokens: 500,
      cache_read_input_tokens: 0,
      cache_creation_input_tokens: 0,
    },
  }));
  return { cliente: { messages: { parse } } as unknown as ClienteIa, parse };
}
