import type { ChecklistItemConfig } from "./types";

export function getChecklistItemsConfig(
  houseSlug: string,
  t?: (key: string) => string
): ChecklistItemConfig[] {
  return [
    {
      key: "photos",
      stepNumber: 1,
      title: t ? t("photos.title") : "Photo de couverture et logo",
      benefit: t
        ? t("photos.benefit")
        : "Donne une première impression professionnelle sur la carte client.",
      href: `/partner/${houseSlug}/settings`,
      buttonLabel: t ? t("photos.buttonLabel") : "Profil",
    },
    {
      key: "hours",
      stepNumber: 2,
      title: t ? t("hours.title") : "Horaires d'ouverture",
      benefit: t
        ? t("hours.benefit")
        : "Définit les créneaux où les coursiers peuvent déposer le linge.",
      href: `/partner/${houseSlug}/hours`,
      buttonLabel: t ? t("hours.buttonLabel") : "Horaires",
    },
    {
      key: "pricing",
      stepNumber: 3,
      title: t ? t("pricing.title") : "Au moins 1 article avec un prix",
      benefit: t
        ? t("pricing.benefit")
        : "Sans prix, aucune commande client n'est possible.",
      href: `/partner/${houseSlug}/catalogue`,
      buttonLabel: t ? t("pricing.buttonLabel") : "Catalogue",
    },
    {
      key: "coverage",
      stepNumber: 4,
      title: t ? t("coverage.title") : "Au moins 1 quartier desservi",
      benefit: t
        ? t("coverage.benefit")
        : "Permet aux clients de ces quartiers de commander chez vous.",
      href: `/partner/${houseSlug}/coverage`,
      buttonLabel: t ? t("coverage.buttonLabel") : "Zones",
    },
    {
      key: "payment",
      stepNumber: 5,
      title: t ? t("payment.title") : "Moyen de réception des paiements",
      benefit: t
        ? t("payment.benefit")
        : "Indique le numéro Mobile Money pour recevoir vos versements.",
      href: `/partner/${houseSlug}/settings`,
      buttonLabel: t ? t("payment.buttonLabel") : "Paiement",
    },
    {
      key: "contact",
      stepNumber: 6,
      title: t ? t("contact.title") : "Téléphone de contact",
      benefit: t
        ? t("contact.benefit")
        : "Ligne directe utilisée par l'équipe d'assistance et les coursiers.",
      href: `/partner/${houseSlug}/settings`,
      buttonLabel: t ? t("contact.buttonLabel") : "Contact",
    },
  ];
}
