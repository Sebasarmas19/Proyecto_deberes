import { and, between, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { asignaciones, ausencias, registros, transaccionesPuntos } from "@/lib/db/schema";

/**
 * Acceso a datos del motor de rankings. Solo consultas dentro de un rango de
 * fechas (el mes que se está calculando). Los cuatro rankings se DERIVAN de
 * estas filas; no hay tabla de "puntajes" que mantener.
 */

/** Todas las transacciones de puntos del hogar en un rango de fechas. */
export async function listarTransaccionesEnRango(
  hogarId: string,
  desde: string,
  hasta: string,
) {
  return db
    .select()
    .from(transaccionesPuntos)
    .where(
      and(
        eq(transaccionesPuntos.hogarId, hogarId),
        between(transaccionesPuntos.fecha, desde, hasta),
      ),
    );
}

/** Todos los registros del hogar en un rango (para contar cumplimientos). */
export async function listarRegistrosEnRango(
  hogarId: string,
  desde: string,
  hasta: string,
) {
  return db
    .select()
    .from(registros)
    .where(and(eq(registros.hogarId, hogarId), between(registros.fecha, desde, hasta)));
}

/** Todas las asignaciones del hogar en un rango (denominador de "confiable"). */
export async function listarAsignacionesEnRango(
  hogarId: string,
  desde: string,
  hasta: string,
) {
  return db
    .select()
    .from(asignaciones)
    .where(
      and(eq(asignaciones.hogarId, hogarId), between(asignaciones.fecha, desde, hasta)),
    );
}

/**
 * Ausencias que se solapan con el rango (para no contar en el denominador de
 * "confiable" los días en que la persona no estaba). Una ausencia se solapa si
 * empieza antes de que acabe el rango y termina después de que empiece.
 */
export async function listarAusenciasEnRango(
  participanteIds: string[],
  desde: string,
  hasta: string,
) {
  if (participanteIds.length === 0) return [];
  return db
    .select()
    .from(ausencias)
    .where(
      and(
        inArray(ausencias.participanteId, participanteIds),
        lte(ausencias.fechaInicio, hasta),
        gte(ausencias.fechaFin, desde),
      ),
    );
}
