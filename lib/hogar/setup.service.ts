import { db } from "../db";
import { hogar, participantes } from "../db/schema";
import { obtenerPrimerHogar } from "./hogar.repo";
import { hashClave } from "@/lib/auth/auth.service";

export type SetupInicialInput = {
  nombre: string;
  zonaHoraria: string;
  horaCierreDia: string;
  bonoAyuda: string;
  penalizacionFallo: string;
  penalizacionColectiva: string;
  claveAdmin: string;
  nombresParticipantes: string[];
};

export async function setupInicialHogar(input: SetupInicialInput) {
  const existente = await obtenerPrimerHogar();
  if (existente) {
    throw new Error("Ya existe un hogar configurado.");
  }

  // Usar transacción para asegurar que se crea todo junto o nada
  return db.transaction(async (tx) => {
    // 1. Crear hogar
    const [nuevoHogar] = await tx
      .insert(hogar)
      .values({
        nombre: input.nombre.trim(),
        zonaHoraria: input.zonaHoraria,
        horaCierreDia: input.horaCierreDia,
        bonoAyuda: input.bonoAyuda,
        penalizacionFallo: input.penalizacionFallo,
        penalizacionColectiva: input.penalizacionColectiva,
        claveAdmin: input.claveAdmin,
      })
      .returning();

    // 2. Crear participantes
    const participantesData = input.nombresParticipantes
      .map((nombre) => nombre.trim())
      .filter((n) => n.length > 0)
      .map((nombre, index) => ({
        hogarId: nuevoHogar.id,
        nombre,
        esAdmin: false, // El admin es un perfil general
        ordenRotacion: index + 1,
        pinHash: hashClave("0000"), // PIN temporal por defecto
      }));

    if (participantesData.length > 0) {
      await tx.insert(participantes).values(participantesData);
    }

    return nuevoHogar;
  });
}
