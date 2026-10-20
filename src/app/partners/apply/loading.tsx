import { PartnerApplySkeleton } from "@/components/partner/partner-apply-skeleton";

export default function PartnerApplyLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <div className="h-18 border-b border-slate-200/80 bg-white" />
      <main className="flex-1 py-12 sm:py-16">
        <PartnerApplySkeleton />
      </main>
    </div>
  );
}
