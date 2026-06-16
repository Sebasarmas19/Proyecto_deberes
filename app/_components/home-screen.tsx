"use client";

import { useState } from "react";

/**
 * Pantalla principal (HomeScreen) — port del diseno de Claude Design.
 *
 * Mobile-first, vertical. Muestra el deber no negociable del dia, su checklist,
 * el estado de los hermanos, los extras del fin de semana y el puntaje del mes.
 *
 * Por ahora recibe datos de EJEMPLO (props) y maneja la interaccion en el
 * cliente (marcar cumplido, cubrir, reclamar extras). Cuando existan el motor
 * de rotacion y el de puntos, estos datos vendran del servidor y las acciones
 * llamaran a las server actions; la estructura ya queda lista para eso.
 */

export type HeroVariant = "plain" | "photo";

export type DeberHoy = {
  nombre: string;
  emoji: string;
  puntos: number;
  criterios: string[];
};

export type HermanoEstado = {
  nombre: string;
  rol: string;
  emoji: string;
  esYo: boolean;
  cumplido: boolean;
  /** Anillo de color alrededor del emoji (estilo del diseno). */
  ringStyle: string;
  /** Estilo de la tarjeta (resalta al "yo"). */
  cardStyle: string;
};

export type ExtraFinde = {
  clave: string;
  icono: string;
  label: string;
  meta: string;
  puntos: number;
};

export type HomeScreenProps = {
  variant?: HeroVariant;
  userName: string;
  dateLabel: string;
  weekend: boolean;
  deberHoy: DeberHoy;
  hermanos: HermanoEstado[];
  extras: ExtraFinde[];
  puntosBase: number;
  posicionLabel: string;
};

type EstadoCobertura = "bonus" | "nobonus";
type EstadoExtra = "idle" | "foto" | "done";

export function HomeScreen({
  variant = "plain",
  userName,
  dateLabel,
  weekend,
  deberHoy,
  hermanos,
  extras,
  puntosBase,
  posicionLabel,
}: HomeScreenProps) {
  const [criteriosOk, setCriteriosOk] = useState<boolean[]>(
    () => deberHoy.criterios.map(() => false),
  );
  const [cumplido, setCumplido] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(true);
  // Cobertura por hermano (clave = indice). El diseno solo cubre a los pendientes.
  const [coberturas, setCoberturas] = useState<
    Record<number, EstadoCobertura>
  >({});
  const [estadoExtras, setEstadoExtras] = useState<Record<string, EstadoExtra>>(
    () => Object.fromEntries(extras.map((e) => [e.clave, "idle"])),
  );

  const toggleCriterio = (i: number) =>
    setCriteriosOk((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const marcarCumplido = () => setCumplido(true);

  const deshacer = () => {
    setCumplido(false);
    // Sin mi deber hecho, el bono de cobertura ya no aplica: pasa a "nobonus".
    setCoberturas((prev) => {
      const copia = { ...prev };
      for (const k of Object.keys(copia)) {
        if (copia[Number(k)] === "bonus") copia[Number(k)] = "nobonus";
      }
      return copia;
    });
  };

  const cubrir = (i: number) =>
    setCoberturas((prev) => ({ ...prev, [i]: cumplido ? "bonus" : "nobonus" }));

  const reclamar = (clave: string) =>
    setEstadoExtras((prev) => ({
      ...prev,
      [clave]: prev[clave] === "idle" ? "foto" : "done",
    }));

  // Puntaje del mes derivado del estado (igual que el prototipo).
  let puntosMes = puntosBase;
  if (cumplido) puntosMes += deberHoy.puntos;
  for (const estado of Object.values(coberturas)) {
    if (estado === "bonus") puntosMes += 15;
  }
  for (const extra of extras) {
    if (estadoExtras[extra.clave] === "done") puntosMes += extra.puntos;
  }

  return (
    <main
      className="mx-auto min-h-dvh w-full max-w-[420px] bg-crema px-[18px] pt-2 font-sans text-tinta"
      style={{ paddingBottom: "max(30px, env(safe-area-inset-bottom))" }}
    >
      {/* Saludo + fecha */}
      <header className="px-0.5 pb-4 pt-2">
        <p className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-[#b19a80]">
          {dateLabel}
        </p>
        <h1 className="mt-[5px] text-balance font-display text-[26px] font-extrabold leading-[1.05] tracking-[-0.02em]">
          Buenas, {userName}{" "}
          <span aria-hidden="true" className="font-sans">
            👋
          </span>
        </h1>
        <p className="mt-[3px] text-[13.5px] font-medium text-[#9a8c7c]">
          Esto es lo tuyo hoy. Sin vueltas.
        </p>
      </header>

      {/* HERO: el deber del dia */}
      <section
        aria-label="Tu deber de hoy"
        className="overflow-hidden rounded-[26px] border border-[#f0e6d5] bg-crema-card"
        style={{ boxShadow: "0 22px 46px -24px rgba(90,62,30,.5)" }}
      >
        {!cumplido ? (
          <>
            {variant === "photo" ? (
              <HeroFoto deber={deberHoy} />
            ) : (
              <HeroColor deber={deberHoy} />
            )}

            {/* Checklist de criterios */}
            <div className="px-5 pb-5 pt-4">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#b19a80]">
                Para darlo por cumplido
              </p>
              <ul className="mt-1.5">
                {deberHoy.criterios.map((label, i) => (
                  <li key={label}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={criteriosOk[i]}
                      onClick={() => toggleCriterio(i)}
                      className="flex w-full items-center gap-3 rounded-lg border-t border-[#f4ecdd] py-2.5 text-left transition-colors hover:bg-[#faf3e6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracota"
                    >
                      {criteriosOk[i] ? (
                        <span
                          aria-hidden="true"
                          className="animate-pop flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-verde text-[13px] text-white"
                          style={{
                            boxShadow: "0 5px 11px -4px rgba(92,154,106,.75)",
                          }}
                        >
                          ✓
                        </span>
                      ) : (
                        <span
                          aria-hidden="true"
                          className="size-6 flex-shrink-0 rounded-full border-2 border-[#dccdb4]"
                        />
                      )}
                      <span
                        className={`text-[14.5px] font-medium leading-[1.3] ${
                          criteriosOk[i]
                            ? "text-[#a89a88] line-through"
                            : "text-[#4a4039]"
                        }`}
                      >
                        {label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <HeroCumplido deber={deberHoy} />
        )}
      </section>

      {/* Boton primario: marcar / deshacer */}
      {!cumplido ? (
        <button
          type="button"
          onClick={marcarCumplido}
          className="mt-3.5 flex w-full items-center justify-center gap-2.5 rounded-[18px] p-[18px] font-display text-[18px] font-bold tracking-[-0.01em] text-white transition hover:brightness-[1.04] active:scale-[0.975] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
          style={{
            background: "linear-gradient(180deg,#E2733F,#D2602F)",
            boxShadow: "0 14px 26px -10px rgba(210,96,47,.75)",
          }}
        >
          <span
            aria-hidden="true"
            className="inline-flex size-[22px] items-center justify-center rounded-full bg-white/20 text-[13px]"
          >
            ✓
          </span>
          Marcar como cumplido
        </button>
      ) : (
        <button
          type="button"
          onClick={deshacer}
          className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-[18px] border-[1.5px] border-[#dccdb4] bg-transparent p-[15px] text-[14.5px] font-bold text-[#9a8c7c] transition hover:bg-[#f4ecdd] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
        >
          ✓ Cumplido hoy ·{" "}
          <span className="underline underline-offset-2">deshacer</span>
        </button>
      )}

      {/* Estado de hoy: los hermanos */}
      <section aria-label="Estado de hoy" className="mt-7">
        <div className="flex items-baseline justify-between px-0.5">
          <h2 className="font-display text-[18px] font-extrabold tracking-[-0.02em]">
            Estado de hoy
          </h2>
          <span className="text-[11.5px] font-semibold text-[#b19a80]">
            Rotación del día
          </span>
        </div>
        <ul className="mt-[13px] flex items-stretch gap-[9px]">
          {hermanos.map((h, i) => {
            const cumplidoVisible = h.esYo ? cumplido : h.cumplido;
            const cobertura = coberturas[i];
            const puedeCubrir = !h.esYo && !h.cumplido && cobertura === undefined;
            return (
              <li
                key={h.nombre}
                className="relative flex-1 rounded-[18px] px-[9px] pb-3 pt-[13px] text-center"
                style={parseStyle(h.cardStyle)}
              >
                {h.esYo && (
                  <span className="absolute right-[9px] top-[9px] rounded-[20px] bg-terracota px-1.5 py-0.5 text-[9px] font-extrabold tracking-[0.06em] text-white">
                    TÚ
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className="mx-auto flex size-[46px] items-center justify-center rounded-full text-[23px]"
                  style={parseStyle(h.ringStyle)}
                >
                  {h.emoji}
                </span>
                <p className="mt-2 text-[13px] font-extrabold">{h.nombre}</p>
                <p className="mt-px text-[10.5px] font-semibold text-[#a6927c]">
                  {h.rol}
                </p>

                {cumplidoVisible ? (
                  <p className="mt-[9px] inline-flex items-center gap-1 rounded-[20px] bg-[#e3efdf] px-[9px] py-1 text-[10.5px] font-extrabold text-[#477a4e]">
                    ● Cumplido
                  </p>
                ) : cobertura === undefined ? (
                  <p className="mt-[9px] inline-flex items-center gap-1 rounded-[20px] bg-[#efe7da] px-[9px] py-1 text-[10.5px] font-extrabold text-[#a0917e]">
                    ● Pendiente
                  </p>
                ) : null}

                {puedeCubrir && (
                  <button
                    type="button"
                    onClick={() => cubrir(i)}
                    className="mt-[9px] w-full rounded-[11px] border-[1.5px] border-[#e6b79c] bg-[#fff4ec] px-1 py-[7px] text-[11px] font-extrabold text-[#c25a2e] transition hover:bg-[#ffe9db] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracota"
                  >
                    Cubrir su deber
                  </button>
                )}
                {cobertura === "bonus" && (
                  <p className="mt-[9px] rounded-[11px] bg-[#e3efdf] px-[5px] py-1.5 text-[10px] font-bold leading-[1.25] text-[#477a4e]">
                    Cubierto · +15
                    <br />
                    <span className="font-semibold text-[#7aa17e]">
                      por confirmar
                    </span>
                  </p>
                )}
                {cobertura === "nobonus" && (
                  <p className="mt-[9px] rounded-[11px] bg-[#fbefd6] px-[5px] py-1.5 text-[10px] font-bold leading-[1.25] text-[#9a7a2e]">
                    Cubierto · cumple
                    <br />
                    el tuyo p/ el bono
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Extras del fin de semana (colapsable) */}
      {weekend && (
        <section
          aria-label="Extras del fin de semana"
          className="mt-6 overflow-hidden rounded-[22px] border border-[#efe1c6] bg-crema-soft"
        >
          <h2>
            <button
              type="button"
              onClick={() => setExtrasOpen((v) => !v)}
              aria-expanded={extrasOpen}
              aria-controls="extras-body"
              className="flex w-full items-center gap-3 p-[15px_18px] text-left transition-colors hover:bg-[#f6ecd6] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#a88c5a]"
            >
              <span aria-hidden="true" className="text-[22px]">
                🎉
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[15.5px] font-extrabold tracking-[-0.01em] text-[#5a4420]">
                  Extras del fin de semana
                </span>
                <span className="block text-[11.5px] font-semibold text-[#a88c5a]">
                  Libres · suman hasta +35 pts
                </span>
              </span>
              <span
                aria-hidden="true"
                className="text-[14px] text-[#a88c5a] transition-transform duration-300"
                style={{
                  transform: extrasOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                ▾
              </span>
            </button>
          </h2>
          {/* Colapso animado con grid-rows (0fr <-> 1fr): suave y sin tocar
              propiedades costosas. `inert` saca el contenido del foco y del
              arbol de accesibilidad cuando esta cerrado. */}
          <div
            id="extras-body"
            className="grid transition-[grid-template-rows] duration-300 ease-out"
            style={{ gridTemplateRows: extrasOpen ? "1fr" : "0fr" }}
          >
            <ul inert={!extrasOpen} className="overflow-hidden">
              {extras.map((e) => {
                const estado = estadoExtras[e.clave];
                return (
                  <li
                    key={e.clave}
                    className="flex items-center gap-3 border-t border-[#efe1c6] p-[13px_18px]"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-[38px] flex-shrink-0 items-center justify-center rounded-xl border border-[#eddfc4] bg-crema-card text-[19px]"
                    >
                      {e.icono}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-bold">
                        {e.label}
                      </span>
                      <span className="block text-[11px] font-semibold text-[#a88c5a]">
                        {e.meta}
                      </span>
                    </span>
                    {estado === "done" ? (
                      <span className="flex-shrink-0 rounded-xl bg-[#e3efdf] px-3 py-2 text-[12px] font-extrabold text-[#477a4e]">
                        ✓ Reclamado
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => reclamar(e.clave)}
                        className={
                          estado === "foto"
                            ? "flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-terracota px-[13px] py-2 text-[12.5px] font-extrabold text-white transition hover:brightness-[1.04] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracota"
                            : "flex-shrink-0 rounded-xl border-[1.5px] border-[#e6b79c] bg-[#fff4ec] px-[14px] py-2 text-[12.5px] font-extrabold text-[#c25a2e] transition hover:bg-[#ffe9db] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracota"
                        }
                      >
                        {estado === "foto" ? (
                          <>
                            <span aria-hidden="true">📷</span> Subir foto
                          </>
                        ) : (
                          "Reclamar"
                        )}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Pie: puntaje del mes y posicion */}
      <section
        aria-label="Tu resumen del mes"
        className="mt-[26px] flex items-center gap-3 rounded-[18px] border border-[#f0e6d5] bg-crema-card p-[14px_16px]"
      >
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#b19a80]">
            Tu mes
          </p>
          <p className="mt-[3px] font-display text-[23px] font-extrabold leading-none tracking-[-0.02em] tabular-nums">
            <span aria-live="polite">{puntosMes}</span>{" "}
            <span className="text-[13px] font-bold text-[#9a8c7c]">pts</span>
          </p>
        </div>
        <div className="self-stretch border-l border-[#f0e6d5]" />
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#b19a80]">
            Posición
          </p>
          <p className="mt-1 font-display text-[19px] font-extrabold tracking-[-0.02em]">
            {posicionLabel}
          </p>
        </div>
      </section>
      <p className="mt-3.5 text-center text-[10.5px] font-semibold text-[#bba992]">
        El día cierra a las 3:00 AM · Caracas
      </p>
    </main>
  );
}

// ── Sub-componentes del HERO ────────────────────────────────────────────────

/** Variante A: color + tipografia (sin foto). La preferida del usuario. */
function HeroColor({ deber }: { deber: DeberHoy }) {
  return (
    <div
      className="relative overflow-hidden p-[20px_22px_22px]"
      style={{
        background:
          "linear-gradient(158deg,#FCEBB6 0%,#F6D582 60%,#EFC25A 100%)",
      }}
    >
      <span className="inline-flex items-center gap-1.5 rounded-[30px] bg-[#5e4016]/15 px-[11px] py-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-[#7a5a1e]">
        ⭐ Tu deber de hoy · No negociable
      </span>
      <div className="relative z-[2] mt-4 flex items-center gap-3.5">
        <span
          aria-hidden="true"
          className="text-[60px] leading-none"
          style={{ filter: "drop-shadow(0 6px 8px rgba(120,80,20,.28))" }}
        >
          {deber.emoji}
        </span>
        <div>
          <p className="font-display text-[33px] font-extrabold leading-[0.98] tracking-[-0.03em] text-[#4a3914]">
            {deber.nombre}
          </p>
          <p className="mt-[5px] text-[13px] font-bold text-[#86631f]">
            {deber.puntos} pts · se marca por confianza
          </p>
        </div>
      </div>
      <span
        aria-hidden="true"
        className="absolute -bottom-[26px] -right-3.5 z-[1] text-[130px] leading-none opacity-[0.13]"
      >
        {deber.emoji}
      </span>
    </div>
  );
}

/** Variante B: foto motivacional de fondo (placeholder etiquetado). */
function HeroFoto({ deber }: { deber: DeberHoy }) {
  return (
    <div
      className="relative h-[212px]"
      style={{
        background:
          "repeating-linear-gradient(135deg,#EADDC6,#EADDC6 11px,#E2D2B6 11px,#E2D2B6 22px)",
      }}
    >
      {/* Placeholder de la foto */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <span aria-hidden="true" className="text-[40px] opacity-50">
          {deber.emoji}
        </span>
        <span className="rounded-md bg-crema-card/70 px-[9px] py-1 font-mono text-[11px] tracking-[0.12em] text-[#9c8a6c]">
          FOTO DE SOFI
        </span>
      </div>
      {/* Degradado oscuro para legibilidad del titulo */}
      <div
        className="absolute inset-x-0 bottom-0 h-[70%]"
        style={{
          background:
            "linear-gradient(0deg,rgba(40,28,12,.86) 0%,rgba(40,28,12,.45) 45%,rgba(40,28,12,0) 100%)",
        }}
      />
      <div className="absolute inset-x-5 bottom-4 z-[2]">
        <span className="inline-flex items-center gap-1.5 rounded-[30px] bg-white/20 px-2.5 py-[5px] text-[10px] font-extrabold uppercase tracking-[0.1em] text-white backdrop-blur-sm">
          ⭐ Tu deber de hoy · No negociable
        </span>
        <div className="mt-[11px] flex items-end gap-3">
          <span
            aria-hidden="true"
            className="text-[44px] leading-none"
            style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,.4))" }}
          >
            {deber.emoji}
          </span>
          <div>
            <p className="font-display text-[31px] font-extrabold leading-[0.96] tracking-[-0.03em] text-white">
              {deber.nombre}
            </p>
            <p className="mt-1 text-[12.5px] font-bold text-white/85">
              {deber.puntos} pts · por confianza
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Estado "cumplido": reemplaza al HERO cuando ya se marco el deber. */
function HeroCumplido({ deber }: { deber: DeberHoy }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative overflow-hidden p-[34px_24px] text-center"
      style={{ background: "linear-gradient(158deg,#E8F1E2 0%,#D6E9CE 100%)" }}
    >
      <span
        aria-hidden="true"
        className="animate-pop-lg mx-auto flex size-[70px] items-center justify-center rounded-full bg-verde text-[34px] text-white"
        style={{ boxShadow: "0 14px 30px -10px rgba(92,154,106,.8)" }}
      >
        ✓
      </span>
      <p className="mt-4 font-display text-[25px] font-extrabold tracking-[-0.02em] text-[#33502f]">
        ¡Cumplido! 🎉
      </p>
      <p className="mt-1 text-[14px] font-semibold text-[#5e7a56]">
        {deber.nombre} listo. <strong>+{deber.puntos} pts</strong> a tu mes.
      </p>
      <span
        aria-hidden="true"
        className="absolute -top-3.5 right-[-10px] text-[80px] opacity-[0.12]"
      >
        {deber.emoji}
      </span>
    </div>
  );
}

/**
 * Convierte un string de estilo CSS ("background:#fff;border:1px ...") en el
 * objeto que React espera. Se usa para los estilos de tarjeta/anillo de cada
 * hermano, que vienen como dato (porque dependen del rol y de quien es "yo").
 */
function parseStyle(css: string): React.CSSProperties {
  const estilo: Record<string, string> = {};
  for (const regla of css.split(";")) {
    const [prop, ...resto] = regla.split(":");
    if (!prop || resto.length === 0) continue;
    const clave = prop
      .trim()
      .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    estilo[clave] = resto.join(":").trim();
  }
  return estilo as React.CSSProperties;
}
