import "dotenv/config";
import { db } from "../lib/db";
import { registros, transaccionesPuntos } from "../lib/db/schema";

async function main() {
  console.log("Limpiando registros de cumplimiento de hoy y puntos...");

  await db.delete(registros);
  console.log("Registros de deberes limpiados.");

  await db.delete(transaccionesPuntos);
  console.log("Transacciones de puntos limpiadas (todos en 0).");

  console.log("¡Listo! Base de datos reiniciada para pruebas.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
