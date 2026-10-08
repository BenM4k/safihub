import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/home/header/navbar";
import { Footer } from "@/components/home/footer/footer";
import { getCurrentUser } from "@/services/auth";
import { getCustomerAccountData } from "@/services/customer/account.service";
import { getNeighborhoods } from "@/dal";
import { ProfileForm } from "@/components/account/profile-form";
import { AddressesList } from "@/components/account/addresses-list";
import { ConsentsHistory } from "@/components/account/consents-history";

export const metadata: Metadata = {
  title: "Mon compte | SafiHub Bukavu",
  description: "Gérez votre profil, vos adresses et vos préférences SafiHub.",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/account");
  }

  const [accountRes, neighborhoods] = await Promise.all([
    getCustomerAccountData(user.id),
    getNeighborhoods(),
  ]);

  if (!accountRes.ok) {
    redirect("/login");
  }

  const { user: profile, addresses, consents } = accountRes.value;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar variant="solid" user={user} />
      <main className="flex-1 py-10 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Mon compte
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gérez vos informations personnelles, adresses enregistrées et consentements légaux.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileForm user={profile} />
          <AddressesList
            addresses={addresses}
            neighborhoods={neighborhoods}
            defaultPhone={profile.contactPhone || ""}
          />
        </div>

        <ConsentsHistory consents={consents} />
      </main>
      <Footer />
    </div>
  );
}
