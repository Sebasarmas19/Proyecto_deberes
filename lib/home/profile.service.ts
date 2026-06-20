import { db } from "../db";
import { hogar, participantes } from "../db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Datos que necesita la página de selección de perfil.
 *
 * - Si no hay hogar  → estado "sin_hogar"  (Estado A del diseño).
 * - Si hay hogar     → estado "con_usuarios" con la lista de TODOS los
 *                       participantes activos (Estado B del diseño).
 *
 * IMPORTANTE: "Admin" no es un participante. Es un perfil fijo del sistema
 * al que cualquiera puede acceder con la contraseña. Por eso NO se filtra
 * por esAdmin aquí — todos los participantes son usuarios normales.
 */

export type PerfilParticipante = {
  id: string;
  nombre: string;
  fotoUrl: string | null;
};

export type ProfilePageData =
  | { estado: "sin_hogar" }
  | {
      estado: "con_usuarios";
      nombreHogar: string;
      participantes: PerfilParticipante[];
    };

export async function getProfilePageData(): Promise<ProfilePageData> {
  // 1. ¿Existe al menos un hogar?
  const [hogarActual] = await db.select().from(hogar).limit(1);

  if (!hogarActual) {
    return { estado: "sin_hogar" };
  }

  // 2. Obtener TODOS los participantes activos (todos son perfiles de usuario).
  const activos = await db
    .select({
      id: participantes.id,
      nombre: participantes.nombre,
      fotoUrl: participantes.fotoUrl,
    })
    .from(participantes)
    .where(
      and(
        eq(participantes.hogarId, hogarActual.id),
        eq(participantes.activo, true),
      ),
    )
    .orderBy(participantes.ordenRotacion);

  return {
    estado: "con_usuarios",
    nombreHogar: hogarActual.nombre,
    participantes: activos,
  };
}
