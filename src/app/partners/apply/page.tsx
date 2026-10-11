import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { getNeighborhoods } from "@/dal";
import { PartnerApplicationForm } from "@/components/partner/partner-application-form";
import { PartnerBenefits } from "@/components/partner/partner-benefits";
import { Navbar } from "@/components/home/header/navbar";
import { Footer } from "@/components/home/footer/footer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("partnerApply");
  return {
    title: `${t("title")} | SafiHub Bukavu`,
    description: t("subtitle"),
  };
}

export default async function PartnerApplyPage() {
  const t = await getTranslations("partnerApply");
  const neighborhoods = await getNeighborhoods();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar variant="solid" />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header section */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 stack gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mx-auto">
              <Sparkles className="size-3.5" />
              <span>SafiHub Partner Network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-heading tracking-tight">
              {t("title")}
            </h1>
            <p className="text-sm sm:text-base text-ink-600 leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* Form and Value Props Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <PartnerApplicationForm
                neighborhoods={neighborhoods.map((n) => ({
                  id: n.id,
                  name: n.name,
                }))}
              />
            </div>
            <aside className="lg:col-span-1">
              <PartnerBenefits />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
