import { db } from "../lib/db/index";
import { sql } from "drizzle-orm";

async function main() {
  try {
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS "sesiones" (
        "id" text PRIMARY KEY NOT NULL,
        "rol" text NOT NULL,
        "participante_id" uuid,
        "expira_en" timestamp with time zone NOT NULL,
        "creado_en" timestamp with time zone DEFAULT now()
      );
    `));
    console.log("Tabla sesiones creada o verificada.");

    await db.execute(sql.raw(`
      ALTER TABLE "participantes" ADD COLUMN IF NOT EXISTS "pin_hash" text;
    `));
    console.log("Columna pin_hash añadida a participantes.");

    try {
      await db.execute(sql.raw(`
        ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_participante_id_participantes_id_fk" FOREIGN KEY ("participante_id") REFERENCES "public"."participantes"("id") ON DELETE cascade ON UPDATE no action;
      `));
      console.log("FK de sesiones añadida.");
    } catch (e: any) {
      console.log("FK de sesiones ya existe o error:", e.message);
    }

    console.log("Migración aplicada exitosamente.");
    process.exit(0);
  } catch (error) {
    console.error("Error aplicando migración:", error);
    process.exit(1);
  }
}

main();
