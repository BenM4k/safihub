import { CartSkeleton } from "@/components/cart/cart-skeleton";

export default function CartLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <div className="h-18 border-b border-slate-200/80 bg-white" />
      <main className="flex-1 flex flex-col">
        <CartSkeleton />
      </main>
    </div>
  );
}
