import type { ChecklistItemConfig } from "./types";

export function getChecklistItemsConfig(houseSlug: string): ChecklistItemConfig[] {
  return [
    {
      key: "photos",
      stepNumber: 1,
      title: "Photo de couverture et logo",
      benefit: "Donne une première impression professionnelle sur la carte client.",
      href: `/partner/${houseSlug}/settings`,
      buttonLabel: "Profil",
    },
    {
      key: "hours",
      stepNumber: 2,
      title: "Horaires d'ouverture",
      benefit: "Définit les créneaux où les coursiers peuvent déposer le linge.",
      href: `/partner/${houseSlug}/hours`,
      buttonLabel: "Horaires",
    },
    {
      key: "pricing",
      stepNumber: 3,
      title: "Au moins 1 article avec un prix",
      benefit: "Sans prix, aucune commande client n'est possible.",
      href: `/partner/${houseSlug}/catalogue`,
      buttonLabel: "Catalogue",
    },
    {
      key: "coverage",
      stepNumber: 4,
      title: "Au moins 1 quartier desservi",
      benefit: "Permet aux clients de ces quartiers de commander chez vous.",
      href: `/partner/${houseSlug}/coverage`,
      buttonLabel: "Zones",
    },
    {
      key: "payment",
      stepNumber: 5,
      title: "Moyen de réception des paiements",
      benefit: "Indique le numéro Mobile Money pour recevoir vos versements.",
      href: `/partner/${houseSlug}/settings`,
      buttonLabel: "Paiement",
    },
    {
      key: "contact",
      stepNumber: 6,
      title: "Téléphone de contact",
      benefit: "Ligne directe utilisée par l'équipe d'assistance et les coursiers.",
      href: `/partner/${houseSlug}/settings`,
      buttonLabel: "Contact",
    },
  ];
}
