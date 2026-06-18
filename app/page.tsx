import { HomeScreen } from "./_components/home-screen";
import { getHomeScreenData } from "../lib/home/home.service";

/**
 * Vista principal de la app.
 *
 * Ahora está conectada directamente a la base de datos a través de home.service.ts.
 * Para probar diferentes vistas de usuarios, puedes pasar el parámetro ?usuario=Nombre
 * en la URL. Por ejemplo:
 * - /?usuario=Samuel
 * - /?usuario=Silvana
 * - /?usuario=Sebastián
 */

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: Props) {
  // En Next.js 15+ searchParams es una promesa.
  const resolvedParams = await searchParams;
  
  // Extraemos el parámetro ?usuario=...
  const usuarioParam = typeof resolvedParams.usuario === "string" ? resolvedParams.usuario : undefined;

  // Obtenemos todos los datos de la base de datos
  const data = await getHomeScreenData(usuarioParam);

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
}
