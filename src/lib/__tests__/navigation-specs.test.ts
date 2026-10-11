import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Navigation By Role & Specifications Alignment", () => {
  const messagesFr = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "messages/fr.json"), "utf-8")
  );

  it("1. Visitor navigation specification includes required menu items", () => {
    // Visiteur : Accueil, Maisons, Connexion, Inscription, « Devenir partenaire »
    expect(messagesFr.nav.home).toBe("Accueil");
    expect(messagesFr.nav.houses).toBeDefined();
    expect(messagesFr.nav.login).toBeDefined();
    expect(messagesFr.nav.register).toBe("Inscription");
    expect(messagesFr.nav.becomePartner).toBe("Devenir partenaire");
  });

  it("2. Customer navigation specification includes bottom tab items and bell", () => {
    // Client (onglets en bas) : Maisons, Panier, Commandes, Compte, plus la cloche
    expect(messagesFr.nav.houses).toBeDefined();
    expect(messagesFr.nav.cart).toBe("Panier");
    expect(messagesFr.nav.orders).toBeDefined();
    expect(messagesFr.nav.account).toBeDefined();
    expect(messagesFr.nav.notifications).toBe("Notifications");
  });

  it("3. House workspace specification includes all 7 tabs and house switcher", () => {
    // Maison : Tableau de bord, Commandes, Catalogue, Horaires, Couverture, Règlements, Paramètres, plus sélecteur
    expect(messagesFr.house.nav.dashboard).toBe("Tableau de bord");
    expect(messagesFr.house.nav.orders).toBe("Commandes");
    expect(messagesFr.house.nav.catalogue).toBeDefined();
    expect(messagesFr.house.nav.hours).toBeDefined();
    expect(messagesFr.house.nav.coverage).toBe("Couverture");
    expect(messagesFr.house.nav.settlements).toBe("Règlements");
    expect(messagesFr.house.nav.settings).toBe("Paramètres");
    expect(messagesFr.house.header.selectHouse).toBeDefined();
  });

  it("4. Courier navigation specification includes 4 bottom tabs (Missions, Cash, Historique, Compte)", () => {
    // Livreur (onglets en bas) : Missions, Cash, Historique, Compte
    expect(messagesFr.courier.nav.missions).toBe("Missions");
    expect(messagesFr.courier.nav.cash).toBe("Cash");
    expect(messagesFr.courier.nav.history).toBe("Historique");
    expect(messagesFr.courier.nav.account).toBe("Compte");
  });

  it("5. Admin sidebar specification matches all 4 grouped categories and routes", () => {
    // Admin (barre latérale)
    // Opérations : tableau de bord, dispatch, commandes, litiges
    // Argent : cash, règlements
    // Personnes : maisons, candidatures, livreurs, clients, utilisateurs
    // Configuration : quartiers, frais, couverture, catalogue, réglages
    expect(messagesFr.admin.nav.groupOperations).toBe("Opérations");
    expect(messagesFr.admin.nav.dashboard).toBe("Tableau de bord");
    expect(messagesFr.admin.nav.dispatch).toBe("Dispatch");
    expect(messagesFr.admin.nav.orders).toBe("Commandes");
    expect(messagesFr.admin.nav.disputes).toBe("Litiges");

    expect(messagesFr.admin.nav.groupMoney).toBe("Argent");
    expect(messagesFr.admin.nav.cash).toBe("Cash");
    expect(messagesFr.admin.nav.settlements).toBe("Règlements");

    expect(messagesFr.admin.nav.groupPeople).toBe("Personnes");
    expect(messagesFr.admin.nav.houses).toBe("Maisons");
    expect(messagesFr.admin.nav.applications).toBe("Candidatures");
    expect(messagesFr.admin.nav.couriers).toBe("Livreurs");
    expect(messagesFr.admin.nav.customers).toBe("Clients");
    expect(messagesFr.admin.nav.users).toBe("Utilisateurs");

    expect(messagesFr.admin.nav.groupConfig).toBe("Configuration");
    expect(messagesFr.admin.nav.neighborhoods).toBe("Quartiers");
    expect(messagesFr.admin.nav.deliveryFees).toBe("Frais");
    expect(messagesFr.admin.nav.coverage).toBe("Couverture");
    expect(messagesFr.admin.nav.catalogue).toBe("Catalogue");
    expect(messagesFr.admin.nav.settings).toBe("Réglages");
  });
});
