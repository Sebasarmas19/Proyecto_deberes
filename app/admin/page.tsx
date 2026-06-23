import { AdminDashboard } from "../_components/admin-dashboard";
import { getAdminDashboardData } from "../../lib/home/admin.service";
import { redirect } from "next/navigation";
import { Suspense } from "react";

/**
 * Página principal del perfil Admin.
 *
 * Muestra el dashboard con accesos rápidos y el plan de la semana.
 * Si no existe hogar (no se ha configurado nada), redirige al setup.
 */
export default async function AdminPage() {
  try {
    const data = await getAdminDashboardData();
    return (
      <Suspense fallback={<div className="p-8 text-center text-[#9a8c7c]">Cargando panel...</div>}>
        <AdminDashboard data={data} />
      </Suspense>
    );
  } catch {
    // Si no hay hogar configurado, redirigir al setup.
    redirect("/setup");
  }
}
