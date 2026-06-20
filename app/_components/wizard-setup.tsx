"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setupInicialAction } from "../../lib/hogar/hogar.actions";

type SetupData = {
  nombre: string;
  zonaHoraria: string;
  horaCierreDia: string;
  claveAdmin: string;
  confirmarClave: string;
  participantes: string[];
};

export function WizardSetup() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados visuales extra
  const [mostrarClave, setMostrarClave] = useState(false);
  const [mostrarConfirmarClave, setMostrarConfirmarClave] = useState(false);

  const [data, setData] = useState<SetupData>({
    nombre: "",
    zonaHoraria: "America/Caracas",
    horaCierreDia: "03:00",
    claveAdmin: "",
    confirmarClave: "",
    participantes: ["", ""], // Mínimo 2 inputs de inicio
  });

  const updateData = (key: keyof SetupData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const updateParticipante = (index: number, value: string) => {
    const nuevos = [...data.participantes];
    nuevos[index] = value;
    setData((prev) => ({ ...prev, participantes: nuevos }));
  };

  const addParticipante = () => {
    setData((prev) => ({
      ...prev,
      participantes: [...prev.participantes, ""],
    }));
  };

  const removeParticipante = (index: number) => {
    if (data.participantes.length <= 2) return;
    const nuevos = [...data.participantes];
    nuevos.splice(index, 1);
    setData((prev) => ({ ...prev, participantes: nuevos }));
  };

  const validarPaso1 = () => {
    if (!data.nombre.trim()) return "El nombre del hogar es obligatorio.";
    try {
      Intl.DateTimeFormat(undefined, { timeZone: data.zonaHoraria });
    } catch (e) {
      return "Zona horaria inválida. Ej: America/Caracas";
    }
    return null;
  };

  const validarPaso2 = () => {
    if (!data.claveAdmin) return "La contraseña del administrador es obligatoria.";
    if (data.claveAdmin !== data.confirmarClave) return "Las contraseñas no coinciden.";
    return null;
  };

  const validarPaso3 = () => {
    const filtrados = data.participantes.filter((p) => p.trim() !== "");
    if (filtrados.length < 2) return "Debes añadir al menos dos participantes.";
    return null;
  };

  const avanzar = () => {
    let err = null;
    if (paso === 1) err = validarPaso1();
    if (paso === 2) err = validarPaso2();
    if (paso === 3) err = validarPaso3();

    if (err) {
      setError(err);
      return;
    }
    setPaso(paso + 1);
  };

  const retroceder = () => {
    setError(null);
    setPaso(paso - 1);
  };

  const handleSubmit = async () => {
    setCargando(true);
    setError(null);

    const formData = new FormData();
    formData.append("nombre", data.nombre);
    formData.append("zonaHoraria", data.zonaHoraria);
    formData.append("horaCierreDia", data.horaCierreDia);
    formData.append("bonoAyuda", "5");
    formData.append("penalizacionFallo", "15");
    formData.append("penalizacionColectiva", "10");
    formData.append("claveAdmin", data.claveAdmin);
    formData.append(
      "participantes",
      data.participantes.filter((p) => p.trim() !== "").join(",")
    );

    try {
      const res = await setupInicialAction(formData);
      if (res.ok) {
        router.push("/");
      } else {
        setError(res.error);
        setCargando(false);
      }
    } catch (e) {
      setError("Error de conexión. Intenta de nuevo.");
      setCargando(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div 
        className="relative w-full max-w-[540px] rounded-[32px] bg-white px-6 py-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:px-12 md:py-14 animate-rise"
      >
        {/* TOP LEFT BACK BUTTON */}
        {paso > 1 && (
          <button
            onClick={retroceder}
            type="button"
            disabled={cargando}
            className="absolute left-6 top-8 flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#b19a80] transition-colors hover:text-tinta md:left-10 md:top-10"
          >
            <span className="text-[16px] leading-none">←</span> VOLVER
          </button>
        )}

        <div className={`mx-auto max-w-[400px] ${paso > 1 ? "mt-10" : ""}`}>
          {/* HEADER ALIGNED LEFT */}
          <div className="mb-8 text-left">
            <h1 className="mb-2 font-display text-[26px] font-extrabold tracking-[-0.02em] text-tinta">
              Configuración inicial
            </h1>
            <div className="flex items-center gap-2 text-[13px] font-bold text-[#b19a80]">
              Paso {paso} de 4
            </div>
            
            {/* Barra de progreso alineada a la izquierda */}
            <div className="mt-3 flex h-[4px] w-[140px] gap-1 overflow-hidden rounded-full bg-[#f0e6d5]">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-full flex-1 rounded-full transition-all duration-300 ${
                    i <= paso ? "bg-terracota" : "bg-transparent"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="animate-rise">
            {error && (
              <div className="mb-6 rounded-[14px] bg-[#fdf2f2] p-4 text-[13px] font-semibold text-[#d94a4a]">
                {error}
              </div>
            )}

            {/* PASO 1 */}
            {paso === 1 && (
              <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
                <div>
                  <label className="mb-2 block text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#b19a80]">
                    Nombre del hogar
                  </label>
                  <input
                    type="text"
                    value={data.nombre}
                    onChange={(e) => updateData("nombre", e.target.value)}
                    placeholder="Ej. Familia Armas"
                    className="w-full rounded-[14px] border border-[#e6d9c4] bg-white px-4 py-3.5 text-[15px] font-semibold text-tinta outline-none transition-colors focus:border-terracota"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#b19a80]">
                    Zona Horaria
                  </label>
                  <input
                    type="text"
                    value={data.zonaHoraria}
                    onChange={(e) => updateData("zonaHoraria", e.target.value)}
                    placeholder="America/Caracas"
                    className="w-full rounded-[14px] border border-[#e6d9c4] bg-white px-4 py-3.5 text-[15px] font-semibold text-tinta outline-none transition-colors focus:border-terracota"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#b19a80]">
                    Hora de cierre del día
                  </label>
                  <input
                    type="time"
                    value={data.horaCierreDia}
                    onChange={(e) => updateData("horaCierreDia", e.target.value)}
                    className="w-full rounded-[14px] border border-[#e6d9c4] bg-white px-4 py-3.5 text-[15px] font-semibold text-tinta outline-none transition-colors focus:border-terracota"
                  />
                  <p className="mt-2 text-[12px] font-medium text-[#c5b090]">
                    Los deberes marcados después de esta hora cuentan para el día siguiente.
                  </p>
                </div>
              </div>
            )}

            {/* PASO 2 */}
            {paso === 2 && (
              <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
                <p className="text-[14px] font-medium leading-[1.5] text-[#7a6d60]">
                  La configuración de los puntos por tarea se podrá ajustar luego desde el panel del Admin. Por ahora, solo necesitamos asegurar tu panel.
                </p>
                <div>
                  <label className="mb-2 block text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#b19a80]">
                    Contraseña de Admin
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarClave ? "text" : "password"}
                      value={data.claveAdmin}
                      onChange={(e) => updateData("claveAdmin", e.target.value)}
                      placeholder="Crea una contraseña segura"
                      className="w-full rounded-[14px] border border-[#e6d9c4] bg-white px-4 py-3.5 pr-12 text-[15px] font-semibold text-tinta outline-none transition-colors focus:border-terracota"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarClave(!mostrarClave)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[18px] text-[#b19a80] hover:text-tinta"
                      title="Mostrar contraseña"
                    >
                      {mostrarClave ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#b19a80]">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarConfirmarClave ? "text" : "password"}
                      value={data.confirmarClave}
                      onChange={(e) => updateData("confirmarClave", e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full rounded-[14px] border border-[#e6d9c4] bg-white px-4 py-3.5 pr-12 text-[15px] font-semibold text-tinta outline-none transition-colors focus:border-terracota"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmarClave(!mostrarConfirmarClave)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[18px] text-[#b19a80] hover:text-tinta"
                      title="Mostrar contraseña"
                    >
                      {mostrarConfirmarClave ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3 */}
            {paso === 3 && (
              <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                <p className="mb-6 text-[14px] font-medium leading-[1.5] text-[#7a6d60]">
                  Agrega a las personas que participarán en los deberes (mínimo dos).
                </p>

                {data.participantes.map((nombre, idx) => (
                  <div key={idx} className="relative">
                    <label className="mb-2 block text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#b19a80]">
                      Participante {idx + 1}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => updateParticipante(idx, e.target.value)}
                        placeholder="Nombre"
                        className="flex-1 rounded-[14px] border border-[#e6d9c4] bg-white px-4 py-3.5 text-[15px] font-semibold text-tinta outline-none transition-colors focus:border-terracota"
                        autoFocus={idx === 0}
                      />
                      {data.participantes.length > 2 && (
                        <button
                          onClick={() => removeParticipante(idx)}
                          type="button"
                          className="flex w-[50px] items-center justify-center rounded-[14px] bg-[#fdf2f2] text-[#d94a4a] transition-colors hover:bg-[#fbdada]"
                          title="Quitar"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={addParticipante}
                  type="button"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-[#e6d9c4] py-3 text-[14px] font-bold text-[#b19a80] transition-colors hover:border-[#d6c9b4] hover:bg-[#fcf9f5] hover:text-[#9a8c7c]"
                >
                  <span className="text-[18px] leading-none">+</span> Añadir otro participante
                </button>
              </div>
            )}

            {/* PASO 4 - CONFIRMACION */}
            {paso === 4 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <div
                  className="rounded-[18px] bg-[#fcf9f5] p-5 border border-[#f0e6d5]"
                >
                  <h2 className="mb-4 text-[16px] font-bold text-tinta">Resumen</h2>
                  
                  <ul className="space-y-3 text-[14px]">
                    <li className="flex justify-between border-b border-[#ebdaca] pb-2">
                      <span className="font-semibold text-[#8b7d6a]">Hogar:</span>
                      <span className="font-bold text-tinta">{data.nombre}</span>
                    </li>
                    <li className="flex justify-between border-b border-[#ebdaca] pb-2">
                      <span className="font-semibold text-[#8b7d6a]">Cierre del día:</span>
                      <span className="font-bold text-tinta">{data.horaCierreDia}</span>
                    </li>
                    <li className="flex justify-between items-center border-b border-[#ebdaca] pb-2">
                      <span className="font-semibold text-[#8b7d6a]">Admin:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-tinta">
                          {mostrarClave ? data.claveAdmin : "••••••••"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setMostrarClave(!mostrarClave)}
                          className="text-[16px] text-[#b19a80] hover:text-tinta focus:outline-none"
                          title="Mostrar contraseña"
                        >
                          {mostrarClave ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-[#8b7d6a]">Participantes:</span>
                      <span className="font-bold text-tinta text-right">
                        {data.participantes.filter((p) => p.trim() !== "").join(", ")}
                      </span>
                    </li>
                  </ul>
                </div>
                <p className="text-center text-[13px] font-medium text-[#7a6d60]">
                  Si todo se ve bien, presiona el botón para finalizar.
                </p>
              </div>
            )}

            {/* BOTON DE SIGUIENTE / FINALIZAR */}
            <div className="mt-8">
              {paso < 4 ? (
                <button
                  onClick={avanzar}
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-terracota py-[18px] font-display text-[16px] font-bold text-white transition-all hover:brightness-[1.04] active:scale-[0.98]"
                  style={{ boxShadow: "0 6px 16px -6px rgba(210,96,47,.4)" }}
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  type="button"
                  disabled={cargando}
                  className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#4a7c59] py-[18px] font-display text-[16px] font-bold text-white transition-all hover:brightness-[1.04] active:scale-[0.98] disabled:opacity-80"
                  style={{ boxShadow: "0 6px 16px -6px rgba(74,124,89,.4)" }}
                >
                  {cargando ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creando hogar...
                    </>
                  ) : (
                    "Crear hogar"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
