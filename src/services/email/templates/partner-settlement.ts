import "server-only";
import { sendEmail } from "../client";
import { escapeHtml, renderEmailLayout } from "./layout";

/**
 * Sends an acknowledgment email when a laundry partner application is received.
 */
export async function sendPartnerApplicationReceivedEmail({
  email,
  contactName,
  houseName,
}: {
  email: string;
  contactName: string;
  houseName: string;
}): Promise<{ id: string; success: boolean; error?: string }> {
  const safeName = escapeHtml(contactName);
  const safeHouse = escapeHtml(houseName);

  const subject = `SafiHub — Candidature reçue pour votre atelier "${houseName}"`;

  const text = `Bonjour ${contactName},

Nous avons bien reçu votre demande d'adhésion au réseau de pressing SafiHub pour votre atelier "${houseName}".

Notre équipe d'exploitation à Bukavu étudie votre dossier (capacité, raccordement, zones de couverture) sous 24 à 48 heures.
Vous recevrez un email dès que votre atelier sera validé.

Merci de votre engagement à nos côtés,
L'équipe SafiHub Bukavu`;

  const contentHtml = `
    <h2 style="font-size: 18px; margin: 0 0 16px 0; color: #101828; font-weight: 700;">
      Candidature enregistrée avec succès
    </h2>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 16px 0;">
      Bonjour <strong>${safeName}</strong>,
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 20px 0;">
      Nous vous confirmons la bonne réception de votre dossier de candidature pour rejoindre le réseau SafiHub avec <strong>${safeHouse}</strong>.
    </p>

    <div style="background-color: #F8F9FC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #101828;">Prochaines étapes :</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475467; line-height: 1.6;">
        <li>Examen technique de votre dossier par l'équipe Bukavu (Ibanda, Kadutu, Bagira)</li>
        <li>Validation et création de vos accès au tableau de bord pressing</li>
        <li>Paramétrage de vos grilles tarifaires et horaires d'ouverture</li>
      </ul>
    </div>

    <p style="font-size: 13px; line-height: 1.6; color: #667085; margin: 20px 0 0 0;">
      Nous vous contacterons très prochainement.
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Votre dossier pour ${houseName} a été bien reçu par SafiHub.`,
    badge: { text: "Dossier Reçu", variant: "indigo" },
    contentHtml,
  });

  return sendEmail({
    to: email,
    subject,
    html,
    text,
    senderType: "partners",
  });
}

/**
 * Sends a statement email when a partner laundry house settlement payout is disbursed.
 */
export async function sendHouseSettlementEmail({
  email,
  houseName,
  netPayoutAmountCdf,
  commissionAmountCdf,
  ordersCount,
  settlementId,
}: {
  email: string;
  houseName: string;
  netPayoutAmountCdf: number;
  commissionAmountCdf?: number;
  ordersCount?: number;
  settlementId: string;
}): Promise<{ id: string; success: boolean; error?: string }> {
  const safeHouse = escapeHtml(houseName);
  const formattedPayout = new Intl.NumberFormat("fr-CD").format(netPayoutAmountCdf);
  const formattedCommission =
    typeof commissionAmountCdf === "number"
      ? new Intl.NumberFormat("fr-CD").format(commissionAmountCdf)
      : null;

  const subject = `SafiHub — Relevé de versement pour l'atelier "${houseName}"`;

  const textLines = [
    "Bonjour,",
    "",
    `Un règlement de versement SafiHub a été émis pour votre atelier "${houseName}" :`,
    "",
    `- Référence règlement : ${settlementId}`,
  ];
  if (typeof ordersCount === "number") {
    textLines.push(`- Commandes traitées : ${ordersCount}`);
  }
  if (formattedCommission !== null) {
    textLines.push(`- Commission plateforme : ${formattedCommission} CDF`);
  }
  textLines.push(`- Montant net versé : ${formattedPayout} CDF`, "", "L'équipe SafiHub Bukavu");
  const text = textLines.join("\n");

  const ordersRow =
    typeof ordersCount === "number"
      ? `<tr>
          <td style="color: #475467; padding: 4px 0;">Commandes clôturées :</td>
          <td style="font-weight: 600; color: #101828;">${ordersCount}</td>
        </tr>`
      : "";

  const commissionRow =
    formattedCommission !== null
      ? `<tr>
          <td style="color: #475467; padding: 4px 0;">Commission SafiHub :</td>
          <td style="color: #475467;">${formattedCommission} CDF</td>
        </tr>`
      : "";

  const contentHtml = `
    <h2 style="font-size: 18px; margin: 0 0 16px 0; color: #101828; font-weight: 700;">
      Règlement de versement pressing
    </h2>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 20px 0;">
      Un virement/règlement a été validé pour votre atelier <strong>${safeHouse}</strong>.
    </p>

    <div style="background-color: #ECFDF3; border: 1px solid #A6F4C5; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="font-size: 13px; font-weight: 700; margin: 0 0 12px 0; color: #027A48; text-transform: uppercase;">
        Détails du décompte
      </h3>
      <table style="width: 100%; font-size: 13px; line-height: 1.6;">
        <tr>
          <td style="color: #475467; padding: 4px 0;">Référence :</td>
          <td style="font-weight: 600; color: #101828;">${escapeHtml(settlementId)}</td>
        </tr>
        ${ordersRow}
        ${commissionRow}
        <tr style="border-top: 1px solid #A6F4C5;">
          <td style="padding-top: 8px; font-weight: 700; color: #027A48;">Montant net versé :</td>
          <td style="padding-top: 8px; font-weight: 700; color: #027A48; font-size: 15px;">${formattedPayout} CDF</td>
        </tr>
      </table>
    </div>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Versement net de ${formattedPayout} CDF pour ${houseName}.`,
    badge: { text: "Versement Effectué", variant: "success" },
    contentHtml,
  });

  return sendEmail({
    to: email,
    subject,
    html,
    text,
    senderType: "partners",
  });
}

