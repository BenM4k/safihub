import { CheckoutSkeleton } from "@/components/checkout/checkout-skeleton";

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <div className="h-18 border-b border-slate-200/80 bg-white" />
      <main className="flex-1 flex flex-col py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <CheckoutSkeleton />
      </main>
    </div>
  );
}
