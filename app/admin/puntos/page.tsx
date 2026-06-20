import { obtenerHogarActualId } from "@/lib/hogar/hogar.service";
import { listarParticipantes } from "@/lib/participantes/participantes.service";
import { calcularRankings } from "@/lib/rankings/rankings.service";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PuntosClient } from "./puntos-client";

export const metadata = {
  title: "Ajustar Puntos | Admin",
};

export default async function AjustarPuntosPage() {
  let hogarId: string;
  try {
    hogarId = await obtenerHogarActualId();
  } catch {
    redirect("/setup");
  }

  // Obtenemos todos los participantes y los rankings para tener los puntos actuales
  const participantes = await listarParticipantes();
  const rankings = await calcularRankings();

  // Mapeamos los puntos actuales de cada participante
  const puntosActuales = Object.fromEntries(
    rankings.general.map((r) => [r.participanteId, r.valor])
  );

  // Buscamos un admin para que sea el autor del ajuste (TODO: usar auth en el futuro)
  const admin = participantes.find((p) => p.esAdmin);
  const adminId = admin ? admin.id : participantes[0]?.id;

  return (
    <div className="mx-auto max-w-lg p-4 md:p-6 lg:p-8 animate-in fade-in">
      <header className="mb-6">
        <Link
          href="/admin"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#8c7b68] transition-colors hover:text-[#3b2a1a]"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver al panel
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#3b2a1a] sm:text-3xl">
          Ajustar Puntos
        </h1>
        <p className="mt-2 text-sm text-[#8c7b68]">
          Suma o resta puntos manualmente. Esto quedará registrado en el historial de auditoría del hogar.
        </p>
      </header>

      <PuntosClient 
        participantes={participantes} 
        puntosActuales={puntosActuales}
        adminId={adminId}
      />
    </div>
  );
}
