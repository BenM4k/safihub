import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getCustomerOrdersList } from "@/services/order";
import { OrdersListView } from "@/components/orders/orders-list-view";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export const metadata = {
  title: "Mes commandes — SafiHub",
  description: "Suivez l'historique et l'avancement de vos commandes de pressing.",
};

export default async function CustomerOrdersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/orders");
  }

  const orders = await getCustomerOrdersList(user.id);

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-2"
            >
              <ArrowLeft className="size-3.5" />
              <span>Accueil</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Mes commandes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Suivi en temps réel de votre linge confié aux ateliers de Bukavu.
            </p>
          </div>

          <Link
            href="/houses"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary-hover transition shadow-sm w-fit"
          >
            <Plus className="size-4" />
            <span>Nouvelle commande</span>
          </Link>
        </div>

        <OrdersListView orders={orders} />
      </div>
    </div>
  );
}
