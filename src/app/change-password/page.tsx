import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getUserHouseMemberships } from "@/dal";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { AuthLogo } from "@/components/auth/auth-logo";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Changer votre mot de passe — SafiHub",
  description: "Première connexion : définissez votre mot de passe personnel pour sécuriser votre compte.",
};

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // If user does not need to change password, redirect to their home
  if (!user.mustChangePassword) {
    if (user.role === "house") {
      const memberships = await getUserHouseMemberships(user.id);
      if (memberships.length > 0) {
        redirect(`/partner/${memberships[0].houseSlug}`);
      }
      redirect("/partner");
    }
    if (user.role === "admin") {
      redirect("/admin");
    }
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans">
      {/* Brand Header */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between">
        <AuthLogo />
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <ShieldCheck className="size-3.5" />
          <span>Sécurité requise</span>
        </span>
      </header>

      {/* Main card */}
      <main className="w-full max-w-md mx-auto my-auto bg-card border border-border shadow-xs rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1.5 text-left">
          <h1 className="text-xl sm:text-2xl font-black text-heading tracking-tight">
            Nouveau mot de passe
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bienvenue sur SafiHub. Votre compte a été initialisé avec un mot de passe temporaire.
            Veuillez définir votre propre mot de passe pour continuer.
          </p>
        </div>

        <ChangePasswordForm />
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center text-xs text-muted-foreground pt-4">
        <p>© SafiHub 2026 · Bukavu, RDC</p>
      </footer>
    </div>
  );
}
