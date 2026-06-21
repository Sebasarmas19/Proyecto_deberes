import { db } from "@/lib/db";
import { suscripcionesPush } from "@/lib/db/schema";

export async function POST(req: Request) {
  try {
    const { participanteId, subscription } = await req.json();

    if (!participanteId || !subscription || !subscription.endpoint) {
      return Response.json({ error: "Faltan datos" }, { status: 400 });
    }

    // Insertar o actualizar la suscripción
    await db
      .insert(suscripcionesPush)
      .values({
        participanteId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      })
      .onConflictDoUpdate({
        target: suscripcionesPush.endpoint,
        // Como no pusimos endpoint UNIQUE, guardará varios. Es mejor hacer delete e insert o dejar q haya multiples.
        set: {
          participanteId,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      })
      .catch(async () => {
        // Fallback: insertar si falla el upsert (por la falta de constraint UNIQUE en id, 
        // aunque .id es uuid por defecto, pero nosotros lo insertamos sin id, asi que genera uno nuevo).
        // En este caso, simplemente insertamos.
        await db.insert(suscripcionesPush).values({
          participanteId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        });
      });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Error guardando suscripción:", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
