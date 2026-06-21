import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS suscripciones_push (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
      endpoint TEXT NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  console.log("Tabla creada exitosamente");
  process.exit(0);
}
main().catch(console.error);
