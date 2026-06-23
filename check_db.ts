import "dotenv/config";
import { db } from "./lib/db/index.js";
import { hogar, participantes, deberes, asignaciones } from "./lib/db/schema.js";

async function check() {
  const h = await db.select().from(hogar);
  const p = await db.select().from(participantes);
  const d = await db.select().from(deberes);
  const a = await db.select().from(asignaciones);
  console.log("Hogar:", h[0]?.nombre);
  console.log("Participantes:", p.map(x => x.nombre));
  console.log("Deberes creados:", d.length);
  console.log("Asignaciones creadas:", a.length);
  process.exit(0);
}
check();
