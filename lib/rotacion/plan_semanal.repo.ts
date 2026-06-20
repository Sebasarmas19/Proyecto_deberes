import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { planSemanal } from "@/lib/db/schema";

export type PlanSemanalRow = typeof planSemanal.$inferSelect;
export type NuevoPlanSemanalRow = typeof planSemanal.$inferInsert;

export async function listarPlanSemanal(hogarId: string): Promise<PlanSemanalRow[]> {
  return db.query.planSemanal.findMany({
    where: eq(planSemanal.hogarId, hogarId),
  });
}

export async function reemplazarPlanSemanal(
  hogarId: string,
  nuevasEntradas: Omit<NuevoPlanSemanalRow, "id" | "creadoEn">[]
): Promise<void> {
  await db.transaction(async (tx) => {
    // 1. Borrar el plan anterior
    await tx.delete(planSemanal).where(eq(planSemanal.hogarId, hogarId));
    
    // 2. Insertar el nuevo
    if (nuevasEntradas.length > 0) {
      await tx.insert(planSemanal).values(nuevasEntradas);
    }
  });
}
