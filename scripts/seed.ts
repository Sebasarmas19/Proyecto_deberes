import "dotenv/config";
import { db } from "../lib/db";
import {
  criteriosDeber,
  deberes,
  hogar,
  participantes,
  transaccionesPuntos,
} from "../lib/db/schema";
import { formatearFechaISO, obtenerFechaDeNegocio } from "../lib/shared/date";
import { generarAsignacionesRango } from "../lib/rotacion/rotacion.service";

async function main() {
  console.log("Iniciando seed de la base de datos...");

  // 1. Limpiar base de datos (CASCADE se encarga de borrar las relaciones)
  await db.delete(hogar);
  console.log("Datos anteriores limpiados.");

  // 2. Crear el hogar
  const [nuevoHogar] = await db
    .insert(hogar)
    .values({
      nombre: "Familia Armas",
      zonaHoraria: "America/Caracas",
      horaCierreDia: "03:00",
      claveAdmin: "1234",
    })
    .returning();
  
  console.log("Hogar creado:", nuevoHogar.nombre);

  // 3. Crear participantes
  const [sebastian, samuel, silvana] = await db
    .insert(participantes)
    .values([
      { hogarId: nuevoHogar.id, nombre: "Sebastián", esAdmin: true, ordenRotacion: 1 },
      { hogarId: nuevoHogar.id, nombre: "Samuel", esAdmin: false, ordenRotacion: 2 },
      { hogarId: nuevoHogar.id, nombre: "Silvana", esAdmin: false, ordenRotacion: 3 },
    ])
    .returning();

  console.log("Participantes creados:", sebastian.nombre, samuel.nombre, silvana.nombre);

  // 4. Crear los deberes rotativos (obligatorios)
  const [sofi, cocinar, platos] = await db
    .insert(deberes)
    .values([
      {
        hogarId: nuevoHogar.id,
        nombre: "Atender a Sofi",
        icono: "🐾",
        tipoAsignacion: "rotativo",
        esObligatorio: true,
        puntos: "10",
        cadencia: "diaria",
      },
      {
        hogarId: nuevoHogar.id,
        nombre: "Cocinar",
        icono: "🍳",
        tipoAsignacion: "rotativo",
        esObligatorio: true,
        puntos: "10",
        cadencia: "diaria",
      },
      {
        hogarId: nuevoHogar.id,
        nombre: "Lavar platos",
        icono: "🍽️",
        tipoAsignacion: "rotativo",
        esObligatorio: true,
        puntos: "10",
        cadencia: "diaria",
      },
    ])
    .returning();

  // Y algunos personales
  await db.insert(deberes).values([
    {
      hogarId: nuevoHogar.id,
      nombre: "Cama tendida",
      icono: "🛏️",
      tipoAsignacion: "rotativo",
      esObligatorio: false,
      esPersonal: true,
      puntos: "2.5",
      cadencia: "dia_por_medio",
    },
  ]);

  // Criterios para deberes rotativos
  await db.insert(criteriosDeber).values([
    // Cocinar
    { deberId: cocinar.id, descripcion: "Cocinar almuerzo y cena para todos", orden: 1 },
    { deberId: cocinar.id, descripcion: "Servir en el pote de cada uno", orden: 2 },
    { deberId: cocinar.id, descripcion: "Dejar la cocina limpia y todo lo sucio al lavaplatos", orden: 3 },
    { deberId: cocinar.id, descripcion: "Recoger y botar la basura del día", orden: 4 },
    // Platos
    { deberId: platos.id, descripcion: "Lavar todo lo utilizado en el día", orden: 1 },
    { deberId: platos.id, descripcion: "Secar y guardar todo en su lugar", orden: 2 },
    // Sofi
    { deberId: sofi.id, descripcion: "Sacarla mínimo 2 veces (mañana y noche)", orden: 1 },
    { deberId: sofi.id, descripcion: "Comida y agua, 2 veces al día", orden: 2 },
    { deberId: sofi.id, descripcion: "Limpiar cualquier desastre del día", orden: 3 },
  ]);

  // 5. Crear deberes reclamables (extras)
  const deberesReclamables = await db
    .insert(deberes)
    .values([
      {
        hogarId: nuevoHogar.id,
        nombre: "Lavar ropa",
        icono: "🧺",
        tipoAsignacion: "reclamable",
        esObligatorio: false,
        puntos: "15",
        cadencia: "semanal",
        diasDisponibles: ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"],
        maxReclamos: 2,
        requiereFoto: true,
      },
      {
        hogarId: nuevoHogar.id,
        nombre: "Limpieza profunda",
        icono: "🧽",
        tipoAsignacion: "reclamable",
        esObligatorio: false,
        puntos: "20",
        cadencia: "semanal",
        diasDisponibles: ["viernes", "sabado", "domingo"],
        maxReclamos: 1,
        requiereFoto: true,
      },
    ])
    .returning();

  const [ropa, limpieza] = deberesReclamables;

  await db.insert(criteriosDeber).values([
    // Ropa
    { deberId: ropa.id, descripcion: "Meter a lavar mínimo 3 tandas", orden: 1 },
    { deberId: ropa.id, descripcion: "Sacar y pasar a la secadora", orden: 2 },
    // Limpieza
    { deberId: limpieza.id, descripcion: "Barrer toda la casa", orden: 1 },
    { deberId: limpieza.id, descripcion: "Pasar coleto", orden: 2 },
    { deberId: limpieza.id, descripcion: "Recoger papeleras de los baños, botarlas y poner bolsas nuevas", orden: 3 },
  ]);

  // 6. Generar las asignaciones de la semana con el MOTOR DE ROTACIÓN.
  // Ya no se escriben a mano: el motor decide quién hace qué cada día rotando
  // el círculo de participantes. Generamos 7 días desde hoy para que la app
  // tenga datos al abrirla cualquier día de esta semana.
  const hoyStr = formatearFechaISO(obtenerFechaDeNegocio()); // YYYY-MM-DD
  const totalAsignaciones = await generarAsignacionesRango(
    obtenerFechaDeNegocio(),
    7,
    { sobrescribir: true },
  );
  console.log(`Asignaciones generadas por el motor de rotación: ${totalAsignaciones}`);

  // 7. Simular algunos puntos base
  await db.insert(transaccionesPuntos).values([
    {
      hogarId: nuevoHogar.id,
      participanteId: samuel.id,
      cantidad: "150",
      tipo: "ajuste_admin",
      fecha: hoyStr,
    },
    {
      hogarId: nuevoHogar.id,
      participanteId: sebastian.id,
      cantidad: "175",
      tipo: "ajuste_admin",
      fecha: hoyStr,
    },
    {
      hogarId: nuevoHogar.id,
      participanteId: silvana.id,
      cantidad: "160",
      tipo: "ajuste_admin",
      fecha: hoyStr,
    },
  ]);

  console.log("¡Seed completado exitosamente!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error ejecutando el seed:", err);
  process.exit(1);
});
