/**
 * Catálogo FIJO de logros (medallas coleccionables).
 *
 * Regla inmutable: los logros van fijos en el motor; el admin NO los modifica.
 * Aquí solo se definen; las medallas ganadas se guardan en `logros_obtenidos`.
 *
 * Cada logro mide UNA estadística del participante (ver `EstadisticasParticipante`)
 * y se desbloquea por niveles según umbrales crecientes. El motor otorga el nivel
 * más alto alcanzado y conserva los anteriores (las medallas son para siempre).
 *
 * El catálogo es genérico (no cablea deberes concretos como "Sofi"), para que
 * sirva a cualquier hogar. Es fácil de extender: agregar una entrada aquí.
 */

export type NivelLogro = "bronce" | "plata" | "oro";

/** Las métricas que el motor sabe calcular para cada participante. */
export type EstadisticasParticipante = {
  /** Racha máxima de días seguidos cumpliendo TODO lo suyo sin fallar. */
  rachaDias: number;
  /** Veces que cubrió a otro y ganó el bono (coberturas confirmadas y válidas). */
  coberturas: number;
  /** Extras reclamables que ha completado. */
  extras: number;
};

export type DefinicionLogro = {
  clave: string;
  nombre: string;
  descripcion: string;
  /** Qué estadística mide este logro. */
  metrica: keyof EstadisticasParticipante;
  /** Umbrales por nivel, de menor a mayor. */
  niveles: { nivel: NivelLogro; umbral: number }[];
};

export const CATALOGO_LOGROS: DefinicionLogro[] = [
  {
    clave: "imparable",
    nombre: "Imparable",
    descripcion: "Días seguidos cumpliendo tus deberes sin fallar.",
    metrica: "rachaDias",
    niveles: [
      { nivel: "bronce", umbral: 7 },
      { nivel: "plata", umbral: 15 },
      { nivel: "oro", umbral: 30 },
    ],
  },
  {
    clave: "buen_hermano",
    nombre: "Buen hermano",
    descripcion: "Cubrir el deber de otro y ganarte el bono de ayuda.",
    metrica: "coberturas",
    niveles: [
      { nivel: "bronce", umbral: 1 },
      { nivel: "plata", umbral: 5 },
      { nivel: "oro", umbral: 10 },
    ],
  },
  {
    clave: "manos_a_la_obra",
    nombre: "Manos a la obra",
    descripcion: "Reclamar extras de la casa.",
    metrica: "extras",
    niveles: [
      { nivel: "bronce", umbral: 1 },
      { nivel: "plata", umbral: 5 },
      { nivel: "oro", umbral: 15 },
    ],
  },
];
