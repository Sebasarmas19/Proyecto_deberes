import {
  contarTransacciones,
  insertarTransaccion,
  type NuevaTransaccion,
  type Transaccion,
} from "./puntos.repo";

/**
 * Motor de puntos — el libro mayor.
 *
 * Regla inmutable: los puntos NO se guardan sueltos ni se sobrescriben. Cada
 * suma o resta es una fila en `transacciones_puntos`. Los rankings se calculan
 * después sumando estas filas. Las correcciones del admin son filas nuevas de
 * tipo `ajuste_admin`, nunca ediciones.
 *
 * Este servicio traduce un evento del motor de cumplimiento (un `registro`) a la
 * cantidad y el tipo correctos, según la matriz de puntos de docs/03.
 *
 * SEGURIDAD: esta lógica vive solo en el servidor. El navegador nunca calcula
 * puntos; se blindará además con Row-Level Security en Supabase.
 */

/** Datos mínimos de un registro que el motor de puntos necesita. */
type RegistroBase = {
  id: string;
  hogarId: string;
  participanteId: string;
  fecha: string;
};

/**
 * Inserta una transacción de forma IDEMPOTENTE: si ya existe una del mismo
 * registro y tipo, no hace nada y devuelve null. Así, aunque el flujo se
 * dispare dos veces, los puntos no se duplican.
 */
async function registrarUnaVez(
  valores: NuevaTransaccion,
): Promise<Transaccion | null> {
  if (valores.registroId) {
    const yaExiste = await contarTransacciones(valores.registroId, valores.tipo);
    if (yaExiste > 0) return null;
  }
  return insertarTransaccion(valores);
}

/**
 * Cumplir el deber propio: suma los puntos del deber. Afecta General y Confiable.
 */
export async function otorgarCumplimiento(
  registro: RegistroBase,
  puntosDeber: string,
): Promise<Transaccion | null> {
  return registrarUnaVez({
    hogarId: registro.hogarId,
    participanteId: registro.participanteId,
    registroId: registro.id,
    cantidad: puntosDeber,
    tipo: "cumplimiento",
    fecha: registro.fecha,
  });
}

/**
 * Reclamar un extra: suma los puntos del deber. Afecta General y Responsable.
 */
export async function otorgarReclamable(
  registro: RegistroBase,
  puntosDeber: string,
): Promise<Transaccion | null> {
  return registrarUnaVez({
    hogarId: registro.hogarId,
    participanteId: registro.participanteId,
    registroId: registro.id,
    cantidad: puntosDeber,
    tipo: "reclamable",
    fecha: registro.fecha,
  });
}

/**
 * Bono por cubrir a otro: suma los puntos del deber MÁS el bono de ayuda del
 * hogar. Afecta General y Solidario. El que llama (cumplimiento.service) ya
 * verificó que el participante hizo su propio deber y que el ayudado confirmó.
 */
export async function otorgarBonoAyuda(
  registro: RegistroBase,
  puntosDeber: string,
  bonoAyuda: number,
): Promise<Transaccion | null> {
  const cantidad = Number(puntosDeber) + bonoAyuda;
  return registrarUnaVez({
    hogarId: registro.hogarId,
    participanteId: registro.participanteId,
    registroId: registro.id,
    cantidad: String(cantidad),
    tipo: "bono_ayuda",
    fecha: registro.fecha,
  });
}

/**
 * Penalización por fallar el deber propio sin razón válida (Art. 5.1): resta
 * `penalizacion_fallo`. Afecta General y Confiable. No lleva `registroId`
 * (no hay registro: justamente NO se hizo); la idempotencia la garantiza el
 * motor de cierre, que no cierra dos veces el mismo día.
 */
export async function otorgarPenalizacionFallo(
  hogarId: string,
  participanteId: string,
  fechaStr: string,
  monto: number,
): Promise<Transaccion> {
  return insertarTransaccion({
    hogarId,
    participanteId,
    registroId: null,
    cantidad: String(-Math.abs(monto)),
    tipo: "penalizacion",
    fecha: fechaStr,
  });
}

/**
 * Penalización colectiva (Art. 5.2): cuando un deber no negociable no lo hizo
 * nadie, los tres pierden `penalizacion_colectiva`. Afecta General. Se llama
 * una vez por cada participante.
 */
export async function otorgarPenalizacionColectiva(
  hogarId: string,
  participanteId: string,
  fechaStr: string,
  monto: number,
): Promise<Transaccion> {
  return insertarTransaccion({
    hogarId,
    participanteId,
    registroId: null,
    cantidad: String(-Math.abs(monto)),
    tipo: "penalizacion_colectiva",
    fecha: fechaStr,
  });
}
