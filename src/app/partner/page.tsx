import { redirect } from "next/navigation";
import { guardHouseRoute } from "@/services/auth";
import { getHouses } from "@/dal";
import {
  PartnerChooserMemberships,
  PartnerChooserAdmin,
  PartnerChooserEmpty,
} from "@/components/house/chooser";

export const metadata = {
  title: "Espace Partenaire — SafiHub",
  description: "Sélectionnez votre atelier de pressing pour accéder à votre tableau de bord.",
};

// instant = false: kept on purpose — authenticated partner chooser route
export const instant = false;

/**
 * Route page for /partner - routes user to their single house or presents the chooser.
 */
export default async function PartnerChooserPage() {
  const authCtx = await guardHouseRoute();

  // If house user with exactly one membership, redirect immediately
  if (
    authCtx.user.role === "house" &&
    authCtx.memberships &&
    authCtx.memberships.length === 1
  ) {
    redirect(`/partner/${authCtx.memberships[0].houseSlug}`);
  }

  // If house user with multiple memberships
  if (
    authCtx.user.role === "house" &&
    authCtx.memberships &&
    authCtx.memberships.length > 1
  ) {
    return <PartnerChooserMemberships memberships={authCtx.memberships} />;
  }

  // If admin user, show all houses with admin delegated access
  if (authCtx.user.role === "admin") {
    const allHouses = await getHouses();
    return <PartnerChooserAdmin houses={allHouses} />;
  }

  // Default empty state if no memberships assigned
  return <PartnerChooserEmpty />;
}
