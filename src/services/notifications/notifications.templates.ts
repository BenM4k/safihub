import type {
  NotificationLocale,
  NotificationTemplateKey,
  TemplateParams,
} from "./notifications.types";

interface TemplateDefinition {
  title: string;
  body: string;
}

export const NOTIFICATION_TEMPLATES: Record<
  NotificationTemplateKey,
  Record<NotificationLocale, TemplateDefinition>
> = {
  order_created: {
    fr: {
      title: "Nouvelle commande",
      body: "Nouvelle commande #{orderIdShort} passée chez {houseName}.",
    },
    sw: {
      title: "Agizo jipya",
      body: "Agizo jipya #{orderIdShort} limewekwa kwa {houseName}.",
    },
    en: {
      title: "New order",
      body: "New order #{orderIdShort} placed at {houseName}.",
    },
  },
  order_accepted: {
    fr: {
      title: "Commande acceptée",
      body: "Votre commande #{orderIdShort} a été acceptée par {houseName}.",
    },
    sw: {
      title: "Agizo limekubaliwa",
      body: "Agizo lako #{orderIdShort} limekubaliwa na {houseName}.",
    },
    en: {
      title: "Order accepted",
      body: "Your order #{orderIdShort} was accepted by {houseName}.",
    },
  },
  order_rejected: {
    fr: {
      title: "Commande refusée",
      body: "Votre commande #{orderIdShort} a été refusée : {reason}.",
    },
    sw: {
      title: "Agizo limekataliwa",
      body: "Agizo lako #{orderIdShort} limekataliwa: {reason}.",
    },
    en: {
      title: "Order rejected",
      body: "Your order #{orderIdShort} was rejected: {reason}.",
    },
  },
  order_expired: {
    fr: {
      title: "Commande expirée",
      body: "Le pressing n'a pas répondu à temps pour la commande #{orderIdShort}. Vous pouvez choisir un autre pressing.",
    },
    sw: {
      title: "Agizo limeisha muda",
      body: "Dobi hakujibu kwa wakati kwa agizo #{orderIdShort}. Unaweza kuchagua dobi mwingine.",
    },
    en: {
      title: "Order expired",
      body: "The laundry house did not respond in time for order #{orderIdShort}. You can switch houses.",
    },
  },
  pickup_assigned: {
    fr: {
      title: "Mission de collecte assignée",
      body: "Une mission de collecte pour la commande #{orderIdShort} vous a été assignée.",
    },
    sw: {
      title: "Dhamira ya kuchukua nguo imekabidhiwa",
      body: "Dhamira ya kuchukua nguo kwa agizo #{orderIdShort} umekabidhiwa.",
    },
    en: {
      title: "Pickup mission assigned",
      body: "A pickup mission for order #{orderIdShort} has been assigned to you.",
    },
  },
  pickup_in_progress: {
    fr: {
      title: "Collecte en cours",
      body: "Le coursier {courierName} est en route pour récupérer votre linge.",
    },
    sw: {
      title: "Mkusanyiko unaendelea",
      body: "Msafirishaji {courierName} yuko njiani kuchukua nguo zako.",
    },
    en: {
      title: "Pickup in progress",
      body: "Courier {courierName} is on the way to pick up your laundry.",
    },
  },
  picked_up: {
    fr: {
      title: "Linge collecté",
      body: "Votre linge a été collecté par {courierName} ({itemCount} articles).",
    },
    sw: {
      title: "Nguo zimekusanywa",
      body: "Nguo zako zimekusanywa na {courierName} (nguo {itemCount}).",
    },
    en: {
      title: "Laundry picked up",
      body: "Your laundry was collected by {courierName} ({itemCount} items).",
    },
  },
  received: {
    fr: {
      title: "Linge arrivé au pressing",
      body: "Votre linge est bien arrivé chez {houseName} pour contrôle et pesée.",
    },
    sw: {
      title: "Nguo zimefika kwa dobi",
      body: "Nguo zako zimefika kwa {houseName} kwa ukaguzi na hesabu.",
    },
    en: {
      title: "Laundry received at house",
      body: "Your laundry arrived at {houseName} for inspection and counting.",
    },
  },
  price_adjusted: {
    fr: {
      title: "Ajustement de prix requis",
      body: "Un ajustement de {diffAmount} {currency} a été proposé pour la commande #{orderIdShort}. Veuillez valider.",
    },
    sw: {
      title: "Marekebisho ya bei yanahitajika",
      body: "Marekebisho ya {diffAmount} {currency} yamependekezwa kwa agizo #{orderIdShort}. Tafadhali thibitisha.",
    },
    en: {
      title: "Price adjustment required",
      body: "A price adjustment of {diffAmount} {currency} is proposed for order #{orderIdShort}. Please approve.",
    },
  },
  washing: {
    fr: {
      title: "Lavage en cours",
      body: "Votre linge est en cours de traitement et lavage chez {houseName}.",
    },
    sw: {
      title: "Ufuaji unaendelea",
      body: "Nguo zako zinafuliwa na kushughulikiwa kwa {houseName}.",
    },
    en: {
      title: "Washing in progress",
      body: "Your laundry is being processed and washed at {houseName}.",
    },
  },
  ready: {
    fr: {
      title: "Linge propre et prêt",
      body: "Votre linge est prêt ! Confirmez votre créneau de livraison.",
    },
    sw: {
      title: "Nguo ziko tayari na safi",
      body: "Nguo zako ziko tayari! Thibitisha muda wa uwasilishaji.",
    },
    en: {
      title: "Laundry ready",
      body: "Your laundry is ready! Confirm your delivery slot.",
    },
  },
  delivery_assigned: {
    fr: {
      title: "Mission de livraison assignée",
      body: "Une mission de livraison pour la commande #{orderIdShort} vous a été assignée.",
    },
    sw: {
      title: "Dhamira ya uwasilishaji imekabidhiwa",
      body: "Dhamira ya uwasilishaji kwa agizo #{orderIdShort} umekabidhiwa.",
    },
    en: {
      title: "Delivery mission assigned",
      body: "A delivery mission for order #{orderIdShort} has been assigned to you.",
    },
  },
  delivery_in_progress: {
    fr: {
      title: "Livraison en cours",
      body: "Le coursier {courierName} est en route pour livrer votre linge propre.",
    },
    sw: {
      title: "Uwasilishaji unaendelea",
      body: "Msafirishaji {courierName} yuko njiani kuleta nguo zako safi.",
    },
    en: {
      title: "Delivery in progress",
      body: "Courier {courierName} is on the way to deliver your clean laundry.",
    },
  },
  delivered: {
    fr: {
      title: "Commande livrée",
      body: "Commande #{orderIdShort} livrée avec succès ! Montant encaissé : {amount} {currency}.",
    },
    sw: {
      title: "Agizo limewasilishwa",
      body: "Agizo #{orderIdShort} limewasilishwa kikamilifu! Kiasi kilichopokewa: {amount} {currency}.",
    },
    en: {
      title: "Order delivered",
      body: "Order #{orderIdShort} delivered successfully! Amount collected: {amount} {currency}.",
    },
  },
  order_cancelled: {
    fr: {
      title: "Commande annulée",
      body: "La commande #{orderIdShort} a été annulée. Motif : {reason}.",
    },
    sw: {
      title: "Agizo limefutwa",
      body: "Agizo #{orderIdShort} limefutwa. Sababu: {reason}.",
    },
    en: {
      title: "Order cancelled",
      body: "Order #{orderIdShort} has been cancelled. Reason: {reason}.",
    },
  },
  order_disputed: {
    fr: {
      title: "Litige ouvert",
      body: "Un litige a été ouvert pour la commande #{orderIdShort}. Notre équipe intervient.",
    },
    sw: {
      title: "Mzozo umefunguliwa",
      body: "Mzozo umefunguliwa kwa agizo #{orderIdShort}. Timu yetu inashughulikia.",
    },
    en: {
      title: "Dispute opened",
      body: "A dispute has been opened for order #{orderIdShort}. Our team is investigating.",
    },
  },
  house_acceptance_reminder: {
    fr: {
      title: "Rappel commande en attente",
      body: "Rappel : Commande #{orderIdShort} en attente chez {houseName}. Plus que la moitié du délai.",
    },
    sw: {
      title: "Kikumbusho cha agizo",
      body: "Kikumbusho: Agizo #{orderIdShort} linasubiri kwa {houseName}. Nusu ya muda imepita.",
    },
    en: {
      title: "Order acceptance reminder",
      body: "Reminder: Order #{orderIdShort} waiting at {houseName}. Half time elapsed.",
    },
  },
  admin_escalation_alert: {
    fr: {
      title: "Alerte dépassement délai",
      body: "Alerte : Le pressing {houseName} n'a pas répondu pour la commande #{orderIdShort} (75% du délai écoulé).",
    },
    sw: {
      title: "Tahadhari ya kuchelewa",
      body: "Tahadhari: Dobi {houseName} hajajibu kwa agizo #{orderIdShort} (75% ya muda umepita).",
    },
    en: {
      title: "Escalation alert",
      body: "Alert: Laundry house {houseName} has not responded for order #{orderIdShort} (75% time elapsed).",
    },
  },
};

/**
 * Interpolates variables in a string with {paramName} pattern.
 */
export function interpolateTemplate(
  text: string,
  params: TemplateParams = {}
): string {
  return text.replace(/{([a-zA-Z0-9_]+)}/g, (_, key) => {
    const val = params[key];
    return val !== undefined && val !== null ? String(val) : "";
  });
}

/**
 * Resolves title and body for a template key and locale.
 */
export function renderNotificationTemplate(
  templateKey: NotificationTemplateKey,
  locale: string = "fr",
  params: TemplateParams = {}
): TemplateDefinition {
  const normalizedLocale: NotificationLocale =
    locale === "sw" ? "sw" : locale === "en" ? "en" : "fr";

  const template =
    NOTIFICATION_TEMPLATES[templateKey]?.[normalizedLocale] ??
    NOTIFICATION_TEMPLATES[templateKey]?.fr ?? {
      title: "Notification SafiHub",
      body: "Notification pour votre commande",
    };

  return {
    title: interpolateTemplate(template.title, params),
    body: interpolateTemplate(template.body, params),
  };
}
