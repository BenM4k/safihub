"use client";

import { useTranslations } from "next-intl";
import { Check, ShieldCheck, X } from "lucide-react";
import { getRoleBadgeInfo } from "@/lib/user-formatters";
import type { UserRow } from "../types";

interface UserTabPermissionsProps {
  user: UserRow;
}

interface PermissionRule {
  resource: string;
  description: string;
  allowed: boolean;
}

export function UserTabPermissions({ user }: UserTabPermissionsProps) {
  const t = useTranslations("admin.users");
  const roleInfo = getRoleBadgeInfo(user.role);

  const getPermissionsForRole = (role: string | null | undefined): PermissionRule[] => {
    switch (role) {
      case "admin":
        return [
          { resource: "Utilisateurs & Accès", description: "Créer, modifier, bloquer et réinitialiser les comptes staff", allowed: true },
          { resource: "Finances & Caisse", description: "Visualiser le grand livre et réconcilier les encaissements", allowed: true },
          { resource: "Dispatch des missions", description: "Assigner et réassigner les collectes et livraisons", allowed: true },
          { resource: "Catalogue & Tarifs", description: "Modifier les articles, tissus, services et commissions", allowed: true },
          { resource: "Partenaires Pressings", description: "Valider les candidatures et gérer les ateliers", allowed: true },
          { resource: "Paramètres plateforme", description: "Configurer les taux de change et les règles métier", allowed: true },
        ];
      case "operator":
        return [
          { resource: "Commandes & Suivi", description: "Valider et suivre l'avancement des commandes", allowed: true },
          { resource: "Dispatch des missions", description: "Assigner les missions aux coursiers disponibles", allowed: true },
          { resource: "Support clients", description: "Consulter les fiches clients et traiter les litiges", allowed: true },
          { resource: "Grand livre financier", description: "Accès limité en consultation opérationnelle", allowed: false },
          { resource: "Comptes employés", description: "Créer ou modifier des accès administrateurs", allowed: false },
        ];
      case "courier":
        return [
          { resource: "Missions de collecte", description: "Prendre en charge les missions et compter le linge", allowed: true },
          { resource: "Missions de livraison", description: "Livrer le linge propre et valider le code", allowed: true },
          { resource: "Encaissement espèces", description: "Percevoir les paiements à la livraison", allowed: true },
          { resource: "Console admin", description: "Accès aux écrans de gestion et dispatch", allowed: false },
          { resource: "Gestion catalogue", description: "Modifier les prix ou articles", allowed: false },
        ];
      case "house":
        return [
          { resource: "Réception du linge", description: "Compter et approuver le linge reçu en atelier", allowed: true },
          { resource: "Cycle de lavage", description: "Mettre à jour le statut en lavage et prêt", allowed: true },
          { resource: "Horaires & Fermetures", description: "Définir la capacité et les fermetures du pressing", allowed: true },
          { resource: "Commandes autres pressings", description: "Visualiser les données d'autres établissements", allowed: false },
          { resource: "Coordonnées clients", description: "Accéder au téléphone ou adresse des clients", allowed: false },
        ];
      default:
        return [
          { resource: "Passation de commandes", description: "Commander du pressing en ligne", allowed: true },
          { resource: "Suivi en direct", description: "Suivre le statut de sa commande", allowed: true },
          { resource: "Console d'administration", description: "Accès au panneau de gestion interne", allowed: false },
        ];
    }
  };

  const permissions = getPermissionsForRole(user.role);

  return (
    <div className="space-y-4 text-xs">
      <div className="p-4 rounded-xl border-2 border-border-strong bg-card space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-border-strong/70 pb-3">
          <div className="flex items-center gap-2 font-bold text-heading">
            <ShieldCheck className="size-4 text-primary" />
            <span>Rôle et droits d&apos;accès</span>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold ${roleInfo.badgeClass}`}
          >
            {roleInfo.label}
          </span>
        </div>

        <div className="divide-y divide-border-strong/60">
          {permissions.map((p, idx) => (
            <div key={idx} className="py-2.5 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-semibold text-heading">{p.resource}</div>
                <div className="text-2xs text-ink-500 leading-relaxed">{p.description}</div>
              </div>
              <div className="shrink-0 pt-0.5">
                {p.allowed ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Check className="size-3" />
                    <span>Autorisé</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink-400 bg-surface px-2 py-0.5 rounded-md border border-border-strong">
                    <X className="size-3" />
                    <span>Interdit</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
