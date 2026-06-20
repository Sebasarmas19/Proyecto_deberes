"use server";

import { revalidatePath } from "next/cache";
import {
  exito,
  fallo,
  mensajeDeError,
  type Resultado,
} from "@/lib/shared/resultado";
import { formatearFechaISO, obtenerFechaDeNegocio } from "@/lib/shared/date";
import {
  cerrarMes,
  evaluarLogrosTodos,
  type LogroNuevo,
  type TituloNuevo,
} from "./logros.service";

/**
 * Server actions de logros y títulos. Normalmente el cron diario las dispara
 * solo, pero el admin puede ejecutarlas a mano (ej. recalcular tras un ajuste).
 *
 * NOTA DE SEGURIDAD: son acciones de admin. TODO(auth): verificar admin cuando
 * exista el login.
 */

/** Evalúa y otorga las medallas nuevas de todos los participantes. */
export async function evaluarLogrosAction(): Promise<Resultado<LogroNuevo[]>> {
  try {
    const nuevos = await evaluarLogrosTodos();
    revalidatePath("/", "layout");
    return exito(nuevos);
  } catch (e) {
    return fallo(mensajeDeError(e));
  }
}

/**
 * Cierra un mes: otorga títulos y evalúa medallas. Si no se pasa `mes`, usa el
 * mes de negocio actual.
 */
export async function cerrarMesAction(
  formData?: FormData,
): Promise<Resultado<{ titulos: TituloNuevo[]; logros: LogroNuevo[] }>> {
  try {
    const mesParam = formData?.get("mes");
    const mes =
      typeof mesParam === "string" && mesParam.trim()
        ? mesParam.trim()
        : formatearFechaISO(obtenerFechaDeNegocio()).slice(0, 7);
    const resultado = await cerrarMes(mes);
    revalidatePath("/", "layout");
    return exito(resultado);
  } catch (e) {
    return fallo(mensajeDeError(e));
  }
}
