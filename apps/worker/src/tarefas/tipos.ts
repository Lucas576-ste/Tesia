import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClienteIa } from "@tesia/ia";
import type { Pool } from "pg";
import type { Job } from "../fila.js";

export type Contexto = {
  db: Pool;
  supabase: SupabaseClient;
  ia: ClienteIa;
  registrar: Registrar;
};

export type Registrar = (evento: string, dados: Record<string, unknown>) => void;

export type Tarefa = {
  executar: (job: Job, contexto: Contexto) => Promise<void>;
  aoFalhar: (job: Job, contexto: Contexto) => Promise<void>;
};
