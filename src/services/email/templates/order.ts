import "server-only";
import { sendEmail } from "../client";
import { escapeHtml, renderEmailLayout } from "./layout";

export interface OrderItemSummary {
  name: string;
  quantity: number;
  service?: string;
  priceCdf?: number;
}

/**
 * Sends an order confirmation email with live tracking link and item summary.
 */
export async function sendOrderConfirmationEmail({
  email,
  customerName,
  orderCode,
  houseName,
  pickupWindow,
  deliveryAddress,
  items,
  totalAmountCdf,
  trackingUrl,
}: {
  email: string;
  customerName: string;
  orderCode: string;
  houseName: string;
  pickupWindow: string;
  deliveryAddress: string;
  items: OrderItemSummary[];
  totalAmountCdf: number;
  trackingUrl: string;
}): Promise<{ id: string; success: boolean; error?: string }> {
  const safeName = escapeHtml(customerName);
  const safeOrderCode = escapeHtml(orderCode);
  const safeHouse = escapeHtml(houseName);
  const safeAddress = escapeHtml(deliveryAddress);
  const safeWindow = escapeHtml(pickupWindow);

  const subject = `SafiHub — Confirmation de commande #${orderCode}`;

  const formattedAmount = new Intl.NumberFormat("fr-CD").format(totalAmountCdf);

  const text = `Bonjour ${customerName},

Votre commande #${orderCode} a été enregistrée avec succès sur SafiHub Bukavu !

Détails de la commande :
- Pressing partenaire : ${houseName}
- Créneau de collecte : ${pickupWindow}
- Adresse : ${deliveryAddress}
- Montant estimé : ${formattedAmount} CDF (payable à la livraison en espèces)

Suivre votre commande en temps réel :
${trackingUrl}

L'équipe SafiHub Bukavu`;

  const itemsRowsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #F2F4F7;">
        <td style="padding: 10px 0; font-size: 13px; color: #101828;">${escapeHtml(item.name)}</td>
        <td style="padding: 10px 0; font-size: 13px; color: #475467; text-align: center;">x${item.quantity}</td>
        <td style="padding: 10px 0; font-size: 13px; color: #475467; text-align: right;">${
          item.priceCdf ? `${new Intl.NumberFormat("fr-CD").format(item.priceCdf)} CDF` : ""
        }</td>
      </tr>`
    )
    .join("");

  const contentHtml = `
    <h2 style="font-size: 18px; margin: 0 0 16px 0; color: #101828; font-weight: 700;">
      Commande #${safeOrderCode} confirmée
    </h2>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 16px 0;">
      Bonjour <strong>${safeName}</strong>,
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 20px 0;">
      Votre commande a été transmise à notre atelier partenaire <strong>${safeHouse}</strong>. Un coursier SafiHub viendra collecter votre linge pendant le créneau prévu.
    </p>

    <!-- Order summary card -->
    <div style="background-color: #F8F9FC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="font-size: 13px; font-weight: 700; margin: 0 0 12px 0; color: #101828; text-transform: uppercase; letter-spacing: 0.5px;">
        Récapitulatif de collecte
      </h3>
      <table style="width: 100%; font-size: 13px; color: #344054; line-height: 1.6;">
        <tr>
          <td style="padding: 4px 0; color: #667085; width: 140px;">Créneau de passage :</td>
          <td style="padding: 4px 0; font-weight: 600; color: #101828;">${safeWindow}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #667085;">Lieu de ramassage :</td>
          <td style="padding: 4px 0; color: #344054;">${safeAddress}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #667085;">Paiement :</td>
          <td style="padding: 4px 0; color: #344054;">Espèces à la livraison (CDF / USD)</td>
        </tr>
      </table>

      ${
        items.length > 0
          ? `
      <div style="margin-top: 16px; pt-3; border-top: 1px solid #E2E8F0;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid #D0D5DD; font-size: 11px; text-transform: uppercase; color: #667085;">
              <th style="padding: 6px 0; text-align: left;">Article</th>
              <th style="padding: 6px 0; text-align: center;">Qté</th>
              <th style="padding: 6px 0; text-align: right;">Prix</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
        </table>
      </div>`
          : ""
      }

      <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; color: #101828;">
        <span>Total estimé :</span>
        <span style="color: #2824D5;">${formattedAmount} CDF</span>
      </div>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${trackingUrl}" style="background-color: #2824D5; color: #FFFFFF; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);">
        Suivre ma commande en direct
      </a>
    </div>

    <p style="font-size: 12px; color: #667085; line-height: 1.5; margin: 24px 0 0 0;">
      Lien direct : <a href="${trackingUrl}" style="color: #2824D5; word-break: break-all;">${trackingUrl}</a>
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Votre commande #${orderCode} est confirmée. Collecte prévue : ${pickupWindow}.`,
    badge: { text: "Commande Confirmée", variant: "indigo" },
    contentHtml,
  });

  return sendEmail({
    to: email,
    subject,
    html,
    text,
    senderType: "contact",
  });
}

/**
 * Sends an email prompt when an item count or price adjustment requires customer approval.
 */
export async function sendOrderAdjustmentPromptEmail({
  email,
  customerName,
  orderCode,
  houseName,
  diffAmountCdf,
  newTotalAmountCdf,
  reason,
  approvalUrl,
}: {
  email: string;
  customerName: string;
  orderCode: string;
  houseName: string;
  diffAmountCdf: number;
  newTotalAmountCdf: number;
  reason?: string;
  approvalUrl: string;
}): Promise<{ id: string; success: boolean; error?: string }> {
  const safeName = escapeHtml(customerName);
  const safeOrderCode = escapeHtml(orderCode);
  const safeHouse = escapeHtml(houseName);
  const safeReason = reason ? escapeHtml(reason) : "Ajustement du comptage de linge à la réception";

  const subject = `SafiHub — Action requise : Ajustement sur votre commande #${orderCode}`;

  const formattedDiff = new Intl.NumberFormat("fr-CD").format(Math.abs(diffAmountCdf));
  const formattedNewTotal = new Intl.NumberFormat("fr-CD").format(newTotalAmountCdf);
  const sign = diffAmountCdf > 0 ? "+" : "-";

  const text = `Bonjour ${customerName},

Lors de la réception de votre linge à l'atelier "${houseName}", un ajustement a été constaté :
Motif : ${reason || "Différence de comptage ou de matière"}
Variation : ${sign}${formattedDiff} CDF
Nouveau total : ${formattedNewTotal} CDF

Veuillez confirmer ou contester cet ajustement pour que le nettoyage puisse démarrer :
${approvalUrl}

L'équipe SafiHub Bukavu`;

  const contentHtml = `
    <h2 style="font-size: 18px; margin: 0 0 16px 0; color: #101828; font-weight: 700;">
      Ajustement constaté sur la commande #${safeOrderCode}
    </h2>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 16px 0;">
      Bonjour <strong>${safeName}</strong>,
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 20px 0;">
      Lors de la réception et du comptage contradictoire de vos vêtements à l'atelier <strong>${safeHouse}</strong>, une différence a été relevée par rapport à votre déclaration initiale.
    </p>

    <div style="background-color: #FEF0C7; border: 1px solid #FEDF89; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #B54708;">Motif de l'ajustement :</p>
      <p style="margin: 0; font-size: 13px; color: #475467; line-height: 1.6;">${safeReason}</p>
      <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #FEDF89; font-size: 13px; font-weight: 600; color: #B54708;">
        Variation de prix : ${sign}${formattedDiff} CDF &bull; Nouveau total : ${formattedNewTotal} CDF
      </div>
    </div>

    <p style="font-size: 13px; line-height: 1.6; color: #344054; margin: 0 0 24px 0;">
      Conformément aux règles de SafiHub, votre approbation explicite est requise avant le lancement du lavage.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${approvalUrl}" style="background-color: #2824D5; color: #FFFFFF; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
        Valider ou contester l'ajustement
      </a>
    </div>

    <p style="font-size: 12px; color: #667085; line-height: 1.5; margin: 24px 0 0 0;">
      Lien direct : <a href="${approvalUrl}" style="color: #2824D5; word-break: break-all;">${approvalUrl}</a>
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Ajustement de ${sign}${formattedDiff} CDF sur la commande #${orderCode}. Validation requise.`,
    badge: { text: "Validation Requise", variant: "warning" },
    contentHtml,
  });

  return sendEmail({
    to: email,
    subject,
    html,
    text,
    senderType: "contact",
  });
}

/**
 * Sends a final receipt / invoice email upon successful order delivery.
 */
export async function sendOrderDeliveredReceiptEmail({
  email,
  customerName,
  orderCode,
  houseName,
  totalPaidCdf,
  totalPaidUsd,
  exchangeRate,
  trackingUrl,
}: {
  email: string;
  customerName: string;
  orderCode: string;
  houseName: string;
  totalPaidCdf: number;
  totalPaidUsd?: number | null;
  exchangeRate?: number | null;
  trackingUrl: string;
}): Promise<{ id: string; success: boolean; error?: string }> {
  const safeName = escapeHtml(customerName);
  const safeOrderCode = escapeHtml(orderCode);
  const safeHouse = escapeHtml(houseName);

  const subject = `SafiHub — Reçu de livraison pour votre commande #${orderCode}`;

  const formattedCdf = new Intl.NumberFormat("fr-CD").format(totalPaidCdf);
  const formattedUsd = totalPaidUsd ? `$${totalPaidUsd.toFixed(2)}` : null;

  const text = `Bonjour ${customerName},

Votre linge propre pour la commande #${orderCode} a été livré avec succès par notre coursier !

Récapitulatif de paiement :
- Atelier : ${houseName}
- Total réglé : ${formattedCdf} CDF ${formattedUsd ? `(${formattedUsd} à taux gelé)` : ""}
- Mode de règlement : Espèces à la livraison

Consulter le détail et laisser un avis sur votre pressing :
${trackingUrl}

Merci de votre confiance,
L'équipe SafiHub Bukavu`;

  const contentHtml = `
    <h2 style="font-size: 18px; margin: 0 0 16px 0; color: #101828; font-weight: 700;">
      Linge livré avec succès !
    </h2>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 16px 0;">
      Bonjour <strong>${safeName}</strong>,
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 20px 0;">
      Votre commande <strong>#${safeOrderCode}</strong> traitée par <strong>${safeHouse}</strong> vous a été remise propre et soignée.
    </p>

    <div style="background-color: #ECFDF3; border: 1px solid #A6F4C5; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="font-size: 13px; font-weight: 700; margin: 0 0 8px 0; color: #027A48; text-transform: uppercase;">
        Reçu de paiement acquitté
      </h3>
      <p style="margin: 0; font-size: 14px; color: #027A48;">
        Montant total réglé : <strong>${formattedCdf} CDF</strong> ${
          formattedUsd ? `(${formattedUsd} USD)` : ""
        }
      </p>
      ${
        exchangeRate
          ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #067647;">Taux de change fixé à la commande : 1 USD = ${new Intl.NumberFormat("fr-CD").format(exchangeRate)} CDF</p>`
          : ""
      }
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${trackingUrl}" style="background-color: #2824D5; color: #FFFFFF; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
        Évaluer la prestation du pressing
      </a>
    </div>

    <p style="font-size: 12px; color: #667085; line-height: 1.5; margin: 24px 0 0 0;">
      Votre facture détaillée reste consultable à tout moment : <a href="${trackingUrl}" style="color: #2824D5; word-break: break-all;">${trackingUrl}</a>
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Reçu de paiement acquitté de ${formattedCdf} CDF pour la commande #${orderCode}.`,
    badge: { text: "Commande Livrée", variant: "success" },
    contentHtml,
  });

  return sendEmail({
    to: email,
    subject,
    html,
    text,
    senderType: "contact",
  });
}

