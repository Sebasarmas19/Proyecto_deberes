"use client";

import React, { useState, useTransition } from "react";
import { ajustarPuntosAction } from "@/lib/puntos/puntos.actions";

type Participante = {
  id: string;
  nombre: string;
  fotoUrl?: string | null;
};

type PuntosClientProps = {
  participantes: Participante[];
  puntosActuales: Record<string, number>;
  adminId: string;
};

export function PuntosClient({ participantes, puntosActuales, adminId }: PuntosClientProps) {
  const [selectedId, setSelectedId] = useState<string>(participantes[0]?.id || "");
  const [cantidad, setCantidad] = useState<number>(0);
  const [motivo, setMotivo] = useState("");
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ mensaje: string; tipo: "exito" | "error" } | null>(null);

  // Historial local efímero para darle feedback al admin
  const [historial, setHistorial] = useState<{ id: string; msg: string }[]>([]);

  const selectedPart = participantes.find((p) => p.id === selectedId);
  const puntosActualesDeSeleccionado = puntosActuales[selectedId] || 0;

  const handleIncrement = () => setCantidad((prev) => prev + 1);
  const handleDecrement = () => setCantidad((prev) => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || cantidad === 0 || !motivo.trim()) return;

    const formData = new FormData();
    formData.append("adminId", adminId);
    formData.append("participanteId", selectedId);
    formData.append("cantidad", String(cantidad));
    formData.append("motivo", motivo.trim());

    startTransition(async () => {
      const res = await ajustarPuntosAction(formData);
      if (res.ok) {
        setToast({ mensaje: `¡Ajuste de ${cantidad > 0 ? `+${cantidad}` : cantidad} aplicado!`, tipo: "exito" });
        setHistorial((prev) => [
          {
            id: Math.random().toString(),
            msg: `Se aplicaron ${cantidad > 0 ? `+${cantidad}` : cantidad} pts a ${selectedPart?.nombre}: ${motivo}`,
          },
          ...prev,
        ]);
        // Reset form
        setCantidad(0);
        setMotivo("");
      } else {
        setToast({ mensaje: res.error || "Hubo un error", tipo: "error" });
      }

      setTimeout(() => setToast(null), 3500);
    });
  };

  return (
    <div className="relative pb-24">
      {/* TOAST */}
      {toast && (
        <div
          className={`fixed bottom-8 left-1/2 z-50 flex w-[90%] max-w-sm -translate-x-1/2 transform items-center gap-3 rounded-2xl p-4 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
            toast.tipo === "exito"
              ? "bg-[#2c3e2a] text-white"
              : "bg-[#7d2f2f] text-white"
          }`}
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-white/20 text-lg">
            {toast.tipo === "exito" ? "✨" : "⚠️"}
          </div>
          <span className="text-[14px] font-bold">{toast.mensaje}</span>
        </div>
      )}

      {/* 1. Selector de Participante */}
      <section className="mb-8">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#8c7b68]">
          1. Selecciona a quién ajustar
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {participantes.map((p) => {
            const isSelected = p.id === selectedId;
            const pts = puntosActuales[p.id] || 0;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3 text-center transition-all ${
                  isSelected
                    ? "border-[#3b2a1a] bg-[#f8f1e5] shadow-sm"
                    : "border-transparent bg-[#faf5eb] opacity-70 hover:opacity-100 hover:shadow-sm"
                }`}
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-[#d4c5ad] text-xl overflow-hidden">
                  {p.fotoUrl ? (
                    <img src={p.fotoUrl} alt={p.nombre} className="size-full object-cover" />
                  ) : (
                    <span>{p.nombre.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <span className={`block text-xs font-bold ${isSelected ? "text-[#3b2a1a]" : "text-[#5a4d40]"}`}>
                    {p.nombre}
                  </span>
                  <span className="block text-[11px] font-medium text-[#8c7b68]">
                    {pts} pts
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Controlador de Puntos */}
      <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm border border-[#f4ecdd]">
        <h2 className="mb-6 text-center text-sm font-bold uppercase tracking-wider text-[#8c7b68]">
          2. Cantidad de puntos
        </h2>
        
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={handleDecrement}
            className="flex size-16 items-center justify-center rounded-full bg-[#faebeb] text-3xl text-[#b84a4a] transition-transform active:scale-95 shadow-sm"
            style={{ boxShadow: "0 4px 10px -2px rgba(184, 74, 74, 0.15)" }}
          >
            -
          </button>
          
          <div className="w-28 text-center">
            <span 
              className={`text-6xl font-black tabular-nums tracking-tighter ${
                cantidad > 0 ? "text-[#4a7c59]" : cantidad < 0 ? "text-[#b84a4a]" : "text-[#3b2a1a]"
              }`}
            >
              {cantidad > 0 ? `+${cantidad}` : cantidad}
            </span>
          </div>

          <button
            type="button"
            onClick={handleIncrement}
            className="flex size-16 items-center justify-center rounded-full bg-[#ebfaef] text-3xl text-[#4a7c59] transition-transform active:scale-95 shadow-sm"
            style={{ boxShadow: "0 4px 10px -2px rgba(74, 124, 89, 0.15)" }}
          >
            +
          </button>
        </div>
        <p className="mt-4 text-center text-xs font-medium text-[#8c7b68]">
          Puntos proyectados: <strong className="text-[#3b2a1a]">{puntosActualesDeSeleccionado + cantidad} pts</strong>
        </p>
      </section>

      {/* 3. Formulario Motivo y Submit */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label htmlFor="motivo" className="mb-2 block text-sm font-bold uppercase tracking-wider text-[#8c7b68]">
            3. Motivo del ajuste (Obligatorio)
          </label>
          <input
            id="motivo"
            type="text"
            required
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej: Rompió un vaso, ayudó extra..."
            className="w-full rounded-xl border-2 border-[#e8dcc4] bg-white p-4 text-sm font-medium text-[#3b2a1a] placeholder:text-[#d4c5ad] focus:border-[#3b2a1a] focus:outline-none focus:ring-0"
          />
        </div>

        <button
          type="submit"
          disabled={isPending || cantidad === 0 || !motivo.trim() || !selectedId}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3b2a1a] py-4 text-[15px] font-bold text-white shadow-xl transition-all hover:bg-[#2a1d12] disabled:opacity-50 disabled:shadow-none"
        >
          {isPending ? (
            <span className="animate-pulse">Aplicando...</span>
          ) : (
            <>
              Aplicar {cantidad > 0 ? `+${cantidad}` : cantidad === 0 ? "0" : cantidad} Puntos
            </>
          )}
        </button>
      </form>

      {/* 4. Mini-Historial (Feedback efímero) */}
      {historial.length > 0 && (
        <section className="mt-10 animate-in fade-in">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#a39481]">
            Ajustes recientes (esta sesión)
          </h3>
          <ul className="flex flex-col gap-2">
            {historial.map((h) => (
              <li key={h.id} className="rounded-lg bg-[#faf5eb] px-3 py-2 text-xs font-medium text-[#5a4d40]">
                {h.msg}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
