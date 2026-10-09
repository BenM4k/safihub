# SafiHub Admin Operations Runbook

> **Manuel d'Exploitation & de Pilotage Quotidien — Bukavu, RDC**  
> Ce document définit les procédures opérationnelles standards pour l'administrateur et les gestionnaires de la plateforme SafiHub lors du déploiement pilote (Phase 1, 8 semaines).

---

## 1. Cadence Quotidienne d'Exploitation

| Heure (CAT) | Phase | Actions Clés | Écran Console Admin |
| :--- | :--- | :--- | :--- |
| **07:30 - 08:15** | **Ouverture & Briefing Matin** | • Vérifier l'ouverture effective des buanderies partenaires.<br>• Contrôler les commandes reçues la nuit.<br>• Vérifier le taux de change du jour (CDF / USD) et ajuster si variation > 1%.<br>• Contrôler la disponibilité des coursiers actifs. | `/admin/houses`<br>`/admin/settings`<br>`/admin/couriers` |
| **08:15 - 12:30** | **Dispatch & Collectes Matinales** | • Assigner les missions de collecte non attribuées.<br>• Surveiller les délais d'acceptation (alerte escalade Inngest à 33 min / 75%).<br>• Enregistrer les commandes entrantes par appel vocal ou WhatsApp. | `/admin/dispatch`<br>`/admin/orders`<br>`/admin/orders/new` |
| **12:30 - 16:30** | **Suivi Pressings & Réceptions** | • Suivre les comptages contradictoires des buanderies (délai de 1h).<br>• En cas d'écart de comptage, vérifier que le client reçoit la demande d'ajustement.<br>• Planifier les créneaux de livraison du soir avec les clients. | `/admin/orders`<br>`/admin/dispatch` |
| **16:30 - 18:30** | **Livraisons & Réconciliation Caisse** | • Réceptionner physiquement les coursiers au bureau SafiHub.<br>• Décompte physique des espèces en Francs Congolais (CDF) et Dollars (USD).<br>• Clôturer la réconciliation journalière dans l'application.<br>• Réajuster ou restituer les fonds de caisse (float). | `/admin/cash`<br>`/admin/couriers` |

---

## 2. Procédure de Commande Manuelle (WhatsApp / Téléphone)

Lorsqu'un client passe commande par WhatsApp (+243 ...) ou appel direct :

1. Accéder à `/admin/orders/new`.
2. Saisir le numéro de téléphone du client et son prénom.
3. Sélectionner son quartier et préciser le repère visuel (ex. *« Avenue Kibombo, en face de la pharmacie du Lac, portail vert »*).
4. Sélectionner les articles déclarés et la buanderie partenaire la plus proche desservant la zone.
5. Définir le créneau de passage souhaité (créneau de 2 heures).
6. Valider la commande : un SMS / message WhatsApp avec le lien public de suivi (`/track/[token]`) est transmis au client.

---

## 3. Gestion des Coursiers & Plafond d'Espèces (Cash Ceiling)

### 3.1. Dépôt de Garantie & Fond de Caisse
- À l'intégration, le coursier signe la convention et dépose une garantie de sûreté (ex. **50 USD** ou équivalent CDF).
- Ce montant est enregistré dans le grand livre via `holdCourierDeposit` (`deposit_held`).
- L'administrateur alloue un fond de caisse initial pour la monnaie (ex. **20 000 CDF**) via `issueCourierFloat` (`float_issued`).

### 3.2. Plafond d'Espèces & Verrouillage Automatique (AC 13 & AC 18)
- **Plafond individuel par défaut :** **140 000 CDF** (ou **50 USD**).
- Dès que le cumul d'espèces encaissées par un coursier atteint ou dépasse ce plafond, **l'attribution de nouvelles missions de livraison lui est automatiquement bloquée**.
- Pour débloquer le coursier :
  1. Le coursier remet les espèces collectées à l'administrateur.
  2. L'administrateur enregistre la remise d'espèces (`cash_remitted`).
  3. Le solde d'espèces détenu repasse sous le plafond, le statut redevient éligible au dispatch.

---

## 4. Réconciliation Quotidienne de Caisse (17:00)

1. Ouvrir `/admin/cash`.
2. Pour chaque coursier actif de la journée :
   - Sélectionner la date commerciale (`businessDate`).
   - Le système affiche la somme théorique attendue : `Total Encaissé - Fond de Caisse initial`.
   - Compter manuellement les billets de Francs Congolais et de Dollars.
   - Saisir les montants physiques comptés (`actualCashCDF` et `actualCashUSD`).
3. **Traitement des Écarts :**
   - **Écart nul (0 CDF) :** Cliquer sur *Confirmer la Réconciliation*.
   - **Écart positif (excédent) :** Enregistré en produit exceptionnel au grand livre.
   - **Écart négatif (manquant) :** Notifier le coursier. L'écart est imputé soit sur sa rémunération du jour (`courier_pay`), soit sur son solde de garantie.
4. **Versement bancaire / Mobile Money :** Déposer les espèces du jour au coffre sécurisé ou au point M-Pesa / Airtel Money de la plateforme.

---

## 5. Règlements des Buanderies Partenaires (Settlements)

- **Périodicité :** Bimensuelle (le 1er et le 15 de chaque mois).
- **Calcul :**  
  $$\text{Montant Dû Buanderie} = \sum (\text{Total Articles Nettoyés}) - \sum (\text{Commission SafiHub})$$
- **Validation :**
  1. Aller sur `/admin/settlements`.
  2. Vérifier les commandes clôturées avec statut `delivered`.
  3. Effectuer le virement Mobile Money ou paiement en espèces contre reçu d'acquit signé.
  4. Cliquer sur *Enregistrer le Règlement* (`settleHouseBalance`).

---

## 6. Gestion des Litiges & Anomalies (Dispute Protocols)

### 6.1. Désaccord de Comptage au Seuil ou à la Réception
- En cas de contestation par le pressing (ex. vêtement taché indélébile ou troué non signalé) :
  - Consulter les photos d'état prises par le coursier au seuil du client (`/admin/orders/[id]`).
  - Si le défaut était préexistant : le client est informé avec photo à l'appui pour validation du tarif majoré ou exclusion.
  - Si le vêtement a été dégradé en cours de transit : SafiHub prend en charge le dédommagement selon la politique du pilote.

### 6.2. Panne de Véhicule ou Rupture 3G du Coursier
- L'application coursier fonctionne en mode hors-ligne complet (IndexedDB + Service Worker).
- Si le téléphone s'éteint ou si la moto est immobilisée :
  - Le coursier appelle la permanence SafiHub au numéro d'urgence.
  - L'administrateur réassigne la mission au second coursier de réserve depuis `/admin/dispatch`.

---

## 7. Sauvegardes & Exportation des Données d'Audit

- **Exports réguliers :**
  - Chaque fin de semaine, se rendre sur `/admin/settings` > *Exportation des Données*.
  - Télécharger les 3 fichiers de sauvegarde au format CSV :
    1. `safihub-orders-[date].csv` (Traçabilité complète des commandes)
    2. `safihub-cash-ledger-[date].csv` (Grand livre financier inaltérable)
    3. `safihub-customers-[date].csv` (Base clients et contacts)
  - Archiver sur un support de stockage externe sécurisé chiffré.
