import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  asignaciones,
  ausencias,
  logrosObtenidos,
  registros,
  titulosMes,
  transaccionesPuntos,
} from "@/lib/db/schema";

/**
 * Acceso a datos del motor de logros y títulos. Lee el historial para calcular
 * estadísticas y escribe las medallas ganadas y los títulos del mes.
 */

// ── Datos para calcular estadísticas (historial completo de la persona) ──────

export async function listarAsignacionesDe(participanteId: string) {
  return db
    .select()
    .from(asignaciones)
    .where(eq(asignaciones.participanteId, participanteId));
}

export async function listarRegistrosDe(participanteId: string) {
  return db
    .select()
    .from(registros)
    .where(eq(registros.participanteId, participanteId));
}

export async function listarAusenciasDe(participanteId: string) {
  return db
    .select()
    .from(ausencias)
    .where(eq(ausencias.participanteId, participanteId));
}

/** Cuenta las transacciones de un tipo (ej. cuántos bonos de ayuda ganó). */
export async function contarTransaccionesTipo(
  participanteId: string,
  tipo: "bono_ayuda" | "reclamable",
): Promise<number> {
  const filas = await db
    .select({ id: transaccionesPuntos.id })
    .from(transaccionesPuntos)
    .where(
      and(
        eq(transaccionesPuntos.participanteId, participanteId),
        eq(transaccionesPuntos.tipo, tipo),
      ),
    );
  return filas.length;
}

// ── Medallas (logros_obtenidos) ──────────────────────────────────────────────

export type LogroObtenido = typeof logrosObtenidos.$inferSelect;

export async function listarLogrosDe(
  participanteId: string,
): Promise<LogroObtenido[]> {
  return db
    .select()
    .from(logrosObtenidos)
    .where(eq(logrosObtenidos.participanteId, participanteId));
}

export async function insertarLogro(
  valores: typeof logrosObtenidos.$inferInsert,
): Promise<LogroObtenido> {
  const [fila] = await db.insert(logrosObtenidos).values(valores).returning();
  return fila;
}

// ── Títulos del mes (titulos_mes) ────────────────────────────────────────────

export type TituloMes = typeof titulosMes.$inferSelect;

export async function listarTitulosDelMes(mes: string): Promise<TituloMes[]> {
  return db.select().from(titulosMes).where(eq(titulosMes.mes, mes));
}

export async function insertarTitulo(
  valores: typeof titulosMes.$inferInsert,
): Promise<TituloMes> {
  const [fila] = await db.insert(titulosMes).values(valores).returning();
  return fila;
}
