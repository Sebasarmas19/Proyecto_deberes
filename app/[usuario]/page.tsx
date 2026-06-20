import { HomeScreen } from "../_components/home-screen";
import { getHomeScreenData } from "../../lib/home/home.service";
import { redirect } from "next/navigation";

/**
 * Vista principal del usuario — ahora vive en /[usuario].
 *
 * El nombre del usuario se saca directamente del segmento de la URL.
 * Ejemplo: /samuel → muestra los deberes desde la perspectiva de Samuel.
 */

type Props = {
  params: Promise<{ usuario: string }>;
};

export default async function UsuarioHome({ params }: Props) {
  const { usuario } = await params;
  const nombreDecodificado = decodeURIComponent(usuario);

  try {
    const data = await getHomeScreenData(nombreDecodificado);

    return (
      <HomeScreen
        variant="plain"
        userName={data.userName}
        dateLabel={data.dateLabel}
        deberesHoy={data.deberesHoy}
        hermanos={data.hermanos}
        extras={data.extras}
        puntosBase={data.puntosBase}
        posicionLabel={data.posicionLabel}
      />
    );
  } catch {
    // Si el usuario no existe o no hay hogar, redirigir al selector de perfiles.
    redirect("/");
  }
}
