import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { participantes, registroAuditoria } from "@/lib/db/schema";

/**
 * Acceso a datos del registro de auditoría: el historial de acciones del admin,
 * visible para los tres (transparencia).
 */

export type EntradaAuditoria = typeof registroAuditoria.$inferSelect;
export type NuevaEntradaAuditoria = typeof registroAuditoria.$inferInsert;

export async function insertarAuditoria(
  valores: NuevaEntradaAuditoria,
): Promise<EntradaAuditoria> {
  const [fila] = await db.insert(registroAuditoria).values(valores).returning();
  return fila;
}

/** Acciones del hogar (con el nombre del admin), más recientes primero. */
export async function listarAuditoriaDeHogar(hogarId: string) {
  return db
    .select({
      entrada: registroAuditoria,
      adminNombre: participantes.nombre,
    })
    .from(registroAuditoria)
    .innerJoin(participantes, eq(registroAuditoria.adminId, participantes.id))
    .where(eq(registroAuditoria.hogarId, hogarId))
    .orderBy(desc(registroAuditoria.fecha));
}
