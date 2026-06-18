"use server";

import { revalidatePath } from "next/cache";
import {
  exito,
  fallo,
  mensajeDeError,
  type Resultado,
} from "@/lib/shared/resultado";
import {
  confirmarCobertura,
  cubrirDeber,
  marcarCumplido,
  reclamarExtra,
} from "./cumplimiento.service";
import { type Registro } from "./cumplimiento.repo";

/**
 * Server actions del motor de cumplimiento. Leen el FormData, delegan en el
 * service y devuelven un Resultado uniforme.
 *
 * NOTA DE SEGURIDAD: por ahora `participanteId` llega desde el formulario porque
 * aún no hay login. Cuando exista la sesión, ese id debe salir del usuario
 * autenticado y jamás confiarse del navegador. TODO(auth).
 */

function requerir(formData: FormData, campo: string): string {
  const valor = String(formData.get(campo) ?? "").trim();
  if (!valor) throw new Error(`Falta el campo "${campo}".`);
  return valor;
}

export async function marcarCumplidoAction(
  formData: FormData,
): Promise<Resultado<Registro>> {
  try {
    const registro = await marcarCumplido({
      deberId: requerir(formData, "deberId"),
      participanteId: requerir(formData, "participanteId"),
    });
    revalidatePath("/");
    return exito(registro);
  } catch (e) {
    return fallo(mensajeDeError(e));
  }
}

export async function cubrirDeberAction(
  formData: FormData,
): Promise<Resultado<Registro>> {
  try {
    const registro = await cubrirDeber({
      deberId: requerir(formData, "deberId"),
      participanteId: requerir(formData, "participanteId"),
      cubiertoA: requerir(formData, "cubiertoA"),
      nota: formData.get("nota") ? String(formData.get("nota")) : null,
      fotoUrl: formData.get("fotoUrl") ? String(formData.get("fotoUrl")) : null,
    });
    revalidatePath("/");
    return exito(registro);
  } catch (e) {
    return fallo(mensajeDeError(e));
  }
}

export async function confirmarCoberturaAction(
  formData: FormData,
): Promise<Resultado<Registro>> {
  try {
    const registro = await confirmarCobertura({
      registroId: requerir(formData, "registroId"),
      participanteId: requerir(formData, "participanteId"),
    });
    revalidatePath("/");
    return exito(registro);
  } catch (e) {
    return fallo(mensajeDeError(e));
  }
}

export async function reclamarExtraAction(
  formData: FormData,
): Promise<Resultado<Registro>> {
  try {
    const registro = await reclamarExtra({
      deberId: requerir(formData, "deberId"),
      participanteId: requerir(formData, "participanteId"),
      fotoUrl: formData.get("fotoUrl") ? String(formData.get("fotoUrl")) : null,
      nota: formData.get("nota") ? String(formData.get("nota")) : null,
    });
    revalidatePath("/");
    return exito(registro);
  } catch (e) {
    return fallo(mensajeDeError(e));
  }
}
