import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { LegalPageHeader } from "@/components/legal/legal-page-header";
import { LegalPageSkeleton } from "@/components/legal/legal-page-skeleton";
import { ConsentPolicyHero } from "@/components/legal/consent/consent-policy-hero";
import { ConsentCaptureRules } from "@/components/legal/consent/consent-capture-rules";
import { ConsentStorageLifecycle } from "@/components/legal/consent/consent-storage-lifecycle";
import { ConsentCustomerRights } from "@/components/legal/consent/consent-customer-rights";

export const metadata: Metadata = {
  title: "Consentement & Charte Photo — SafiHub Bukavu",
  description:
    "Politique de prise de vue et de conservation des photos d'état du linge et de preuve de livraison sur SafiHub à Bukavu (RDC).",
};

async function PhotoConsentContent() {
  const t = await getTranslations("consentPage");
  return (
    <article className="space-y-16 sm:space-y-24 lg:space-y-28">
      <LegalPageHeader
        badge={t("headerBadge")}
        title={t("headerTitle")}
        description={t("headerDescription")}
        activeTab="consent"
      />
      <ConsentPolicyHero />
      <ConsentCaptureRules />
      <ConsentStorageLifecycle />
      <ConsentCustomerRights />
    </article>
  );
}

export default function PhotoConsentPage() {
  return (
    <Suspense fallback={<LegalPageSkeleton activeTabLabel="Consentement Photos" />}>
      <PhotoConsentContent />
    </Suspense>
  );
}
