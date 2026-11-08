import { Suspense } from "react";
import type { Metadata } from "next";
import { SessionNavbar } from "@/components/home/header/session-navbar";
import { Footer } from "@/components/home/footer/footer";
import { getCurrentUser } from "@/services/auth";
import { getCachedNeighborhoods } from "@/lib/cached-data";
import { CoverageRequestForm } from "@/components/coverage/coverage-request-form";
import { CoverageSkeleton } from "@/components/coverage/coverage-skeleton";
import { constructMetadata } from "@/lib/seo";
import { createBreadcrumbJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = constructMetadata({
  title: "Zones de Couverture & Quartiers Desservis à Bukavu",
  description:
    "Consultez les quartiers desservis par SafiHub à Bukavu (Ibanda, Kadutu, Bagira) ou votez pour l'ouverture de la collecte et livraison dans votre avenue.",
  path: "/coverage",
});

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
  const breadcrumbsJsonLd = createBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Couverture", path: "/coverage" },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
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
