import { AdminDashboard } from "../_components/admin-dashboard";
import { getAdminDashboardData } from "../../lib/home/admin.service";
import { redirect } from "next/navigation";

/**
 * Página principal del perfil Admin.
 *
 * Muestra el dashboard con accesos rápidos y el plan de la semana.
 * Si no existe hogar (no se ha configurado nada), redirige al setup.
 */
export default async function AdminPage() {
  try {
    const data = await getAdminDashboardData();
    return <AdminDashboard data={data} />;
  } catch {
    // Si no hay hogar configurado, redirigir al setup.
    redirect("/setup");
  }
}
