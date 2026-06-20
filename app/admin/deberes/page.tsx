import { obtenerHogarActualId } from "@/lib/hogar/hogar.service";
import { listarDeberes } from "@/lib/deberes/deberes.repo";
import { listarParticipantes } from "@/lib/participantes/participantes.repo";
import { DeberesClient } from "./deberes-client";
import Link from "next/link";

export const metadata = {
  title: "Deberes | Admin",
};

export default async function AdminDeberesPage() {
  const hogarId = await obtenerHogarActualId();
  // Traemos todos los deberes (activos e inactivos) con sus criterios
  const deberes = await listarDeberes(hogarId, { incluirInactivos: true });
  // Traemos participantes para poder asignarlos
  const participantes = await listarParticipantes(hogarId);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8">
      <header className="mb-8">
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
          Gestión de Deberes
        </h1>
        <p className="mt-2 text-sm text-[#735e47]">
          Configura las tareas del hogar, sus puntajes y requisitos de cumplimiento.
        </p>
      </header>

      <DeberesClient deberesIniciales={deberes} participantes={participantes} />
    </div>
  );
}
