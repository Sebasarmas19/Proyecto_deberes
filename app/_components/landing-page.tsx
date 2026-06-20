"use client";

import { useRouter } from "next/navigation";

/**
 * Landing page — la primera vista que ve un usuario nuevo.
 *
 * Muestra información general de la app y un botón "Comenzar"
 * que lleva al wizard de configuración inicial.
 */

export function LandingPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-dvh flex-col">
      {/* ─── Hero Section ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-6 pt-12">
        {/* Logo / Branding */}
        <div className="mb-8 animate-rise">
          <div
            className="mx-auto mb-3 flex size-[52px] items-center justify-center rounded-2xl text-[26px]"
            style={{
              background: "linear-gradient(158deg, #FCEBB6 0%, #F6D582 100%)",
              boxShadow: "0 8px 20px -8px rgba(120,80,20,.3)",
            }}
          >
            🏠
          </div>
          <p className="text-center text-[12px] font-bold uppercase tracking-[0.15em] text-[#b19a80]">
            Sistema de deberes
          </p>
        </div>

        {/* Titular principal */}
        <div className="mb-6 max-w-[360px] text-center animate-rise-delay-1">
          <h1 className="font-display text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] text-tinta">
            Organiza los deberes{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #E2733F, #D2602F)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              de tu hogar
            </span>
          </h1>
          <p className="mt-3 text-[15px] font-medium leading-[1.5] text-[#7a6d60]">
            Reparte las tareas de la casa de forma justa con rotación automática,
            sistema de puntos, rankings y logros. Todo el hogar organizado.
          </p>
        </div>

        {/* Imagen hero */}
        <div className="mb-8 w-full max-w-[340px] animate-rise-delay-1">
          <div
            className="overflow-hidden rounded-[24px]"
            style={{
              boxShadow: "0 16px 40px -16px rgba(60,40,15,.15)",
            }}
          >
            <img
              src="/landing-hero.png"
              alt="Familia haciendo deberes del hogar juntos"
              className="w-full object-cover"
              loading="eager"
            />
          </div>
        </div>

        {/* Features rápidos */}
        <div className="mb-8 grid w-full max-w-[340px] grid-cols-3 gap-3 animate-rise-delay-2">
          {[
            { icono: "🔄", label: "Rotación justa" },
            { icono: "⭐", label: "Puntos y logros" },
            { icono: "🏆", label: "Rankings" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-1.5 rounded-[14px] border border-[#f0e6d5] bg-crema-card px-3 py-3 text-center"
              style={{ boxShadow: "0 2px 8px -4px rgba(60,40,15,.08)" }}
            >
              <span className="text-[20px]">{f.icono}</span>
              <span className="text-[11px] font-bold text-[#7a6d60]">
                {f.label}
              </span>
            </div>
          ))}
        </div>

        {/* Botón principal — Comenzar */}
        <div className="w-full max-w-[340px] animate-rise-delay-2">
          <button
            type="button"
            onClick={() => router.push("/setup")}
            className="flex w-full items-center justify-center gap-2.5 rounded-[18px] p-[18px] font-display text-[18px] font-bold tracking-[-0.01em] text-white transition-all hover:brightness-[1.04] active:scale-[0.975] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
            style={{
              background: "linear-gradient(180deg, #E2733F, #D2602F)",
              boxShadow:
                "0 16px 32px -12px rgba(210,96,47,.7), 0 4px 12px -4px rgba(210,96,47,.3)",
            }}
          >
            Comenzar
            <span aria-hidden="true" className="text-[16px]">
              →
            </span>
          </button>
        </div>
      </div>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer className="px-5 pb-6 pt-4 text-center">
        <p className="text-[11px] font-medium text-[#c5b090]">
          Hecho con ❤️ para el hogar · El día cierra a las 3:00 AM
        </p>
      </footer>
    </main>
  );
}
