import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Limpiando la base de datos por completo...");
  await db.execute(sql`TRUNCATE TABLE hogar CASCADE`);
  console.log("Base de datos vacía. Lista para el wizard de onboarding.");
  process.exit(0);
}
main();
