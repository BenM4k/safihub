import { Suspense } from "react";
import { SessionNavbar } from "@/components/home/header/session-navbar";
import { HeroSection } from "@/components/home/hero/hero-section";
import { TrustBanner } from "@/components/home/trust-banner/trust-banner";
import { ServicesTabs } from "@/components/home/services-tabs/services-tabs";
import { HowItWorks } from "@/components/home/how-it-works/how-it-works";
import { ProductsCatalogue } from "@/components/home/products-catalogue/products-catalogue";
import { Testimonials } from "@/components/home/testimonials/testimonials";
import { FaqSection } from "@/components/home/faq/faq-section";
import { Footer } from "@/components/home/footer/footer";
import { getCurrentUser } from "@/services/auth";
import { getCachedNeighborhoods } from "@/lib/cached-data";
import type { NeighborhoodRecord } from "@/dal";

async function HomeUserSections({
  neighborhoods,
}: {
  neighborhoods: NeighborhoodRecord[];
}) {
  const user = await getCurrentUser();
  return (
    <>
      <HeroSection user={user} neighborhoods={neighborhoods} />
      <TrustBanner user={user} />
      <ServicesTabs user={user} />
    </>
  );
}

/**
 * SafiHub Master Homepage
 * Faithful reproduction of public/ref reference design:
 * - Each section spans at least 100vh (min-h-screen)
 * - Solid palette with brand royal indigo #2824D5, slate #101828 (zero gradients)
 * - Calibrated typography and mobile-first responsive layout
 */
export default async function HomePage() {
  const neighborhoods = await getCachedNeighborhoods();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary-soft selection:text-primary">
      <SessionNavbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <>
              <HeroSection user={null} neighborhoods={neighborhoods} />
              <TrustBanner user={null} />
              <ServicesTabs user={null} />
            </>
          }
        >
          <HomeUserSections neighborhoods={neighborhoods} />
        </Suspense>
        <HowItWorks />
        <ProductsCatalogue />
        <Testimonials />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
