import { ProfileSelector } from "./_components/profile-selector";
import { LandingPage } from "./_components/landing-page";
import { getProfilePageData } from "../lib/home/profile.service";

/**
 * Página raíz — decide qué mostrar según el estado de la app:
 *
 * - Si NO hay hogar configurado → Landing page informativa con botón "Comenzar"
 *   (primera vez que alguien abre la app).
 * - Si YA hay hogar y usuarios → Selector de perfiles (elegir quién eres).
 */
export default async function Home() {
  const data = await getProfilePageData();

  if (data.estado === "sin_hogar") {
    return <LandingPage />;
  }

  return (
    <ProfileSelector
      estado="con_usuarios"
      nombreHogar={data.nombreHogar}
      participantes={data.participantes}
    />
  );
}
