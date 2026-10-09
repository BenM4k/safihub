import type { Metadata } from "next";
import { LegalPageHeader } from "@/components/legal/legal-page-header";
import { ConsentPolicyHero } from "@/components/legal/consent/consent-policy-hero";
import { ConsentCaptureRules } from "@/components/legal/consent/consent-capture-rules";
import { ConsentStorageLifecycle } from "@/components/legal/consent/consent-storage-lifecycle";
import { ConsentCustomerRights } from "@/components/legal/consent/consent-customer-rights";

export const metadata: Metadata = {
  title: "Consentement Photos & Protection du Linge — SafiHub Bukavu",
  description:
    "Politique de capture photographique du linge chez SafiHub à Bukavu : aucun visage, chiffrement Cloudflare R2, purge sous 90 jours et droits des clients.",
};

export default function PhotoConsentPage() {
  return (
    <article className="space-y-16 sm:space-y-24 lg:space-y-28">
      <LegalPageHeader
        badge="Consentement & Protection des Biens"
        title="Consentement Photos & Linge"
        description="Le protocole transparent de prise de vue pour garantir l'intégrité de vos vêtements à Bukavu sans compromettre votre vie privée."
        activeTab="consent"
      />
      <ConsentPolicyHero />
      <ConsentCaptureRules />
      <ConsentStorageLifecycle />
      <ConsentCustomerRights />
    </article>
  );
}
