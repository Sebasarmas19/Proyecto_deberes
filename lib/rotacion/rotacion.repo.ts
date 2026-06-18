import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { asignaciones, ausencias, deberes, participantes } from "@/lib/db/schema";

/**
 * Acceso a datos del motor de rotación. Solo consultas a la base de datos;
 * la lógica de "quién hace qué" vive en rotacion.service.ts.
 */

export type Asignacion = typeof asignaciones.$inferSelect;
export type NuevaAsignacion = typeof asignaciones.$inferInsert;

/** Participantes activos del hogar, ordenados por su posición en el círculo. */
export async function listarParticipantesActivos(hogarId: string) {
  return db
    .select()
    .from(participantes)
    .where(and(eq(participantes.hogarId, hogarId), eq(participantes.activo, true)))
    .orderBy(asc(participantes.ordenRotacion), asc(participantes.creadoEn));
}

/** Deberes rotativos y activos del hogar (los que entran al círculo). */
export async function listarDeberesRotativos(hogarId: string) {
  return db
    .select()
    .from(deberes)
    .where(
      and(
        eq(deberes.hogarId, hogarId),
        eq(deberes.tipoAsignacion, "rotativo"),
        eq(deberes.activo, true),
      ),
    )
    .orderBy(asc(deberes.creadoEn), asc(deberes.nombre));
}

/**
 * IDs de los participantes (de una lista dada) que están ausentes en `fechaStr`.
 * Una ausencia cubre desde `fechaInicio` hasta `fechaFin`, ambos inclusive.
 */
export async function idsAusentesEnFecha(
  participanteIds: string[],
  fechaStr: string,
): Promise<Set<string>> {
  if (participanteIds.length === 0) return new Set();

  const filas = await db
    .select({ participanteId: ausencias.participanteId })
    .from(ausencias)
    .where(
      and(
        inArray(ausencias.participanteId, participanteIds),
        lte(ausencias.fechaInicio, fechaStr),
        gte(ausencias.fechaFin, fechaStr),
      ),
    );

  return new Set(filas.map((f) => f.participanteId));
}

/** Asignaciones ya existentes para un hogar en una fecha concreta. */
export async function listarAsignacionesPorFecha(
  hogarId: string,
  fechaStr: string,
): Promise<Asignacion[]> {
  return db
    .select()
    .from(asignaciones)
    .where(
      and(eq(asignaciones.hogarId, hogarId), eq(asignaciones.fecha, fechaStr)),
    );
}

/** Borra todas las asignaciones de un hogar en una fecha (para regenerarlas). */
export async function borrarAsignacionesPorFecha(
  hogarId: string,
  fechaStr: string,
): Promise<void> {
  await db
    .delete(asignaciones)
    .where(
      and(eq(asignaciones.hogarId, hogarId), eq(asignaciones.fecha, fechaStr)),
    );
}

/** Inserta una tanda de asignaciones y devuelve las filas creadas. */
export async function insertarAsignaciones(
  valores: NuevaAsignacion[],
): Promise<Asignacion[]> {
  if (valores.length === 0) return [];
  return db.insert(asignaciones).values(valores).returning();
}
