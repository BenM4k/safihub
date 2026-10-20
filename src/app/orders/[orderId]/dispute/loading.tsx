import { DisputeSkeleton } from "@/components/disputes/dispute-skeleton";

export default function OrderDisputeLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <DisputeSkeleton />
    </div>
  );
}
