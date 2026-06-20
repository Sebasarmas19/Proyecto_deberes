import { and, asc, eq, gte, lte } from "drizzle-orm";
import { db } from "../db";
import {
  asignaciones,
  deberes,
  hogar,
  participantes,
} from "../db/schema";
import {
  formatearFechaISO,
  obtenerFechaDeNegocio,
  sumarDias,
} from "../shared/date";

/**
 * Datos consolidados para el Dashboard del Admin.
 */

export type ParticipanteResumen = {
  id: string;
  nombre: string;
};

export type PlanSemanalFila = {
  participanteNombre: string;
  /** Mapa de día ("lun", "mar", ...) → nombre del deber asignado o null. */
  dias: Record<string, string | null>;
};

export type AdminDashboardData = {
  nombreHogar: string;
  participantes: ParticipanteResumen[];
  planSemanal: PlanSemanalFila[];
  /** Etiquetas cortas de los días de la semana que se muestran. */
  diasLabels: { clave: string; label: string }[];
};

/**
 * Obtiene todos los datos necesarios para renderizar el dashboard del Admin.
 */
export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  // 1. Obtener hogar
  const [hogarActual] = await db.select().from(hogar).limit(1);
  if (!hogarActual) throw new Error("No hay un hogar configurado.");

  // 2. Obtener participantes activos
  const activos = await db
    .select({ id: participantes.id, nombre: participantes.nombre })
    .from(participantes)
    .where(
      and(
        eq(participantes.hogarId, hogarActual.id),
        eq(participantes.activo, true),
      ),
    )
    .orderBy(asc(participantes.ordenRotacion));

  // 3. Calcular el rango de la semana actual (lunes a domingo)
  const hoy = obtenerFechaDeNegocio();
  const diaSemana = hoy.getDay(); // 0=domingo
  const diasDesdeLunes = (diaSemana + 6) % 7;
  const lunes = sumarDias(hoy, -diasDesdeLunes);
  const domingo = sumarDias(lunes, 6);

  // 4. Obtener TODAS las asignaciones de esta semana
  const asignacionesSemana = await db
    .select({
      fecha: asignaciones.fecha,
      participanteId: asignaciones.participanteId,
      deberNombre: deberes.nombre,
    })
    .from(asignaciones)
    .innerJoin(deberes, eq(asignaciones.deberId, deberes.id))
    .where(
      and(
        eq(asignaciones.hogarId, hogarActual.id),
        gte(asignaciones.fecha, formatearFechaISO(lunes)),
        lte(asignaciones.fecha, formatearFechaISO(domingo)),
      ),
    );

  // 5. Construir las etiquetas de los 7 días
  const diasLabels = [
    { clave: "lun", label: "Lun" },
    { clave: "mar", label: "Mar" },
    { clave: "mie", label: "Mié" },
    { clave: "jue", label: "Jue" },
    { clave: "vie", label: "Vie" },
    { clave: "sab", label: "Sáb" },
    { clave: "dom", label: "Dom" },
  ];

  // Mapa de fecha ISO → clave del día
  const fechaAClave = new Map<string, string>();
  for (let i = 0; i < 7; i++) {
    const fecha = sumarDias(lunes, i);
    fechaAClave.set(formatearFechaISO(fecha), diasLabels[i].clave);
  }

  // 6. Armar la tabla: una fila por participante, con las asignaciones por día
  const planSemanal: PlanSemanalFila[] = activos.map((p) => {
    const dias: Record<string, string | null> = {};
    for (const d of diasLabels) {
      dias[d.clave] = null;
    }

    // Llenar con las asignaciones reales
    for (const a of asignacionesSemana) {
      if (a.participanteId === p.id) {
        const clave = fechaAClave.get(a.fecha);
        if (clave) {
          dias[clave] = a.deberNombre;
        }
      }
    }

    return {
      participanteNombre: p.nombre,
      dias,
    };
  });

  return {
    nombreHogar: hogarActual.nombre,
    participantes: activos,
    planSemanal,
    diasLabels,
  };
}
