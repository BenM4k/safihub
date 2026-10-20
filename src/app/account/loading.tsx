import { AccountSkeleton } from "@/components/account/account-skeleton";

export default function AccountLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <div className="h-18 border-b border-slate-200/80 bg-white" />
      <main className="flex-1 py-10 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <AccountSkeleton />
      </main>
    </div>
  );
}
