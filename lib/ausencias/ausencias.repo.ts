import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ausencias, participantes } from "@/lib/db/schema";

/**
 * Acceso a datos de ausencias. La tabla `ausencias` cuelga del participante
 * (no tiene hogar_id), así que para listarlas por hogar unimos con participantes.
 */

export type Ausencia = typeof ausencias.$inferSelect;
export type NuevaAusencia = typeof ausencias.$inferInsert;

export async function insertarAusencia(valores: NuevaAusencia): Promise<Ausencia> {
  const [fila] = await db.insert(ausencias).values(valores).returning();
  return fila;
}

export async function obtenerAusencia(id: string): Promise<Ausencia | undefined> {
  const [fila] = await db.select().from(ausencias).where(eq(ausencias.id, id)).limit(1);
  return fila;
}

/** Ausencias del hogar (con el nombre del participante), más recientes primero. */
export async function listarAusenciasDeHogar(hogarId: string) {
  return db
    .select({
      ausencia: ausencias,
      participanteNombre: participantes.nombre,
    })
    .from(ausencias)
    .innerJoin(participantes, eq(ausencias.participanteId, participantes.id))
    .where(eq(participantes.hogarId, hogarId))
    .orderBy(desc(ausencias.fechaInicio));
}

export async function actualizarAusencia(
  id: string,
  cambios: Partial<NuevaAusencia>,
): Promise<Ausencia | undefined> {
  const [fila] = await db
    .update(ausencias)
    .set(cambios)
    .where(eq(ausencias.id, id))
    .returning();
  return fila;
}

export async function eliminarAusencia(id: string): Promise<void> {
  await db.delete(ausencias).where(eq(ausencias.id, id));
}
