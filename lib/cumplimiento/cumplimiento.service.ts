import { obtenerDeber } from "@/lib/deberes/deberes.repo";
import { obtenerHogarActual } from "@/lib/hogar/hogar.service";
import {
  otorgarBonoAyuda,
  otorgarCumplimiento,
  otorgarReclamable,
} from "@/lib/puntos/puntos.service";
import {
  formatearFechaISO,
  nombreDiaSemana,
  obtenerFechaDeNegocio,
  rangoPeriodo,
} from "@/lib/shared/date";
import {
  actualizarRegistro,
  buscarRegistro,
  contarReclamos,
  existeCumplidoPropio,
  insertarRegistro,
  listarCoberturasDelDia,
  obtenerAsignacion,
  obtenerAsignacionDeDeber,
  obtenerRegistroPorId,
  type Registro,
} from "./cumplimiento.repo";

/**
 * Motor de cumplimiento.
 *
 * Es el corazón del día a día: traduce las acciones de los participantes
 * ("ya cociné", "cubrí a mi hermano", "reclamo el extra de lavar ropa") en
 * filas del historial (`registros`) y dispara los puntos correspondientes a
 * través del motor de puntos. Cada función valida las reglas del reglamento
 * antes de escribir.
 *
 * SEGURIDAD: por ahora no hay login, así que las actions reciben `participanteId`
 * desde el formulario. Cuando exista la autenticación, ese id debe salir de la
 * sesión y nunca confiarse del navegador. TODO(auth).
 */

/** Marca el deber propio (rotativo, asignado hoy) como cumplido. */
export async function marcarCumplido(input: {
  deberId: string;
  participanteId: string;
  fotoUrl?: string | null;
  nota?: string | null;
}): Promise<Registro> {
  const deber = await obtenerDeber(input.deberId);
  if (!deber || !deber.activo) throw new Error("El deber no existe o está inactivo.");
  if (deber.tipoAsignacion === "reclamable") {
    throw new Error("Este deber es reclamable; usa la opción de reclamar extra.");
  }

  const fecha = obtenerFechaDeNegocio();
  const fechaStr = formatearFechaISO(fecha);

  // Debe estar asignado a esta persona hoy. Si no, no es "su" deber: para hacer
  // el de otro existe `cubrirDeber`.
  const asignacion = await obtenerAsignacion(
    deber.hogarId,
    deber.id,
    input.participanteId,
    fechaStr,
  );
  if (!asignacion) throw new Error("Este deber no te toca hoy.");

  // No marcar dos veces el mismo día.
  const yaMarcado = await buscarRegistro(
    deber.id,
    input.participanteId,
    fechaStr,
    "cumplido_propio",
  );
  if (yaMarcado) throw new Error("Ya marcaste este deber como cumplido hoy.");

  const registro = await insertarRegistro({
    hogarId: deber.hogarId,
    deberId: deber.id,
    participanteId: input.participanteId,
    fecha: fechaStr,
    estado: "cumplido_propio",
    confirmado: true, // el deber propio no requiere confirmación de nadie
    fotoUrl: input.fotoUrl,
    nota: input.nota,
  });

  if (deber.esPersonal) {
    await otorgarReclamable(registro, deber.puntos);
  } else {
    await otorgarCumplimiento(registro, deber.puntos);
  }

  // Ahora que hizo lo suyo, puede que tenga coberturas confirmadas a la espera
  // del bono. Intentamos otorgarlo (es idempotente).
  const coberturas = await listarCoberturasDelDia(input.participanteId, fechaStr, {
    soloConfirmadas: true,
  });
  for (const cobertura of coberturas) {
    await intentarOtorgarBono(cobertura);
  }

  return registro;
}

/** Registra que una persona cubrió el deber de otra (pendiente de confirmación). */
export async function cubrirDeber(input: {
  deberId: string;
  participanteId: string; // quien cubre
  cubiertoA: string; // a quién cubre
  nota?: string | null;
  fotoUrl?: string | null;
}): Promise<Registro> {
  const deber = await obtenerDeber(input.deberId);
  if (!deber || !deber.activo) throw new Error("El deber no existe o está inactivo.");
  if (input.cubiertoA === input.participanteId) {
    throw new Error("No puedes cubrirte a ti mismo.");
  }

  // Cubrir requiere justificación: una nota o una foto (Art. 3.4).
  const nota = input.nota?.trim() || null;
  const fotoUrl = input.fotoUrl?.trim() || null;
  if (!nota && !fotoUrl) {
    throw new Error("Cubrir a otro requiere una justificación (nota o foto).");
  }

  const fecha = obtenerFechaDeNegocio();
  const fechaStr = formatearFechaISO(fecha);

  // El deber tiene que tocarle hoy a la persona cubierta.
  const asignacionDelOtro = await obtenerAsignacionDeDeber(
    deber.hogarId,
    deber.id,
    fechaStr,
  );
  if (!asignacionDelOtro || asignacionDelOtro.participanteId !== input.cubiertoA) {
    throw new Error("Ese deber no le tocaba a esa persona hoy.");
  }

  // No registrar dos coberturas iguales el mismo día.
  const yaCubierto = await buscarRegistro(
    deber.id,
    input.participanteId,
    fechaStr,
    "cubrio_a_otro",
  );
  if (yaCubierto) throw new Error("Ya registraste esta cobertura hoy.");

  // Se crea el registro ya confirmado automáticamente.
  const registro = await insertarRegistro({
    hogarId: deber.hogarId,
    deberId: deber.id,
    participanteId: input.participanteId,
    fecha: fechaStr,
    estado: "cubrio_a_otro",
    cubiertoA: input.cubiertoA,
    nota,
    fotoUrl,
    confirmado: true,
  });

  await intentarOtorgarBono(registro);

  return registro;
}

/** La persona cubierta confirma que efectivamente la cubrieron. */
export async function confirmarCobertura(input: {
  registroId: string;
  participanteId: string; // quien confirma (el ayudado)
}): Promise<Registro> {
  const registro = await obtenerRegistroPorId(input.registroId);
  if (!registro) throw new Error("El registro no existe.");
  if (registro.estado !== "cubrio_a_otro") {
    throw new Error("Este registro no es una cobertura.");
  }
  if (registro.cubiertoA !== input.participanteId) {
    throw new Error("Solo la persona cubierta puede confirmar esta cobertura.");
  }
  if (registro.confirmado) return registro; // ya estaba confirmada

  const actualizado = await actualizarRegistro(registro.id, {
    confirmado: true,
    confirmadoPor: input.participanteId,
  });
  if (!actualizado) throw new Error("No se pudo confirmar la cobertura.");

  // Con la confirmación lista, intentamos otorgar el bono.
  await intentarOtorgarBono(actualizado);
  return actualizado;
}

/**
 * Otorga el bono por cubrir SI se cumplen las dos condiciones del reglamento:
 * la cobertura está confirmada Y quien cubrió ya hizo su propio deber del día.
 * Es idempotente: si falta una condición o el bono ya se otorgó, no hace nada.
 */
async function intentarOtorgarBono(cobertura: Registro): Promise<void> {
  if (!cobertura.confirmado) return;

  const hizoLoSuyo = await existeCumplidoPropio(
    cobertura.participanteId,
    cobertura.fecha,
  );
  if (!hizoLoSuyo) return; // queda pendiente hasta que haga su propio deber

  const deber = await obtenerDeber(cobertura.deberId);
  if (!deber) return;

  const hogar = await obtenerHogarActual();
  const bono = hogar ? Number(hogar.bonoAyuda) : 0;

  await otorgarBonoAyuda(cobertura, deber.puntos, bono);
}

/** Reclama un extra (deber reclamable): valida disponibilidad, foto y cupo. */
export async function reclamarExtra(input: {
  deberId: string;
  participanteId: string;
  fotoUrl?: string | null;
  nota?: string | null;
}): Promise<Registro> {
  const deber = await obtenerDeber(input.deberId);
  if (!deber || !deber.activo) throw new Error("El deber no existe o está inactivo.");
  if (deber.tipoAsignacion !== "reclamable") {
    throw new Error("Este deber no es reclamable.");
  }

  const fecha = obtenerFechaDeNegocio();
  const fechaStr = formatearFechaISO(fecha);
  const dia = nombreDiaSemana(fecha);

  if (!deber.diasDisponibles.includes(dia)) {
    throw new Error("Este extra no está disponible hoy.");
  }

  const fotoUrl = input.fotoUrl?.trim() || null;
  if (deber.requiereFoto && !fotoUrl) {
    throw new Error("Este extra requiere una foto de prueba.");
  }

  // No reclamar el mismo extra dos veces el mismo día.
  const yaReclamado = await buscarRegistro(
    deber.id,
    input.participanteId,
    fechaStr,
    "reclamado",
  );
  if (yaReclamado) throw new Error("Ya reclamaste este extra hoy.");

  // Cupo: si hay tope, contar los reclamos del período. El cupo es del hogar,
  // salvo que el deber sea personal (entonces el cupo es por persona).
  if (deber.maxReclamos !== null) {
    const { inicio, fin } = rangoPeriodo(deber.cadencia, fecha);
    const usados = await contarReclamos(
      deber.id,
      inicio,
      fin,
      deber.limitePorPersona ? input.participanteId : undefined,
    );
    if (usados >= deber.maxReclamos) {
      throw new Error("Ya se alcanzó el cupo de este extra para este período.");
    }
  }

  const registro = await insertarRegistro({
    hogarId: deber.hogarId,
    deberId: deber.id,
    participanteId: input.participanteId,
    fecha: fechaStr,
    estado: "reclamado",
    fotoUrl,
    nota: input.nota?.trim() || null,
    confirmado: true,
  });

  await otorgarReclamable(registro, deber.puntos);
  return registro;
}
