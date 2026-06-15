import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// El pooler de Supabase (transaction mode) no soporta prepared statements,
// por eso se desactivan aqui.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
