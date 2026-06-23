"use server";

import { loginAdmin, loginParticipante, cerrarSesion } from "./auth.service";
import { exito, fallo, mensajeDeError, type Resultado } from "@/lib/shared/resultado";
import { redirect } from "next/navigation";

export async function loginAdminAction(formData: FormData): Promise<Resultado<void>> {
  try {
    const clave = String(formData.get("clave") ?? "").trim();
    if (!clave) throw new Error("La contraseña no puede estar vacía");
    
    const esValido = await loginAdmin(clave);
    if (!esValido) throw new Error("Contraseña incorrecta");
    
    return exito(undefined);
  } catch (e) {
    return fallo(mensajeDeError(e));
  }
}

export async function loginParticipanteAction(formData: FormData): Promise<Resultado<void>> {
  try {
    const id = String(formData.get("participanteId") ?? "").trim();
    const pin = String(formData.get("pin") ?? "").trim();
    
    if (!id || !pin) throw new Error("Faltan datos");
    
    const esValido = await loginParticipante(id, pin);
    if (!esValido) throw new Error("PIN incorrecto");
    
    return exito(undefined);
  } catch (e) {
    return fallo(mensajeDeError(e));
  }
}

export async function logoutAction(): Promise<void> {
  await cerrarSesion();
  redirect("/");
}
