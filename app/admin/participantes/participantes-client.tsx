"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Participante } from "@/lib/participantes/participantes.repo";
import { type Ausencia } from "@/lib/ausencias/ausencias.repo";
import { Modal } from "@/app/_components/ui/modal";
import {
  crearParticipanteAction,
  editarParticipanteAction,
  desactivarParticipanteAction,
  reactivarParticipanteAction,
} from "@/lib/participantes/participantes.actions";
import { crearAusenciaAction } from "@/lib/ausencias/ausencias.actions";

type ParticipantesClientProps = {
  participantesIniciales: Participante[];
  ausenciasIniciales: { ausencia: Ausencia; participanteNombre: string }[];
};

export function ParticipantesClient({
  participantesIniciales,
  ausenciasIniciales,
}: ParticipantesClientProps) {
  const router = useRouter();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participante | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper para saber si alguien está ausente hoy
  const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD local (aproximado)
  const isAusente = (pId: string) => {
    return ausenciasIniciales.some(
      (a) => a.ausencia.participanteId === pId && a.ausencia.fechaInicio <= hoy && a.ausencia.fechaFin >= hoy
    );
  };

  const handleEditClick = (p: Participante) => {
    setSelectedParticipant(p);
    setError(null);
    setIsEditModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedParticipant(null);
    setError(null);
    setIsEditModalOpen(true);
  };

  const handleAbsenceClick = (p: Participante) => {
    setSelectedParticipant(p);
    setError(null);
    setIsAbsenceModalOpen(true);
  };

  const onSubmitEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    let res;
    if (selectedParticipant) {
      formData.append("id", selectedParticipant.id);
      res = await editarParticipanteAction(formData);
    } else {
      res = await crearParticipanteAction(formData);
    }

    setLoading(false);
    if (res.ok) {
      setIsEditModalOpen(false);
      router.refresh();
    } else {
      setError(res.error);
    }
  };

  const onToggleStatus = async () => {
    if (!selectedParticipant) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("id", selectedParticipant.id);

    let res;
    if (selectedParticipant.activo) {
      if (!confirm("¿Seguro que deseas desactivar a este participante? No se le asignarán más deberes.")) {
        setLoading(false);
        return;
      }
      res = await desactivarParticipanteAction(formData);
    } else {
      res = await reactivarParticipanteAction(formData);
    }

    setLoading(false);
    if (res.ok) {
      setIsEditModalOpen(false);
      router.refresh();
    } else {
      setError(res.error);
    }
  };

  const onSubmitAbsence = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedParticipant) return;
    
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("participanteId", selectedParticipant.id);
    // TODO: En el futuro agregar adminId del usuario logueado.

    const res = await crearAusenciaAction(formData);

    setLoading(false);
    if (res.ok) {
      setIsAbsenceModalOpen(false);
      router.refresh();
    } else {
      setError(res.error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 -mx-4 mb-6 flex items-end justify-between bg-[#F4EDE4]/80 px-4 py-6 backdrop-blur-md">
        <div className="flex flex-col">
          <button
            onClick={() => router.push("/admin")}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[#8c7b68] transition-colors hover:text-tinta"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver al panel
          </button>
          <h1 className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-tinta">
            Participantes
          </h1>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-1.5 rounded-[12px] bg-tinta px-4 py-2.5 text-[14px] font-bold text-white shadow-sm transition-all hover:bg-terracota"
        >
          <span className="text-[16px]">+</span> Añadir
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {participantesIniciales.map((p) => {
          const ausente = isAusente(p.id);
          
          return (
            <div
              key={p.id}
              className={`relative flex flex-col justify-between overflow-hidden rounded-[20px] bg-white p-5 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] transition-all ${
                !p.activo ? "opacity-60 grayscale-[50%]" : ""
              }`}
            >
              {/* Header Card */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-[44px] items-center justify-center rounded-full bg-[#fcf9f5] text-[20px] shadow-inner">
                    {p.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-display text-[16px] font-bold text-tinta">
                      {p.nombre}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {p.activo ? (
                        ausente ? (
                          <span className="flex items-center gap-1 rounded-full bg-[#fff5cc] px-2 py-0.5 text-[11px] font-bold text-[#a67c00]">
                            <span className="size-1.5 rounded-full bg-[#e6ac00]"></span>
                            Ausente
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-full bg-[#e8f1e2] px-2 py-0.5 text-[11px] font-bold text-[#4a7c59]">
                            <span className="size-1.5 rounded-full bg-[#5c9a6a]"></span>
                            Activo
                          </span>
                        )
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-[#fdf2f2] px-2 py-0.5 text-[11px] font-bold text-[#d94a4a]">
                          <span className="size-1.5 rounded-full bg-[#d94a4a]"></span>
                          Inactivo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="mt-6 flex items-center gap-2 border-t border-[#f0e6d5] pt-4">
                <button
                  onClick={() => handleEditClick(p)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#fcf9f5] px-3 py-2 text-[12px] font-bold text-[#8b7d6a] transition-colors hover:bg-[#f0e6d5] hover:text-tinta"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleAbsenceClick(p)}
                  disabled={!p.activo}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#fff5eb] px-3 py-2 text-[12px] font-bold text-[#d2602f] transition-colors hover:bg-[#ffe3d1] hover:text-[#b04a1f] disabled:opacity-50"
                >
                  ✈️ Ausencia
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {participantesIniciales.length === 0 && (
        <div className="mt-12 text-center text-[14px] text-[#8b7d6a]">
          No hay participantes registrados en este hogar.
        </div>
      )}

      {/* MODAL DE EDICIÓN / CREACIÓN */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={selectedParticipant ? "Editar Participante" : "Añadir Participante"}
      >
        <form onSubmit={onSubmitEdit} className="space-y-4">
          {error && (
            <div className="rounded-[10px] bg-[#fdf2f2] p-3 text-[13px] font-semibold text-[#d94a4a]">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#b19a80]">
              Nombre
            </label>
            <input
              name="nombre"
              type="text"
              defaultValue={selectedParticipant?.nombre}
              placeholder="Ej. Samuel"
              required
              className="w-full rounded-[14px] border border-[#e6d9c4] bg-[#fcf9f5] px-4 py-3 text-[14px] font-semibold text-tinta outline-none transition-colors focus:border-terracota focus:bg-white"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-[14px] bg-tinta py-3.5 text-[14px] font-bold text-white transition-colors hover:bg-[#2a2420] disabled:opacity-80"
            >
              {loading ? "Guardando..." : "Guardar Participante"}
            </button>
          </div>

          {selectedParticipant && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onToggleStatus}
                disabled={loading}
                className={`w-full rounded-[14px] border-2 border-dashed py-3 text-[14px] font-bold transition-colors ${
                  selectedParticipant.activo 
                    ? "border-[#fbdada] text-[#d94a4a] hover:bg-[#fdf2f2]" 
                    : "border-[#d6e9ce] text-[#5c9a6a] hover:bg-[#e8f1e2]"
                }`}
              >
                {selectedParticipant.activo ? "Desactivar Participante" : "Reactivar Participante"}
              </button>
            </div>
          )}
        </form>
      </Modal>

      {/* MODAL DE AUSENCIAS */}
      <Modal
        isOpen={isAbsenceModalOpen}
        onClose={() => setIsAbsenceModalOpen(false)}
        title="Gestionar Ausencia"
      >
        <div className="mb-4 text-[13px] text-[#7a6d60]">
          Reporta los días en que <strong>{selectedParticipant?.nombre}</strong> no estará en casa. El sistema dejará de asignarle deberes esos días y su porcentaje de confiabilidad no será afectado.
        </div>

        <form onSubmit={onSubmitAbsence} className="space-y-4">
          {error && (
            <div className="rounded-[10px] bg-[#fdf2f2] p-3 text-[13px] font-semibold text-[#d94a4a]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#b19a80]">
                Desde el día
              </label>
              <input
                name="fechaInicio"
                type="date"
                required
                className="w-full rounded-[14px] border border-[#e6d9c4] bg-[#fcf9f5] px-4 py-3 text-[14px] font-semibold text-tinta outline-none transition-colors focus:border-terracota focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#b19a80]">
                Hasta el día
              </label>
              <input
                name="fechaFin"
                type="date"
                required
                className="w-full rounded-[14px] border border-[#e6d9c4] bg-[#fcf9f5] px-4 py-3 text-[14px] font-semibold text-tinta outline-none transition-colors focus:border-terracota focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#b19a80]">
              Motivo (Opcional)
            </label>
            <input
              name="motivo"
              type="text"
              placeholder="Ej. Viaje de trabajo"
              className="w-full rounded-[14px] border border-[#e6d9c4] bg-[#fcf9f5] px-4 py-3 text-[14px] font-semibold text-tinta outline-none transition-colors focus:border-terracota focus:bg-white"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[14px] bg-[#d2602f] py-3.5 text-[14px] font-bold text-white transition-colors hover:bg-[#b04a1f] disabled:opacity-80"
            >
              {loading ? "Programando..." : "Programar Ausencia"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
