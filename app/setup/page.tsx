import { WizardSetup } from "../_components/wizard-setup";
import { getProfilePageData } from "../../lib/home/profile.service";
import { redirect } from "next/navigation";

export default async function SetupPage() {
  const data = await getProfilePageData();

  // Si ya existe el hogar, no debería estar en el setup inicial.
  if (data.estado !== "sin_hogar") {
    redirect("/");
  }

  return <WizardSetup />;
}
