import { CoverageSkeleton } from "@/components/coverage/coverage-skeleton";

export default function CoverageLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <div className="h-18 border-b border-slate-200/80 bg-white" />
      <main className="flex-1 py-12 px-4 sm:px-6">
        <CoverageSkeleton />
      </main>
    </div>
  );
}
