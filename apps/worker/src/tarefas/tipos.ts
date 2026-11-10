import type { SupabaseClient } from "@supabase/supabase-js";
import type { Pool } from "pg";
import type { Job } from "../fila.js";

export type Contexto = {
  db: Pool;
  supabase: SupabaseClient;
};

export type Tarefa = {
  executar: (job: Job, contexto: Contexto) => Promise<void>;
  aoFalhar: (job: Job, contexto: Contexto) => Promise<void>;
};
