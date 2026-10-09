import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPageHeader } from "@/components/legal/legal-page-header";
import { ConsentPolicyHero } from "@/components/legal/consent/consent-policy-hero";
import { ConsentCaptureRules } from "@/components/legal/consent/consent-capture-rules";
import { ConsentStorageLifecycle } from "@/components/legal/consent/consent-storage-lifecycle";
import { ConsentCustomerRights } from "@/components/legal/consent/consent-customer-rights";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("consentPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function PhotoConsentPage() {
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
