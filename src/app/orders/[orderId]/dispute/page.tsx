import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/services/auth";
import { getCustomerOrderDetail } from "@/services/order";
import { DisputeForm } from "@/components/disputes/dispute-form";

interface OrderDisputePageProps {
  params: Promise<{ orderId: string }>;
}

export const metadata = {
  title: "Déclarer un litige — SafiHub",
  description: "Formulaire de déclaration de litige pour une commande de pressing.",
};

export default async function OrderDisputePage({ params }: OrderDisputePageProps) {
  const user = await getCurrentUser();
  const { orderId } = await params;

  if (!user) {
    redirect(`/login?callbackUrl=/orders/${orderId}/dispute`);
  }

  const res = await getCustomerOrderDetail(orderId, user.id);
  if (!res.ok) {
    notFound();
  }

  const { order } = res.value;

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        <Link
          href={`/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="size-3.5" />
          <span>Retour aux détails de la commande</span>
        </Link>

        <DisputeForm orderId={order.id} orderCode={order.code} />
      </div>
    </div>
  );
}
