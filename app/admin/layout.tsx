import { redirect } from "next/navigation";
import { verificarSesionActual } from "@/lib/auth/auth.service";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await verificarSesionActual();

  if (!sesion || sesion.rol !== "admin") {
    // Si no está autenticado como admin, se le envía al inicio para que ingrese la clave
    redirect("/");
  }

  return <>{children}</>;
}
