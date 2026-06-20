import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { criteriosDeber } from "@/lib/db/schema";

export type CriterioDeber = typeof criteriosDeber.$inferSelect;
export type NuevoCriterio = typeof criteriosDeber.$inferInsert;

/**
 * Lista los criterios de un deber específico, ordenados por su campo 'orden'.
 */
export async function listarCriteriosPorDeber(deberId: string): Promise<CriterioDeber[]> {
  return db.query.criteriosDeber.findMany({
    where: eq(criteriosDeber.deberId, deberId),
    orderBy: (c, { asc }) => [asc(c.orden)],
  });
}

/**
 * Reemplaza todos los criterios de un deber.
 * Como el admin edita la lista completa en el cliente, la forma más segura
 * de sincronizar es borrar los existentes y crear los nuevos en el orden correcto.
 */
export async function reemplazarCriterios(
  deberId: string,
  criterios: Omit<NuevoCriterio, "id" | "deberId">[]
): Promise<void> {
  await db.transaction(async (tx) => {
    // 1. Eliminar los criterios anteriores
    await tx.delete(criteriosDeber).where(eq(criteriosDeber.deberId, deberId));

    // 2. Insertar los nuevos, si hay
    if (criterios.length > 0) {
      const valoresAInsertar = criterios.map((c) => ({
        ...c,
        deberId,
      }));
      await tx.insert(criteriosDeber).values(valoresAInsertar);
    }
  });
}
