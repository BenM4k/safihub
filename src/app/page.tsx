import { Navbar } from "@/components/home/header/navbar";
import { HeroSection } from "@/components/home/hero/hero-section";
import { TrustBanner } from "@/components/home/trust-banner/trust-banner";
import { ServicesTabs } from "@/components/home/services-tabs/services-tabs";
import { HowItWorks } from "@/components/home/how-it-works/how-it-works";
import { ProductsCatalogue } from "@/components/home/products-catalogue/products-catalogue";
import { Testimonials } from "@/components/home/testimonials/testimonials";
import { FaqSection } from "@/components/home/faq/faq-section";
import { Footer } from "@/components/home/footer/footer";

/**
 * SafiHub Master Homepage
 * Faithful reproduction of public/ref reference design:
 * - Each section spans at least 100vh (min-h-screen)
 * - Solid palette with brand royal indigo #2824D5, slate #101828 (zero gradients)
 * - Calibrated typography and mobile-first responsive layout
 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary-soft selection:text-primary">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <TrustBanner />
        <ServicesTabs />
        <HowItWorks />
        <ProductsCatalogue />
        <Testimonials />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
