import { obtenerHogarActualId } from "@/lib/hogar/hogar.service";
import {
  diasEntre,
  formatearFechaISO,
  nombreDiaSemana,
  obtenerFechaDeNegocio,
  sumarDias,
} from "@/lib/shared/date";
import {
  type Asignacion,
  type NuevaAsignacion,
  borrarAsignacionesPorFecha,
  idsAusentesEnFecha,
  insertarAsignaciones,
  listarAsignacionesPorFecha,
  listarDeberesRotativos,
  listarParticipantesActivos,
} from "./rotacion.repo";

/**
 * Motor de rotación.
 *
 * Responsabilidad: decidir, para una fecha dada, QUIÉN hace cada deber rotativo
 * (Cocinar, Lavar los platos, Atender a Sofi...). El resultado se guarda en la
 * tabla `asignaciones`, que es lo que lee la pantalla de inicio.
 *
 * Idea de la rotación (el "círculo que gira"):
 * - Tenemos los deberes rotativos en un orden fijo y los participantes en su
 *   orden de rotación (orden_rotacion).
 * - Cada día el círculo gira una posición: el deber que hoy hace una persona,
 *   mañana lo hace la siguiente, y así. Con 3 personas y 3 deberes, en 3 días
 *   cada quien pasó por los 3 deberes. Es justo y predecible.
 * - El "desfase" del giro se calcula contando los días transcurridos desde una
 *   fecha ancla fija. Así la rotación es DETERMINISTA: para una misma fecha
 *   siempre sale lo mismo, sin importar cuándo se ejecute el motor.
 *
 * Reglas que respeta:
 * - Solo entran deberes `tipo_asignacion = "rotativo"`, activos y con cadencia
 *   diaria (los no negociables del día a día). Los reclamables NO se rotan: se
 *   piden a demanda en otro motor.
 * - Si alguien está de ausencia ese día, se saca del círculo y su lugar lo toma
 *   el siguiente disponible (Art. 4 del reglamento).
 */

/**
 * Fecha ancla del giro. Es solo un punto de referencia para contar días; su
 * valor exacto no importa mientras sea fijo. Domingo 2026-01-04 como inicio.
 */
const ANCLA_ROTACION = new Date(2026, 0, 4);

/** Una fila de asignación ya resuelta (deber → participante) para una fecha. */
export type AsignacionPlan = {
  deberId: string;
  participanteId: string;
  fecha: string;
};

/**
 * Calcula (sin tocar la base de datos) el plan de asignaciones de una fecha:
 * la lista de "este deber lo hace esta persona". Es una función pura, fácil de
 * razonar y de probar.
 */
export function calcularPlan(
  fecha: Date,
  deberesRotativos: { id: string; diasDisponibles: string[]; cadencia: string }[],
  participantesDisponibles: { id: string }[],
): AsignacionPlan[] {
  const fechaStr = formatearFechaISO(fecha);
  const dia = nombreDiaSemana(fecha);

  // Si no hay nadie disponible (todos ausentes), no se asigna nada ese día.
  if (participantesDisponibles.length === 0) return [];

  // Cuántas posiciones giró el círculo desde la fecha ancla.
  const desfase = diasEntre(ANCLA_ROTACION, fecha);

  // Solo deberes diarios que además aplican al día de la semana actual.
  const deberesDelDia = deberesRotativos.filter(
    (d) => d.cadencia === "diaria" && d.diasDisponibles.includes(dia),
  );

  const n = participantesDisponibles.length;
  return deberesDelDia.map((deber, indice) => {
    // El deber en la posición `indice` lo toma el participante desplazado por el
    // giro del día. El módulo (`% n`) hace que el círculo "dé la vuelta".
    const posicion = (((indice + desfase) % n) + n) % n;
    return {
      deberId: deber.id,
      participanteId: participantesDisponibles[posicion].id,
      fecha: fechaStr,
    };
  });
}

/**
 * Genera (y guarda) las asignaciones de una fecha para el hogar actual.
 *
 * Es IDEMPOTENTE: si ya existen asignaciones para esa fecha, por defecto las
 * deja como están y las devuelve (no pisa una edición manual del admin). Para
 * forzar el regenerado, pasar `{ sobrescribir: true }`.
 */
export async function generarAsignacionesParaFecha(
  fecha: Date,
  opciones?: { sobrescribir?: boolean },
): Promise<Asignacion[]> {
  const hogarId = await obtenerHogarActualId();
  const fechaStr = formatearFechaISO(fecha);

  const existentes = await listarAsignacionesPorFecha(hogarId, fechaStr);
  if (existentes.length > 0 && !opciones?.sobrescribir) {
    return existentes;
  }

  const [participantesActivos, deberesRotativos] = await Promise.all([
    listarParticipantesActivos(hogarId),
    listarDeberesRotativos(hogarId),
  ]);

  // Sacar del círculo a quien esté ausente ese día.
  const ausentes = await idsAusentesEnFecha(
    participantesActivos.map((p) => p.id),
    fechaStr,
  );
  const disponibles = participantesActivos.filter((p) => !ausentes.has(p.id));

  const plan = calcularPlan(fecha, deberesRotativos, disponibles);

  const filas: NuevaAsignacion[] = plan.map((p) => ({
    hogarId,
    deberId: p.deberId,
    participanteId: p.participanteId,
    fecha: p.fecha,
  }));

  // Regenerar = borrar lo de ese día y volver a insertar. Así nunca quedan
  // asignaciones duplicadas ni viejas.
  await borrarAsignacionesPorFecha(hogarId, fechaStr);
  return insertarAsignaciones(filas);
}

/** Atajo: genera las asignaciones del día de negocio actual (cierre 3 AM). */
export async function generarAsignacionesDeHoy(opciones?: {
  sobrescribir?: boolean;
}): Promise<Asignacion[]> {
  return generarAsignacionesParaFecha(obtenerFechaDeNegocio(), opciones);
}

/**
 * Genera las asignaciones de varios días seguidos a partir de una fecha.
 * Útil para sembrar la semana o para precalcular el plan. Devuelve cuántas
 * asignaciones se crearon en total.
 */
export async function generarAsignacionesRango(
  fechaInicio: Date,
  cantidadDias: number,
  opciones?: { sobrescribir?: boolean },
): Promise<number> {
  let total = 0;
  for (let i = 0; i < cantidadDias; i++) {
    const fecha = sumarDias(fechaInicio, i);
    const creadas = await generarAsignacionesParaFecha(fecha, opciones);
    total += creadas.length;
  }
  return total;
}
