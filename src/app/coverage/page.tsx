import type { Metadata } from "next";
import { Navbar } from "@/components/home/header/navbar";
import { Footer } from "@/components/home/footer/footer";
import { getCurrentUser } from "@/services/auth";
import { getNeighborhoods } from "@/dal";
import { CoverageRequestForm } from "@/components/coverage/coverage-request-form";

export const metadata: Metadata = {
  title: "Demande de couverture | SafiHub Bukavu",
  description:
    "Demandez l'ouverture des services de collecte et livraison de linge dans votre quartier à Bukavu.",
};

interface CoveragePageProps {
  searchParams: Promise<{ neighborhoodId?: string }>;
}

export default async function CoveragePage({ searchParams }: CoveragePageProps) {
  const { neighborhoodId } = await searchParams;
  const [user, neighborhoods] = await Promise.all([
    getCurrentUser(),
    getNeighborhoods(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar variant="solid" user={user} />
      <main className="flex-1 py-12 px-4 sm:px-6">
        <CoverageRequestForm
          neighborhoods={neighborhoods}
          initialNeighborhoodId={neighborhoodId}
          defaultPhone={user?.contactPhone || ""}
        />
      </main>
      <Footer />
    </div>
  );
}
