import "dotenv/config";
import { db } from "./lib/db";
import { deberes } from "./lib/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  const diaActualStr = "domingo";
  const extrasDeHoy = await db
    .select()
    .from(deberes)
    .where(and(eq(deberes.esObligatorio, false), eq(deberes.activo, true)))
    .then(res => res.filter(d => d.diasDisponibles.includes(diaActualStr)));
  
  console.log("Extras de hoy:", extrasDeHoy.map(e => e.nombre));
}
main();
