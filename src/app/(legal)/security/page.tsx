import type { Metadata } from "next";
import { LegalPageHeader } from "@/components/legal/legal-page-header";
import { SecurityOverviewArch } from "@/components/legal/security/security-overview-arch";
import { SecurityCashLedger } from "@/components/legal/security/security-cash-ledger";
import { SecurityOfflineAntiFraud } from "@/components/legal/security/security-offline-anti-fraud";
import { SecurityVulnerabilityDisclosure } from "@/components/legal/security/security-vulnerability-disclosure";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Sécurité & Protection des Données",
  description:
    "Normes de sécurité de SafiHub à Bukavu : chiffrement des flux, intégrité financière avec grand livre append-only, et tolérance hors-ligne anti-fraude.",
  path: "/security",
});

export default function SecurityPage() {
  return (
    <article className="space-y-16 sm:space-y-24 lg:space-y-28">
      <LegalPageHeader
        badge="Sécurité & Conformité Technique"
        title="Sécurité & Protection des Données"
        description="Notre dispositif technique pour protéger vos échanges, sécuriser les flux de caisse en espèces et garantir l'intégrité de la marketplace à Bukavu."
        activeTab="security"
      />
      <SecurityOverviewArch />
      <SecurityCashLedger />
      <SecurityOfflineAntiFraud />
      <SecurityVulnerabilityDisclosure />
    </article>
  );
}
