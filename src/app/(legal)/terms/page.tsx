import type { Metadata } from "next";
import { LegalPageHeader } from "@/components/legal/legal-page-header";
import { TermsDefinitions } from "@/components/legal/terms/terms-definitions";
import { TermsOrderLifecycle } from "@/components/legal/terms/terms-order-lifecycle";
import { TermsPricingPayment } from "@/components/legal/terms/terms-pricing-payment";
import { TermsLiabilityDisputes } from "@/components/legal/terms/terms-liability-disputes";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — SafiHub Bukavu",
  description:
    "Conditions générales de la plateforme SafiHub à Bukavu : commandes, double comptage au seuil, tarification bidevise CDF/USD, responsabilités et garanties.",
};

export default function TermsPage() {
  return (
    <article className="space-y-16 sm:space-y-24 lg:space-y-28">
      <LegalPageHeader
        badge="Cadre Juridique & Engagements"
        title="Conditions Générales d'Utilisation"
        description="Les règles régissant la commande de pressing à Bukavu, les contrôles contradictoires au seuil, les paiements en espèces et les garanties mutuelles."
        activeTab="terms"
      />
      <TermsDefinitions />
      <TermsOrderLifecycle />
      <TermsPricingPayment />
      <TermsLiabilityDisputes />
    </article>
  );
}
