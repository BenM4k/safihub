import type { TourStepConfig } from "./types";

export type { TourStepConfig };

export function getDesktopTourSteps(houseName: string): TourStepConfig[] {
  return [
    {
      id: "welcome",
      targetTourId: null,
      route: "",
      title: `Bienvenue, ${houseName}`,
      body: "5 étapes pour recevoir vos premières commandes. Votre pressing sera visible par les clients après validation par SafiHub.",
      device: "desktop",
    },
    {
      id: "accueil",
      targetTourId: "tour-acceptance-queue",
      route: "",
      title: "Commandes à accepter",
      body: "Consultez ici les nouvelles commandes. Vous avez 45 minutes pendant vos heures d'ouverture pour accepter.",
      device: "desktop",
    },
    {
      id: "commandes",
      targetTourId: "tour-orders-stages",
      route: "/orders",
      title: "Suivi des commandes",
      body: "Gérez l'avancement : collecte par le coursier, lavage en atelier et livraison propre.",
      device: "desktop",
    },
    {
      id: "catalogue",
      targetTourId: "tour-catalogue-content",
      route: "/catalogue",
      title: "Catalogue et tarifs",
      body: "Sans prix, aucune commande. Commencez par vos articles les plus courants.",
      device: "desktop",
      actionCta: "Définir mes prix",
    },
    {
      id: "reglements",
      targetTourId: "tour-nav-settlements",
      route: "",
      title: "Règlements et revenus",
      body: "Suivez vos gains nets et la date de votre prochain versement Mobile Money.",
      device: "desktop",
    },
    {
      id: "mon_pressing",
      targetTourId: "tour-nav-management-group",
      route: "",
      title: "Mon pressing et paramètres",
      body: "Horaires, quartiers desservis, pause temporaire et moyen de paiement.",
      device: "desktop",
    },
  ];
}

export function getMobileTourSteps(): TourStepConfig[] {
  return [
    {
      id: "mobile_accueil",
      targetTourId: "tour-mobile-tab-dashboard",
      route: "",
      title: "Accueil et commandes",
      body: "Votre tableau de bord réunit les alertes prioritaires et les commandes à valider.",
      device: "mobile",
    },
    {
      id: "mobile_commandes",
      targetTourId: "tour-mobile-tab-orders",
      route: "",
      title: "Suivi des missions",
      body: "Suivez le statut de traitement et les dépôts de linge par vos coursiers.",
      device: "mobile",
    },
    {
      id: "mobile_catalogue",
      targetTourId: "tour-mobile-tab-catalogue",
      route: "/catalogue",
      title: "Catalogue et tarifs",
      body: "Fixez les prix de vos services pour rendre vos articles commandables par les clients.",
      device: "mobile",
      actionCta: "Définir mes prix",
    },
    {
      id: "mobile_plus",
      targetTourId: "tour-mobile-tab-more",
      route: "",
      title: "Horaires et paramètres",
      body: "Configurez vos horaires d'ouverture, vos quartiers desservis et vos options de paiement.",
      device: "mobile",
    },
  ];
}
