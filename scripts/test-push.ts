import "dotenv/config";

async function main() {
  const horas = [
    { nombre: "Noche (7 PM)", forceHour: 23 },
  ];

  const secret = process.env.CRON_SECRET || "secreto_de_prueba";

  for (const { nombre, forceHour } of horas) {
    console.log(`\nProbando lógica de ${nombre}...`);
    try {
      const res = await fetch(`http://127.0.0.1:3000/api/cron/recordatorio?forceHour=${forceHour}`, {
        headers: {
          "Authorization": `Bearer ${secret}`
        }
      });
      const data = await res.json();
      console.log(`Resultado:`, data);
    } catch (e: any) {
      console.error(`Error en ${nombre}:`, e.message);
    }
    // Esperar un poco entre pruebas para no saturar las notificaciones visualmente tan rápido
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

main().catch(console.error);
