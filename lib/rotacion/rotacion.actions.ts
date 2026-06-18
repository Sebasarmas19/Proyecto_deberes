"use server";

import { revalidatePath } from "next/cache";
import { obtenerFechaDeNegocio } from "@/lib/shared/date";
import {
  exito,
  fallo,
  mensajeDeError,
  type Resultado,
} from "@/lib/shared/resultado";
import {
  generarAsignacionesDeHoy,
  generarAsignacionesRango,
} from "./rotacion.service";

/**
 * Server actions del motor de rotación. Delegan en el service y devuelven un
 * Resultado uniforme (nunca lanzan el error crudo al navegador).
 *
 * NOTA DE SEGURIDAD: accesibles por POST directo; generar/regenerar el plan es
 * acción de admin. TODO(auth): verificar admin cuando exista el login.
 */

/**
 * Genera las asignaciones del día de hoy (día de negocio, cierre 3 AM).
 * Por defecto no pisa lo existente; el formulario puede mandar `sobrescribir`.
 */
export async function generarHoyAction(
  formData?: FormData,
): Promise<Resultado<number>> {
  try {
    const sobrescribir = formData?.get("sobrescribir") === "on";
    const creadas = await generarAsignacionesDeHoy({ sobrescribir });
    revalidatePath("/");
    return exito(creadas.length);
  } catch (e) {
    return fallo(mensajeDeError(e));
  }
}

/**
 * Genera (o regenera) el plan de la semana: 7 días a partir de hoy.
 */
export async function generarSemanaAction(
  formData?: FormData,
): Promise<Resultado<number>> {
  try {
    const sobrescribir = formData?.get("sobrescribir") === "on";
    const total = await generarAsignacionesRango(obtenerFechaDeNegocio(), 7, {
      sobrescribir,
    });
    revalidatePath("/");
    return exito(total);
  } catch (e) {
    return fallo(mensajeDeError(e));
  }
}
