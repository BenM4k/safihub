import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SessionNavbar } from "@/components/home/header/session-navbar";
import { Footer } from "@/components/home/footer/footer";
import { FaqContactBanner } from "@/components/home/faq/faq-contact-banner";
import { FaqPageHero } from "@/components/faq/faq-page-hero";
import { FaqExplorer, type FaqCategoryOption } from "@/components/faq/faq-explorer";
import { FaqQuickLinks } from "@/components/faq/faq-quick-links";
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS_META,
  type LocalizedFaqItem,
} from "@/lib/faq-data";
import { constructMetadata } from "@/lib/seo";
import { createBreadcrumbJsonLd, createFaqJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = constructMetadata({
  title: "Questions Fréquentes (FAQ)",
  description:
    "Toutes les réponses sur SafiHub à Bukavu : paiement Cash on Delivery en CDF/USD, comptage contradictoire en 3 points, zones desservies, délais 24h-48h et code de livraison.",
  path: "/faq",
});

function FaqPageSkeleton() {
  return (
    <div className="container-page flex flex-col items-center py-14 sm:py-20">
      <div className="h-6 w-36 rounded-full bg-muted animate-pulse mb-4" />
      <div className="h-10 w-72 rounded-xl bg-muted animate-pulse mb-3" />
      <div className="h-5 w-96 max-w-full rounded-lg bg-muted animate-pulse mb-10" />
      <div className="w-full max-w-4xl lg:max-w-5xl space-y-4">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="h-16 w-full rounded-2xl bg-card border border-border animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

async function FaqPageContent() {
  const t = await getTranslations("faq");

  const items: LocalizedFaqItem[] = FAQ_ITEMS_META.map((meta) => ({
    id: meta.id,
    category: meta.category,
    categoryLabel: t(`categories.${meta.category}`),
    question: t(`items.${meta.id}.question`),
    answer: t(`items.${meta.id}.answer`),
    links: meta.links?.map((link) => ({
      label: t(`links.${link.key}`),
      href: link.href,
    })),
  }));

  const categories: FaqCategoryOption[] = FAQ_CATEGORIES.map((id) => ({
    id,
    label: t(`categories.${id}`),
    count:
      id === "all"
        ? items.length
        : items.filter((item) => item.category === id).length,
  }));

  const faqJsonLd = createFaqJsonLd(items);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container-page flex flex-col items-center">
        <FaqPageHero
          badge={t("page.badge")}
          breadcrumbHome={t("page.breadcrumbHome")}
          breadcrumbFaq={t("page.breadcrumbFaq")}
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <FaqExplorer items={items} categories={categories} />
        <FaqQuickLinks
          title={t("page.quickLinksTitle")}
          links={[
            {
              href: "/houses",
              title: t("page.quickLinkHousesTitle"),
              description: t("page.quickLinkHousesDesc"),
              icon: "houses",
            },
            {
              href: "/coverage",
              title: t("page.quickLinkCoverageTitle"),
              description: t("page.quickLinkCoverageDesc"),
              icon: "coverage",
            },
            {
              href: "/track",
              title: t("page.quickLinkTrackTitle"),
              description: t("page.quickLinkTrackDesc"),
              icon: "track",
            },
          ]}
        />
        <FaqContactBanner />
      </div>
    </>
  );
}

export default function FaqPage() {
  const breadcrumbsJsonLd = createBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "FAQ", path: "/faq" },
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary-soft selection:text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <SessionNavbar variant="solid" />
      <main className="flex-1 py-14 sm:py-20">
        <Suspense fallback={<FaqPageSkeleton />}>
          <FaqPageContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
