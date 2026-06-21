import { generarAsignacionesPorFecha } from "./lib/rotacion/rotacion.service";
import { obtenerFechaDeNegocio } from "./lib/shared/date";

async function main() {
  const hoy = obtenerFechaDeNegocio();
  console.log("Generando para hoy:", hoy);
  const asignaciones = await generarAsignacionesPorFecha(hoy);
  console.log("Asignaciones generadas:", asignaciones.length);
  process.exit(0);
}
main().catch(console.error);
