import { obtenerHogarActualId } from "@/lib/hogar/hogar.service";
import {
  type EntradaAuditoria,
  insertarAuditoria,
  listarAuditoriaDeHogar,
} from "./auditoria.repo";

/**
 * Motor de auditoría.
 *
 * Regla inmutable: toda acción del admin queda registrada y visible para los
 * tres. Otros servicios llaman a `registrarAccion` después de una acción de
 * admin (aprobar ausencia, ajustar puntos, etc.).
 */

/**
 * Registra una acción del admin. `detalle` es un objeto libre (se guarda como
 * JSON) que describe exactamente qué cambió.
 */
export async function registrarAccion(input: {
  adminId: string;
  accion: string;
  detalle?: Record<string, unknown>;
}): Promise<EntradaAuditoria> {
  const hogarId = await obtenerHogarActualId();
  return insertarAuditoria({
    hogarId,
    adminId: input.adminId,
    accion: input.accion,
    detalle: input.detalle ?? null,
  });
}

/** Lista el registro de auditoría del hogar actual (para mostrarlo a los tres). */
export async function listarAuditoria() {
  const hogarId = await obtenerHogarActualId();
  return listarAuditoriaDeHogar(hogarId);
}
