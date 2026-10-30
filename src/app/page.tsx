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
import { getCurrentUser, type AuthenticatedUser } from "@/services/auth";
import { getCachedNeighborhoods } from "@/lib/cached-data";
import type { NeighborhoodRecord } from "@/dal";

async function HeroWithNeighborhoods({
  neighborhoodsPromise,
  user,
}: {
  neighborhoodsPromise: Promise<NeighborhoodRecord[]>;
  user?: AuthenticatedUser | null;
}) {
  const neighborhoods = await neighborhoodsPromise;
  return <HeroSection user={user} neighborhoods={neighborhoods} />;
}

async function HomeUserSections({
  neighborhoodsPromise,
}: {
  neighborhoodsPromise: Promise<NeighborhoodRecord[]>;
}) {
  const user = await getCurrentUser();
  return (
    <>
      <Suspense fallback={<HeroSection user={user} />}>
        <HeroWithNeighborhoods
          neighborhoodsPromise={neighborhoodsPromise}
          user={user}
        />
      </Suspense>
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
export default function HomePage() {
  const neighborhoodsPromise = getCachedNeighborhoods();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary-soft selection:text-primary">
      <SessionNavbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <>
              <Suspense fallback={<HeroSection user={null} />}>
                <HeroWithNeighborhoods
                  neighborhoodsPromise={neighborhoodsPromise}
                  user={null}
                />
              </Suspense>
              <TrustBanner user={null} />
              <ServicesTabs user={null} />
            </>
          }
        >
          <HomeUserSections neighborhoodsPromise={neighborhoodsPromise} />
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
