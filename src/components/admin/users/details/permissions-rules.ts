export interface PermissionRule {
  resource: string;
  description: string;
  allowed: boolean;
}

export function getPermissionsForRole(role: string | null | undefined): PermissionRule[] {
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
}
