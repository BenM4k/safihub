import type { Metadata } from "next";
import { LegalPageHeader } from "@/components/legal/legal-page-header";
import { PrivacyDataCollected } from "@/components/legal/privacy/privacy-data-collected";
import { PrivacyFirewall } from "@/components/legal/privacy/privacy-firewall";
import { PrivacyPhotosMedia } from "@/components/legal/privacy/privacy-photos-media";
import { PrivacyRightsRetention } from "@/components/legal/privacy/privacy-rights-retention";

export const metadata: Metadata = {
  title: "Politique de Confidentialité — SafiHub Bukavu",
  description:
    "Protection de vos données chez SafiHub à Bukavu : pare-feu de confidentialité client, photos de linge sécurisées sans visages, et purge sous 90 jours.",
};

export default function PrivacyPage() {
  return (
    <article className="space-y-16 sm:space-y-24 lg:space-y-28">
      <LegalPageHeader
        badge="Protection de la Vie Privée"
        title="Politique de Confidentialité"
        description="Comment nous protégeons vos données personnelles : anonymisation stricte vis-à-vis des pressings partenaires, conservation sécurisée des photos et respect de votre vie privée."
        activeTab="privacy"
      />
      <PrivacyDataCollected />
      <PrivacyFirewall />
      <PrivacyPhotosMedia />
      <PrivacyRightsRetention />
    </article>
  );
}
