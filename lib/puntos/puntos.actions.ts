"use server";

import { revalidatePath } from "next/cache";
import { registrarAccion } from "@/lib/auditoria/auditoria.service";
import { obtenerHogarActualId } from "@/lib/hogar/hogar.service";
import { formatearFechaISO, obtenerFechaDeNegocio } from "@/lib/shared/date";
import {
  exito,
  fallo,
  mensajeDeError,
  type Resultado,
} from "@/lib/shared/resultado";
import { insertarTransaccion, type Transaccion } from "./puntos.repo";

/**
 * Acción de admin para ajustar los puntos de un participante.
 *
 * Regla inmutable: los puntos no se sobrescriben. Una corrección del admin es
 * una fila NUEVA de tipo `ajuste_admin` en el libro mayor (puede ser positiva o
 * negativa). Y toda acción de admin queda en el registro de auditoría.
 *
 * NOTA DE SEGURIDAD: `adminId` llega del formulario porque aún no hay login.
 * TODO(auth): derivarlo de la sesión y verificar que sea admin.
 */
export async function ajustarPuntosAction(
  formData: FormData,
): Promise<Resultado<Transaccion>> {
  try {
    const adminId = String(formData.get("adminId") ?? "").trim();
    const participanteId = String(formData.get("participanteId") ?? "").trim();
    const cantidad = Number(formData.get("cantidad"));
    const motivo = String(formData.get("motivo") ?? "").trim();

    if (!adminId) throw new Error("Falta el admin que hace el ajuste.");
    if (!participanteId) throw new Error("Falta el participante.");
    if (!Number.isFinite(cantidad) || cantidad === 0) {
      throw new Error("La cantidad debe ser un número distinto de cero.");
    }
    if (!motivo) throw new Error("El ajuste requiere un motivo.");

    const hogarId = await obtenerHogarActualId();
    const fecha = formatearFechaISO(obtenerFechaDeNegocio());

    const transaccion = await insertarTransaccion({
      hogarId,
      participanteId,
      registroId: null,
      cantidad: String(cantidad),
      tipo: "ajuste_admin",
      fecha,
    });

    await registrarAccion({
      adminId,
      accion: "ajuste_puntos",
      detalle: { participanteId, cantidad, motivo },
    });

    revalidatePath("/");
    return exito(transaccion);
  } catch (e) {
    return fallo(mensajeDeError(e));
  }
}
