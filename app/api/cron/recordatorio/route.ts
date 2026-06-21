import { db } from "@/lib/db";
import { asignaciones, deberes, participantes, suscripcionesPush } from "@/lib/db/schema";
import { obtenerFechaDeNegocio, formatearFechaISO } from "@/lib/shared/date";
import { eq, and } from "drizzle-orm";
import webpush from "web-push";

// Configurar web-push
webpush.setVapidDetails(
  "mailto:test@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Verificar secreto
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("No autorizado", { status: 401 });
  }

  try {
    const hoy = obtenerFechaDeNegocio();
    const fechaHoyStr = formatearFechaISO(hoy);

    // 1. Obtener todas las asignaciones rotativas de hoy con sus deberes y participantes
    const asignacionesHoy = await db
      .select({
        participanteNombre: participantes.nombre,
        participanteId: participantes.id,
        deberNombre: deberes.nombre,
      })
      .from(asignaciones)
      .innerJoin(deberes, eq(asignaciones.deberId, deberes.id))
      .innerJoin(participantes, eq(asignaciones.participanteId, participantes.id))
      .where(
        and(
          eq(asignaciones.fecha, fechaHoyStr),
          eq(deberes.tipoAsignacion, "rotativo")
        )
      );

    // 2. Obtener todas las suscripciones push
    const todasLasSuscripciones = await db.select().from(suscripcionesPush);

    const envios = [];

    // 3. Enviar mensaje a cada usuario basado en su deber
    for (const sub of todasLasSuscripciones) {
      const suAsignacion = asignacionesHoy.find(a => a.participanteId === sub.participanteId);
      
      if (suAsignacion) {
        const title = `¡Buenos días, ${suAsignacion.participanteNombre}! ☀️`;
        const body = `Tu deber principal de hoy es: ${suAsignacion.deberNombre}. ¡Que tengas un excelente día!`;
        
        const payload = JSON.stringify({
          title,
          body,
          url: `/${encodeURIComponent(suAsignacion.participanteNombre.toLowerCase())}`
        });

        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          }
        };

        envios.push(
          webpush.sendNotification(pushSubscription, payload).catch(err => {
            console.error("Fallo enviando push a", sub.endpoint, err);
            // Podríamos eliminar la suscripción si dio error 410 (Gone)
          })
        );
      }
    }

    await Promise.all(envios);

    return Response.json({ success: true, notificacionesEnviadas: envios.length });
  } catch (error) {
    console.error("Error en recordatorio cron:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
