import {
  type ExtraFinde,
  type HermanoEstado,
  HomeScreen,
} from "./_components/home-screen";

/**
 * Vista principal de la app.
 *
 * DATOS DE EJEMPLO: por ahora la pantalla se alimenta de datos fijos que imitan
 * el diseno (Samuel, le toca Sofi, fin de semana). Cuando esten el motor de
 * rotacion y el de puntos, este componente de servidor leera los datos reales
 * (deber del dia, hermanos, puntaje) y se los pasara al HomeScreen.
 */

// Etiqueta de fecha en espanol, p. ej. "Lunes 15 de junio".
function etiquetaFecha(fecha: Date): string {
  const texto = new Intl.DateTimeFormat("es-VE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(fecha);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const hermanos: HermanoEstado[] = [
  {
    nombre: "Sebastián",
    rol: "Cocina hoy",
    emoji: "🍳",
    esYo: false,
    cumplido: true,
    cardStyle: "background:#FFFDF9;border:1px solid #F0E6D5;",
    ringStyle: "background:#F4E4CE;border:2px solid #E9CBA0;",
  },
  {
    nombre: "Samuel",
    rol: "Tú · Sofi",
    emoji: "🐾",
    esYo: true,
    cumplido: false,
    cardStyle:
      "background:#FFF4EC;border:2px solid #E2733F;box-shadow:0 10px 22px -14px rgba(210,96,47,.6);",
    ringStyle: "background:#FBD9C4;border:2px solid #E2733F;",
  },
  {
    nombre: "Silvana",
    rol: "Lava platos",
    emoji: "🍽️",
    esYo: false,
    cumplido: false,
    cardStyle: "background:#FFFDF9;border:1px solid #F0E6D5;",
    ringStyle: "background:#EFE0D0;border:2px solid #DFC9AE;",
  },
];

const extras: ExtraFinde[] = [
  {
    clave: "ropa",
    icono: "🧺",
    label: "Lavar ropa",
    meta: "15 pts · 3 tandas · pide foto 📷",
    puntos: 15,
  },
  {
    clave: "limpieza",
    icono: "🧽",
    label: "Limpieza profunda",
    meta: "20 pts · barrer y coleto · pide foto 📷",
    puntos: 20,
  },
];

export default function Home() {
  return (
    <HomeScreen
      variant="plain"
      userName="Samuel"
      dateLabel={etiquetaFecha(new Date())}
      weekend
      deberHoy={{
        nombre: "Atender a Sofi",
        emoji: "🐾",
        puntos: 10,
        criterios: [
          "Sacarla mínimo 2 veces (mañana y noche)",
          "Comida y agua, 2 veces al día",
          "Limpiar cualquier desastre del día",
        ],
      }}
      hermanos={hermanos}
      extras={extras}
      puntosBase={175}
      posicionLabel="2º general 🥈"
    />
  );
}
