import "server-only";

import type { WhatsAppLocale } from "./types";

export interface BotCopyBundle {
  welcomeHeader: string;
  welcomeBody: string;
  btnStartOrder: string;
  btnLanguageSw: string;
  btnLanguageFr: string;
  selectNeighborhoodHeader: string;
  selectNeighborhoodBody: string;
  selectNeighborhoodBtn: string;
  noNeighborhoodsAvailable: string;
  selectHouseHeader: string;
  selectHouseBody: (neighborhoodName: string) => string;
  selectHouseBtn: string;
  noHousesForNeighborhood: (neighborhoodName: string) => string;
  selectServiceHeader: (houseName: string) => string;
  selectServiceBody: (houseName: string, minOrderCdf: string) => string;
  selectServiceBtn: string;
  selectItemHeader: (serviceName: string) => string;
  selectItemBody: string;
  selectItemBtn: string;
  selectQuantityBody: (itemName: string, priceCdf: string) => string;
  cartUpdatedBody: (cartSummary: string, subtotalCdf: string) => string;
  btnAddMoreItems: string;
  btnChangeService: string;
  btnProceedCheckout: string;
  minOrderNotMet: (minOrderCdf: string, missingCdf: string) => string;
  selectSlotHeader: string;
  selectSlotBody: string;
  selectSlotBtn: string;
  noSlotsAvailable: string;
  captureLandmarkHeader: string;
  captureLandmarkBody: (neighborhoodName: string) => string;
  orderSummaryHeader: string;
  orderSummaryBody: (params: {
    houseName: string;
    neighborhoodName: string;
    landmark: string;
    slotLabel: string;
    itemsList: string;
    itemsTotalCdf: string;
    deliveryFeeCdf: string;
    totalDueCdf: string;
  }) => string;
  btnConfirmOrder: string;
  btnCancelOrder: string;
  orderCreatedSuccess: (params: {
    orderCode: string;
    houseName: string;
    totalDueCdf: string;
    slotLabel: string;
    trackingUrl: string;
  }) => string;
  orderCancelledMsg: string;
  adjustmentApprovedMsg: (orderCode: string) => string;
  adjustmentRejectedMsg: (orderCode: string) => string;
  gpsLandmarkSavedForActiveOrder: (orderCode: string, landmark: string) => string;
  priceAdjustmentPromptBody: (params: {
    orderCode: string;
    houseName: string;
    diffAmountCdf: string;
    reason?: string;
  }) => string;
  btnApproveAdjustment: string;
  btnRejectAdjustment: string;
}

export function formatCdfAmount(amount: number): string {
  return `${Math.round(amount).toLocaleString("fr-CD")} CDF`;
}

export const WHATSAPP_BOT_COPY: Record<WhatsAppLocale, BotCopyBundle> = {
  fr: {
    welcomeHeader: "🧺 Bienvenue sur SafiHub Bukavu",
    welcomeBody:
      "Votre service de pressing et blanchisserie à la demande à Bukavu.\nCollecte et livraison à domicile, paiement cash à la livraison.",
    btnStartOrder: "Commander",
    btnLanguageSw: "Kiswahili",
    btnLanguageFr: "Français",
    selectNeighborhoodHeader: "📍 Votre Quartier",
    selectNeighborhoodBody:
      "Veuillez choisir votre quartier à Bukavu pour voir les pressings disponibles :",
    selectNeighborhoodBtn: "Choisir quartier",
    noNeighborhoodsAvailable:
      "Aucun quartier desservi n'est disponible pour le moment. Réessayez plus tard.",
    selectHouseHeader: "🏪 Choisir un Pressing",
    selectHouseBody: (neighborhoodName) =>
      `Pressings partenaires desservant *${neighborhoodName}* :`,
    selectHouseBtn: "Voir les pressings",
    noHousesForNeighborhood: (neighborhoodName) =>
      `Désolé, aucun pressing actif ne couvre *${neighborhoodName}* actuellement. Tapez *Menu* pour choisir un autre quartier.`,
    selectServiceHeader: (houseName) => `🧼 ${houseName}`,
    selectServiceBody: (houseName, minOrderCdf) =>
      `Choisissez le type de service chez *${houseName}* (Minimum de commande : ${minOrderCdf}) :`,
    selectServiceBtn: "Choisir service",
    selectItemHeader: (serviceName) => `👕 ${serviceName}`,
    selectItemBody:
      "Sélectionnez un article dans le catalogue pour l'ajouter à votre panier :",
    selectItemBtn: "Choisir article",
    selectQuantityBody: (itemName, priceCdf) =>
      `Combien de *${itemName}* (${priceCdf}/unité) souhaitez-vous ajouter ?`,
    cartUpdatedBody: (cartSummary, subtotalCdf) =>
      `🛒 *Votre Panier :*\n${cartSummary}\n\n*Sous-total articles :* ${subtotalCdf}`,
    btnAddMoreItems: "+ Ajouter article",
    btnChangeService: "Autre service",
    btnProceedCheckout: "Choisir créneau",
    minOrderNotMet: (minOrderCdf, missingCdf) =>
      `⚠️ Le minimum de commande est de *${minOrderCdf}* (il manque *${missingCdf}*). Veuillez ajouter d'autres articles.`,
    selectSlotHeader: "🕒 Créneau de Collecte",
    selectSlotBody:
      "Choisissez le créneau horaire souhaité pour le passage du coursier :",
    selectSlotBtn: "Choisir horaire",
    noSlotsAvailable:
      "Désolé, aucun créneau de coursier n'est disponible pour ce pressing actuellement. Tapez *Menu* pour recommencer.",
    captureLandmarkHeader: "🗺️ Repère / Adresse",
    captureLandmarkBody: (neighborhoodName) =>
      `Quartier : *${neighborhoodName}*\n\nEnvoyez maintenant :\n1️⃣ Une description claire de votre repère (ex: *Avenue Maniema, près de la pharmacie X, portail bleu*)\nOU\n2️⃣ Partagez directement votre *Position GPS WhatsApp* 📍.`,
    orderSummaryHeader: "✅ Récapitulatif SafiHub",
    orderSummaryBody: (p) =>
      `*Pressing :* ${p.houseName}\n*Quartier :* ${p.neighborhoodName}\n*Repère :* ${p.landmark}\n*Collecte :* ${p.slotLabel}\n\n*Articles :*\n${p.itemsList}\n\n*Sous-total :* ${p.itemsTotalCdf}\n*Livraison :* ${p.deliveryFeeCdf}\n*TOTAL À PAYER (Cash à la livraison) :* *${p.totalDueCdf}*`,
    btnConfirmOrder: "Confirmer commande",
    btnCancelOrder: "Annuler",
    orderCreatedSuccess: (p) =>
      `🎉 *Commande confirmée !*\n\n*Code :* #${p.orderCode}\n*Pressing :* ${p.houseName}\n*Collecte prévue :* ${p.slotLabel}\n*Total à payer à la livraison :* ${p.totalDueCdf}\n\nSuivez votre commande en direct :\n${p.trackingUrl}`,
    orderCancelledMsg:
      "Votre commande en cours de saisie a été annulée. Tapez *Bonjour* à tout moment pour recommencer.",
    adjustmentApprovedMsg: (orderCode) =>
      `✅ Vous avez approuvé l'ajustement tarifaire pour la commande *#${orderCode}*. Le lavage démarre immédiatement !`,
    adjustmentRejectedMsg: (orderCode) =>
      `❌ Vous avez refusé l'ajustement tarifaire pour la commande *#${orderCode}*. Notre équipe va organiser le retour de votre linge.`,
    gpsLandmarkSavedForActiveOrder: (orderCode, landmark) =>
      `📍 Position GPS enregistrée pour votre commande *#${orderCode}* !\nNouveau repère : ${landmark}`,
    priceAdjustmentPromptBody: (p) =>
      `⚠️ *Ajustement de prix — Commande #${p.orderCode}*\n\nAprès réception et comptage chez *${p.houseName}*, un écart de *${p.diffAmountCdf}* a été constaté${p.reason ? ` (${p.reason})` : ""}.\n\nAcceptez-vous cet ajustement pour lancer le lavage ?`,
    btnApproveAdjustment: "Accepter",
    btnRejectAdjustment: "Refuser",
  },
  sw: {
    welcomeHeader: "🧺 Karibu SafiHub Bukavu",
    welcomeBody:
      "Huduma yako ya dobi na ufuaji nguo mjini Bukavu.\nTunachukua na kuleta nguo nyumbani kwako, malipo ni pesa taslimu mzigo ukifika.",
    btnStartOrder: "Agiza sasa",
    btnLanguageSw: "Kiswahili",
    btnLanguageFr: "Français",
    selectNeighborhoodHeader: "📍 Mtaa Wako",
    selectNeighborhoodBody:
      "Tafadhali chagua mtaa wako mjini Bukavu ili kuona dobi wanaopatikana:",
    selectNeighborhoodBtn: "Chagua mtaa",
    noNeighborhoodsAvailable:
      "Hakuna mitaa inayohudumiwa kwa sasa. Tafadhali jaribu tena baadaye.",
    selectHouseHeader: "🏪 Chagua Dobi",
    selectHouseBody: (neighborhoodName) =>
      `Madobi washirika wanaohudumia *${neighborhoodName}*:`,
    selectHouseBtn: "Ona madobi",
    noHousesForNeighborhood: (neighborhoodName) =>
      `Samahani, hakuna dobi anayehudumia *${neighborhoodName}* kwa sasa. Andika *Menu* kuchagua mtaa mwingine.`,
    selectServiceHeader: (houseName) => `🧼 ${houseName}`,
    selectServiceBody: (houseName, minOrderCdf) =>
      `Chagua aina ya huduma kwa *${houseName}* (Kiwango cha chini: ${minOrderCdf}):`,
    selectServiceBtn: "Chagua huduma",
    selectItemHeader: (serviceName) => `👕 ${serviceName}`,
    selectItemBody: "Chagua nguo kwenye orodha ili kuongeza kwenye kikapu chako:",
    selectItemBtn: "Chagua nguo",
    selectQuantityBody: (itemName, priceCdf) =>
      `Ungependa kuongeza *${itemName}* ngapi (${priceCdf} kwa moja)?`,
    cartUpdatedBody: (cartSummary, subtotalCdf) =>
      `🛒 *Kikapu Chako:*\n${cartSummary}\n\n*Jumla ya nguo:* ${subtotalCdf}`,
    btnAddMoreItems: "+ Ongeza nguo",
    btnChangeService: "Huduma nyingine",
    btnProceedCheckout: "Chagua muda",
    minOrderNotMet: (minOrderCdf, missingCdf) =>
      `⚠️ Kiwango cha chini cha agizo ni *${minOrderCdf}* (bado *${missingCdf}*). Tafadhali ongeza nguo zingine.`,
    selectSlotHeader: "🕒 Muda wa Kuchukua Nguo",
    selectSlotBody: "Chagua muda unaofaa kwa msafirishaji kufika kwako:",
    selectSlotBtn: "Chagua muda",
    noSlotsAvailable:
      "Samahani, hakuna muda wa msafirishaji unaopatikana kwa sasa. Andika *Menu* kuanza upya.",
    captureLandmarkHeader: "🗺️ Alama ya Mahali / Anwani",
    captureLandmarkBody: (neighborhoodName) =>
      `Mtaa: *${neighborhoodName}*\n\nTuma sasa:\n1️⃣ Maelezo ya alama ya nyumba yako (mfano: *Karibu na duka la dawa X, geti la bluu*)\nAU\n2️⃣ Tuma *Location ya GPS ya WhatsApp* 📍.`,
    orderSummaryHeader: "✅ Muhtasari wa Agizo SafiHub",
    orderSummaryBody: (p) =>
      `*Dobi:* ${p.houseName}\n*Mtaa:* ${p.neighborhoodName}\n*Alama:* ${p.landmark}\n*Muda wa kuchukua:* ${p.slotLabel}\n\n*Nguo:*\n${p.itemsList}\n\n*Nguo jumla:* ${p.itemsTotalCdf}\n*Usafiri:* ${p.deliveryFeeCdf}\n*JUMLA YA KULIPA (Pesa taslimu):* *${p.totalDueCdf}*`,
    btnConfirmOrder: "Thibitisha agizo",
    btnCancelOrder: "Ghairi",
    orderCreatedSuccess: (p) =>
      `🎉 *Agizo limethibitishwa!*\n\n*Nambari:* #${p.orderCode}\n*Dobi:* ${p.houseName}\n*Muda wa kuchukua:* ${p.slotLabel}\n*Jumla ya kulipa:* ${p.totalDueCdf}\n\nFuatilia agizo lako hapa:\n${p.trackingUrl}`,
    orderCancelledMsg:
      "Agizo lako limeghairiwa. Andika *Jambo* wakati wowote kuanza tena.",
    adjustmentApprovedMsg: (orderCode) =>
      `✅ Umekubali marekebisho ya bei kwa agizo *#${orderCode}*. Ufuaji unaanza mara moja!`,
    adjustmentRejectedMsg: (orderCode) =>
      `❌ Umekataa marekebisho ya bei kwa agizo *#${orderCode}*. Nguo zako zitarudishwa.`,
    gpsLandmarkSavedForActiveOrder: (orderCode, landmark) =>
      `📍 GPS imehifadhiwa kwa agizo lako *#${orderCode}*!\nAlama mpya: ${landmark}`,
    priceAdjustmentPromptBody: (p) =>
      `⚠️ *Marekebisho ya Bei — Agizo #${p.orderCode}*\n\nBaada ya kuhesabu nguo kwa *${p.houseName}*, kuna tofauti ya *${p.diffAmountCdf}*${p.reason ? ` (${p.reason})` : ""}.\n\nJe, unakubali marekebisho haya ili ufuaji uanze?`,
    btnApproveAdjustment: "Kubali",
    btnRejectAdjustment: "Kataa",
  },
  en: {
    welcomeHeader: "🧺 Welcome to SafiHub Bukavu",
    welcomeBody:
      "Your on-demand laundry & dry-cleaning marketplace in Bukavu.\nDoorstep pickup and delivery, cash on delivery.",
    btnStartOrder: "Place Order",
    btnLanguageSw: "Kiswahili",
    btnLanguageFr: "Français",
    selectNeighborhoodHeader: "📍 Your Neighborhood",
    selectNeighborhoodBody:
      "Please select your neighborhood in Bukavu to see available laundry houses:",
    selectNeighborhoodBtn: "Select area",
    noNeighborhoodsAvailable:
      "No served neighborhoods are available right now. Please try again later.",
    selectHouseHeader: "🏪 Select a Laundry House",
    selectHouseBody: (neighborhoodName) =>
      `Partner laundry houses serving *${neighborhoodName}*:`,
    selectHouseBtn: "View houses",
    noHousesForNeighborhood: (neighborhoodName) =>
      `Sorry, no active laundry house currently covers *${neighborhoodName}*. Type *Menu* to choose another area.`,
    selectServiceHeader: (houseName) => `🧼 ${houseName}`,
    selectServiceBody: (houseName, minOrderCdf) =>
      `Select a service at *${houseName}* (Minimum order: ${minOrderCdf}):`,
    selectServiceBtn: "Select service",
    selectItemHeader: (serviceName) => `👕 ${serviceName}`,
    selectItemBody: "Select an item from the catalog to add to your cart:",
    selectItemBtn: "Select item",
    selectQuantityBody: (itemName, priceCdf) =>
      `How many *${itemName}* (${priceCdf}/unit) would you like to add?`,
    cartUpdatedBody: (cartSummary, subtotalCdf) =>
      `🛒 *Your Cart:*\n${cartSummary}\n\n*Items subtotal:* ${subtotalCdf}`,
    btnAddMoreItems: "+ Add item",
    btnChangeService: "Other service",
    btnProceedCheckout: "Pick time slot",
    minOrderNotMet: (minOrderCdf, missingCdf) =>
      `⚠️ Minimum order amount is *${minOrderCdf}* (*${missingCdf}* more needed). Please add more items.`,
    selectSlotHeader: "🕒 Pickup Time Slot",
    selectSlotBody: "Choose your preferred 2-hour pickup window:",
    selectSlotBtn: "Select slot",
    noSlotsAvailable:
      "Sorry, no courier pickup slots are available for this laundry house right now. Type *Menu* to start over.",
    captureLandmarkHeader: "🗺️ Landmark / Address",
    captureLandmarkBody: (neighborhoodName) =>
      `Neighborhood: *${neighborhoodName}*\n\nPlease send:\n1️⃣ A clear street landmark description (e.g., *Near Pharmacy X, blue gate*)\nOR\n2️⃣ Share your *WhatsApp GPS Location Pin* 📍.`,
    orderSummaryHeader: "✅ SafiHub Order Summary",
    orderSummaryBody: (p) =>
      `*Laundry House:* ${p.houseName}\n*Neighborhood:* ${p.neighborhoodName}\n*Landmark:* ${p.landmark}\n*Pickup Slot:* ${p.slotLabel}\n\n*Items:*\n${p.itemsList}\n\n*Subtotal:* ${p.itemsTotalCdf}\n*Delivery Fee:* ${p.deliveryFeeCdf}\n*TOTAL DUE (Cash on delivery):* *${p.totalDueCdf}*`,
    btnConfirmOrder: "Confirm Order",
    btnCancelOrder: "Cancel",
    orderCreatedSuccess: (p) =>
      `🎉 *Order Confirmed!*\n\n*Order Code:* #${p.orderCode}\n*Laundry House:* ${p.houseName}\n*Pickup Window:* ${p.slotLabel}\n*Total Due on Delivery:* ${p.totalDueCdf}\n\nTrack your order live:\n${p.trackingUrl}`,
    orderCancelledMsg:
      "Your draft order has been cancelled. Type *Hello* anytime to start a new order.",
    adjustmentApprovedMsg: (orderCode) =>
      `✅ You approved the price adjustment for order *#${orderCode}*. Washing will begin right away!`,
    adjustmentRejectedMsg: (orderCode) =>
      `❌ You declined the price adjustment for order *#${orderCode}*. We will arrange the return of your items.`,
    gpsLandmarkSavedForActiveOrder: (orderCode, landmark) =>
      `📍 GPS location saved for your active order *#${orderCode}*!\nUpdated landmark: ${landmark}`,
    priceAdjustmentPromptBody: (p) =>
      `⚠️ *Price Adjustment Required — Order #${p.orderCode}*\n\nAfter inspection at *${p.houseName}*, a difference of *${p.diffAmountCdf}* was recorded${p.reason ? ` (${p.reason})` : ""}.\n\nDo you approve this adjustment so washing can start?`,
    btnApproveAdjustment: "Approve",
    btnRejectAdjustment: "Decline",
  },
};

export function getBotCopy(locale?: string): BotCopyBundle {
  if (locale === "sw") return WHATSAPP_BOT_COPY.sw;
  if (locale === "en") return WHATSAPP_BOT_COPY.en;
  return WHATSAPP_BOT_COPY.fr;
}

