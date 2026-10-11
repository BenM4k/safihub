import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { guardHouseRoute } from "@/services/auth";
import { getHouseBySlug } from "@/dal";
import { HouseHeader } from "@/components/house/house-header";
import { HouseNavTabs } from "@/components/house/house-nav-tabs";

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <HouseHeader
        houseName={house.name}
        isPaused={house.isPaused}
        houseSlug={houseSlug}
        isAdminOverride={authCtx.isAdminOverride}
        memberships={authCtx.memberships}
      />
      <HouseNavTabs houseSlug={houseSlug} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
