import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

async function main() {
  console.log("Iniciando reinicio completo de la base de datos...");
  try {
    const tables = [
      'sesiones',
      'asignaciones',
      'fotos_motivacionales',
      'plan_semanal',
      'suscripciones_push',
      'registros',
      'transacciones_puntos',
      'registro_auditoria',
      'ausencias',
      'criterios_deber',
      'logros_obtenidos',
      'titulos_mes',
      'deberes',
      'participantes',
      'hogar'
    ];

    for (const table of tables) {
      console.log(`Truncando tabla ${table}...`);
      await db.execute(sql.raw(`TRUNCATE TABLE "${table}" CASCADE;`));
    }

    console.log("✅ Base de datos reiniciada con exito.");
    console.log("Ya puedes abrir la aplicacion y te llevara al Setup Inicial.");
  } catch (error) {
    console.error("❌ Error al reiniciar la base de datos:", error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

main();
