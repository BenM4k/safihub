import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { guardHouseRoute } from "@/services/auth";
import { getHouseBySlug, getWaitingAcceptanceCount, getHouseChecklistDerivation } from "@/dal";
import { PartnerShell } from "@/components/house/partner-shell";

// instant = false: kept on purpose — authenticated partner house workspace
export const instant = false;

interface PartnerWorkspaceLayoutProps {
  children: ReactNode;
  params: Promise<{ houseSlug: string }>;
}

export default async function PartnerWorkspaceLayout({
  children,
  params,
}: PartnerWorkspaceLayoutProps) {
  const { houseSlug } = await params;

  // Guard enforcing membership and returning 404 for unauthorized non-members (AC 23)
  const authCtx = await guardHouseRoute({ houseSlug });

  const house = await getHouseBySlug(houseSlug);
  if (!house) {
    notFound();
  }

  const [waitingCount, checklist] = await Promise.all([
    getWaitingAcceptanceCount(house.id),
    getHouseChecklistDerivation(house.id),
  ]);

  return (
    <PartnerShell
      houseSlug={houseSlug}
      houseName={house.name}
      isPaused={house.isPaused}
      isAdminOverride={authCtx.isAdminOverride}
      memberships={authCtx.memberships}
      user={{
        id: authCtx.user.id,
        name: authCtx.user.name,
        email: authCtx.user.email,
        role: authCtx.user.role,
      }}
      waitingCount={waitingCount}
      checklist={checklist}
    >
      {children}
    </PartnerShell>
  );
}
