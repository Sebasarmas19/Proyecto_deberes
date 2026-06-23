"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cambiarPinAction } from "@/lib/participantes/participantes.actions";
import toast from "react-hot-toast";

type Props = {
  participanteId: string;
};

export function ChangePinClient({ participanteId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [pinActual, setPinActual] = useState("");
  const [pinNuevo, setPinNuevo] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinActual.length !== 4 || pinNuevo.length !== 4) {
      setErrorMsg("Ambos PINs deben tener 4 dígitos.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("participanteId", participanteId);
    formData.append("pinActual", pinActual);
    formData.append("pinNuevo", pinNuevo);

    const res = await cambiarPinAction(formData);

    setLoading(false);
    if (!res.ok) {
      setErrorMsg(res.error);
    } else {
      toast.success("¡PIN cambiado con éxito!");
      setIsOpen(false);
      setPinActual("");
      setPinNuevo("");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/40 px-3 py-1.5 text-[12px] font-bold text-tinta transition-all hover:bg-white/60 active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Cambiar PIN
      </button>

      {isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="animate-fade-in absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div
            role="dialog"
            aria-modal="true"
            className="animate-pop-lg relative z-10 w-full max-w-[320px] rounded-[26px] bg-crema-card p-6 outline-none"
            style={{ boxShadow: "0 20px 50px -16px rgba(60,40,15,.3)" }}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar"
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-[#f0e6d5] text-[14px] text-[#9a8c7c] transition-colors hover:bg-[#e6d9c4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracota"
            >
              ✕
            </button>

            <div className="flex flex-col items-center pb-5 pt-2">
              <p className="font-display text-[20px] font-extrabold tracking-[-0.02em] text-tinta">
                Cambiar PIN
              </p>
              <p className="mt-0.5 text-[13px] font-medium text-[#9a8c7c] text-center">
                Elige un nuevo PIN de 4 dígitos
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-tinta ml-1">
                  PIN Actual
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="••••"
                  value={pinActual}
                  onChange={(e) => {
                    setPinActual(e.target.value.replace(/\D/g, ""));
                    setErrorMsg("");
                  }}
                  className="w-full text-center tracking-[0.5em] rounded-[14px] border-[1.5px] border-[#e6d9c4] bg-[#faf5eb] p-[14px] text-[20px] font-medium text-tinta transition-colors focus:border-terracota focus:outline-none focus:ring-[2px] focus:ring-terracota/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-tinta ml-1">
                  Nuevo PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="••••"
                  value={pinNuevo}
                  onChange={(e) => {
                    setPinNuevo(e.target.value.replace(/\D/g, ""));
                    setErrorMsg("");
                  }}
                  className="w-full text-center tracking-[0.5em] rounded-[14px] border-[1.5px] border-[#e6d9c4] bg-[#faf5eb] p-[14px] text-[20px] font-medium text-tinta transition-colors focus:border-terracota focus:outline-none focus:ring-[2px] focus:ring-terracota/20"
                />
                {errorMsg && (
                  <p role="alert" className="mt-2 text-[13px] font-semibold text-[#c0392b] text-center">
                    {errorMsg}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2.5 rounded-[16px] p-[16px] font-display text-[17px] font-bold tracking-[-0.01em] text-white transition-all hover:brightness-[1.04] active:scale-[0.975] disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: "linear-gradient(180deg, #E2733F, #D2602F)",
                  boxShadow: "0 14px 26px -10px rgba(210,96,47,.75)",
                }}
              >
                {loading ? (
                  <span className="inline-block size-[20px] animate-spin rounded-full border-[2.5px] border-white/30 border-t-white" />
                ) : (
                  "Guardar Cambios"
                )}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
