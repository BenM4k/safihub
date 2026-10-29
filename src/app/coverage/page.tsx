import { Suspense } from "react";
import type { Metadata } from "next";
import { SessionNavbar } from "@/components/home/header/session-navbar";
import { Footer } from "@/components/home/footer/footer";
import { getCurrentUser } from "@/services/auth";
import { getCachedNeighborhoods } from "@/lib/cached-data";
import { CoverageRequestForm } from "@/components/coverage/coverage-request-form";
import { CoverageSkeleton } from "@/components/coverage/coverage-skeleton";

export const metadata: Metadata = {
  title: "Demande de couverture | SafiHub Bukavu",
  description:
    "Demandez l'ouverture des services de collecte et livraison de linge dans votre quartier à Bukavu.",
};

interface CoveragePageProps {
  searchParams: Promise<{ neighborhoodId?: string }>;
}

async function CoverageContent({ searchParams }: CoveragePageProps) {
  const [{ neighborhoodId }, user, neighborhoods] = await Promise.all([
    searchParams,
    getCurrentUser(),
    getCachedNeighborhoods(),
  ]);

  return (
    <CoverageRequestForm
      neighborhoods={neighborhoods}
      initialNeighborhoodId={neighborhoodId}
      defaultPhone={user?.contactPhone || ""}
    />
  );
}

export default function CoveragePage({ searchParams }: CoveragePageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <SessionNavbar variant="solid" />
      <main className="flex-1 py-12 px-4 sm:px-6">
        <Suspense fallback={<CoverageSkeleton />}>
          <CoverageContent searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
