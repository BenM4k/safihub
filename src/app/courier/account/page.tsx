import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { User, Phone, Mail, Shield, LogOut, ArrowRight, Wallet } from "lucide-react";
import { guardCourierRoute } from "@/services/auth";
import { logoutAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Mon compte coursier | SafiHub",
  description: "Profil et paramètres du compte coursier SafiHub Bukavu",
};

export default async function CourierAccountPage() {
  const auth = await guardCourierRoute();
  const tNav = await getTranslations("nav");

  const user = auth.user;

  return (
    <div className="space-y-5 pb-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            <User className="size-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-tight">
              {user.name || "Coursier SafiHub"}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Livreur actif · Bukavu
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Mail className="size-3.5 text-slate-400" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.contactPhone && (
            <div className="flex items-center gap-2">
              <Phone className="size-3.5 text-slate-400" />
              <span>{user.contactPhone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Shield className="size-3.5 text-slate-400" />
            <span>Rôle : Livreur vérifié</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Raccourcis rapides
        </h2>
        <Link
          href="/courier/cash"
          className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-xs font-semibold text-slate-800"
        >
          <div className="flex items-center gap-2.5">
            <Wallet className="size-4 text-blue-600" />
            <span>Suivi de la caisse & plafonds cash</span>
          </div>
          <ArrowRight className="size-3.5 text-slate-400" />
        </Link>
        <Link
          href="/account"
          className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-xs font-semibold text-slate-800"
        >
          <div className="flex items-center gap-2.5">
            <User className="size-4 text-slate-600" />
            <span>Modifier mes coordonnées & mot de passe</span>
          </div>
          <ArrowRight className="size-3.5 text-slate-400" />
        </Link>
      </div>

      <div className="pt-2">
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="outline"
            className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 font-semibold gap-2"
          >
            <LogOut className="size-4" />
            <span>{tNav("logout")}</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
