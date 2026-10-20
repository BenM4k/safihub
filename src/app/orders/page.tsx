import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getCustomerOrdersList } from "@/services/order";
import { OrdersListView } from "@/components/orders/orders-list-view";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Navbar } from "@/components/home/header/navbar";
import { Footer } from "@/components/home/footer/footer";

export const metadata = {
  title: "Mes commandes — SafiHub",
  description: "Suivez l'historique et l'avancement de vos commandes de pressing.",
};

interface CustomerOrdersPageProps {
  searchParams?: Promise<{
    tab?: "active" | "past";
  }>;
}

export default async function CustomerOrdersPage({
  searchParams,
}: CustomerOrdersPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/orders");
  }

  const [orders, sp] = await Promise.all([
    getCustomerOrdersList(user.id),
    searchParams ?? Promise.resolve({ tab: undefined }),
  ]);

  const initialTab = sp?.tab === "past" ? "past" : "active";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar variant="solid" user={user} />
      <main className="flex-1 flex flex-col py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition mb-2"
              >
                <ArrowLeft className="size-3.5" />
                <span>Accueil</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black text-heading tracking-tight">
                Mes commandes
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
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

          <OrdersListView orders={orders} initialTab={initialTab} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
