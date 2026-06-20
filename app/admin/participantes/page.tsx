import { listarParticipantes } from "@/lib/participantes/participantes.service";
import { listarAusencias } from "@/lib/ausencias/ausencias.service";
import { ParticipantesClient } from "./participantes-client";

export const metadata = {
  title: "Participantes | Admin",
};

export default async function AdminParticipantesPage() {
  const [participantes, ausencias] = await Promise.all([
    listarParticipantes({ incluirInactivos: true }),
    listarAusencias(),
  ]);

  return (
    <main className="mx-auto min-h-dvh max-w-[600px] px-4 pb-12 pt-0">
      <ParticipantesClient 
        participantesIniciales={participantes} 
        ausenciasIniciales={ausencias} 
      />
    </main>
  );
}
