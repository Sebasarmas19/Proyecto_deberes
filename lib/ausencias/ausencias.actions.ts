"use server";

import { revalidatePath } from "next/cache";
import { registrarAccion } from "@/lib/auditoria/auditoria.service";
import {
  exito,
  fallo,
  mensajeDeError,
  type Resultado,
} from "@/lib/shared/resultado";
import {
  aprobarAusencia,
  crearAusencia,
  eliminarAusencia,
} from "./ausencias.service";
import { type Ausencia } from "./ausencias.repo";

/**
 * Server actions de ausencias. Las acciones de admin (aprobar, eliminar) quedan
 * en el registro de auditoría.
 *
 * NOTA DE SEGURIDAD: `adminId` llega del formulario porque aún no hay login.
 * Cuando exista la sesión debe salir del usuario autenticado. TODO(auth).
 */

function requerir(formData: FormData, campo: string): string {
  const valor = String(formData.get(campo) ?? "").trim();
  if (!valor) throw new Error(`Falta el campo "${campo}".`);
  return valor;
}

/** Declarar una ausencia (la puede crear la propia persona). */
export async function crearAusenciaAction(
  formData: FormData,
): Promise<Resultado<Ausencia>> {
  try {
    const ausencia = await crearAusencia({
      participanteId: requerir(formData, "participanteId"),
      fechaInicio: requerir(formData, "fechaInicio"),
      fechaFin: requerir(formData, "fechaFin"),
      motivo: formData.get("motivo") ? String(formData.get("motivo")) : null,
    });
    revalidatePath("/", "layout");
    return exito(ausencia);
  } catch (e) {
    return fallo(mensajeDeError(e));
  }
}

/** El admin aprueba una ausencia → queda en auditoría. */
export async function aprobarAusenciaAction(
  formData: FormData,
): Promise<Resultado<Ausencia>> {
  try {
    const ausenciaId = requerir(formData, "ausenciaId");
    const adminId = requerir(formData, "adminId");
    const ausencia = await aprobarAusencia({ ausenciaId, adminId });
    await registrarAccion({
      adminId,
      accion: "aprobar_ausencia",
      detalle: { ausenciaId, participanteId: ausencia.participanteId },
    });
    revalidatePath("/", "layout");
    return exito(ausencia);
  } catch (e) {
    return fallo(mensajeDeError(e));
  }
}

/** El admin elimina una ausencia → queda en auditoría. */
export async function eliminarAusenciaAction(
  formData: FormData,
): Promise<Resultado<null>> {
  try {
    const ausenciaId = requerir(formData, "ausenciaId");
    const adminId = requerir(formData, "adminId");
    await eliminarAusencia(ausenciaId);
    await registrarAccion({
      adminId,
      accion: "eliminar_ausencia",
      detalle: { ausenciaId },
    });
    revalidatePath("/", "layout");
    return exito(null);
  } catch (e) {
    return fallo(mensajeDeError(e));
  }
}
