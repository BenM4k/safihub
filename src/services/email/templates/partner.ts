import "server-only";
import { sendEmail } from "../client";
import { escapeHtml, renderEmailLayout } from "./layout";
import { getAppBaseUrl } from "../domain";

/**
 * Sends a welcome and invitation email to an approved laundry partner staff member.
 */
export async function sendPartnerInvitationEmail({
  email,
  contactName,
  houseName,
  inviteUrl,
  temporaryPassword,
}: {
  email: string;
  contactName: string;
  houseName: string;
  inviteUrl: string;
  temporaryPassword?: string;
}): Promise<{ id: string; success: boolean; error?: string }> {
  const safeHouseName = escapeHtml(houseName);
  const safeContactName = escapeHtml(contactName);

  const subject = `SafiHub — Félicitations, votre pressing "${houseName}" est approuvé !`;

  const text = `Bonjour ${contactName},

Excellente nouvelle ! Votre demande de partenariat pour votre atelier "${houseName}" sur SafiHub a été approuvée par notre équipe.

Votre compte partenaire est prêt. Pour vous connecter à votre tableau de bord partenaire, utilisez le lien suivant :
${inviteUrl}

${
  temporaryPassword
    ? `Votre mot de passe temporaire : ${temporaryPassword}
(Nous vous recommandons de le changer lors de votre première connexion dans les paramètres de votre compte.)\n`
    : ""
}
Depuis votre espace partenaire, vous pourrez :
- Définir vos horaires d'ouverture et capacités quotidiennes
- Activer vos prestations et vos tarifs
- Choisir vos zones de couverture à Bukavu

Bienvenue dans le réseau SafiHub !
L'équipe SafiHub Bukavu`;

  const passwordBlock = temporaryPassword
    ? `<div style="background-color: #F8F9FC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: #101828;">Vos identifiants d'accès :</p>
        <p style="margin: 0; font-size: 13px; color: #344054;">Email : <strong>${escapeHtml(email)}</strong></p>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #344054;">Mot de passe temporaire : <code style="background: #EEF0FF; color: #2824D5; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${escapeHtml(temporaryPassword)}</code></p>
        <p style="margin: 8px 0 0 0; font-size: 11px; color: #667085;">Vous pourrez modifier ce mot de passe dès votre première connexion.</p>
      </div>`
    : "";

  const contentHtml = `
    <h2 style="font-size: 18px; margin: 0 0 16px 0; color: #101828; font-weight: 700;">
      Partenariat approuvé pour ${safeHouseName}
    </h2>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 16px 0;">
      Bonjour <strong>${safeContactName}</strong>,
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 16px 0;">
      Toute l'équipe SafiHub a le plaisir de vous informer que votre candidature pour intégrer le réseau de pressing SafiHub avec <strong>${safeHouseName}</strong> a été validée avec succès.
    </p>

    ${passwordBlock}

    <div style="text-align: center; margin: 32px 0;">
      <a href="${inviteUrl}" style="background-color: #2824D5; color: #FFFFFF; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);">
        Accéder à mon espace partenaire
      </a>
    </div>

    <div style="background-color: #F8F9FC; border-radius: 8px; padding: 16px; margin-top: 24px;">
      <h3 style="font-size: 13px; font-weight: 600; margin: 0 0 8px 0; color: #101828;">Prochaines étapes recommandées :</h3>
      <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #475467; line-height: 1.6;">
        <li>Vérifier et ajuster vos horaires d'ouverture hebdomadaires</li>
        <li>Configurer vos articles de pressing et tarifs</li>
        <li>Indiquer vos zones de ramassage desservies à Bukavu</li>
      </ol>
    </div>

    <p style="font-size: 12px; color: #667085; line-height: 1.5; margin: 24px 0 0 0;">
      Lien direct : <a href="${inviteUrl}" style="color: #2824D5; word-break: break-all;">${inviteUrl}</a>
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Votre demande pour ${houseName} a été approuvée sur SafiHub.`,
    badge: { text: "Partenariat Validé", variant: "success" },
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
 * Sends a notification email when a partner application is rejected.
 */
export async function sendPartnerRejectionEmail({
  email,
  contactName,
  houseName,
  adminNote,
}: {
  email: string;
  contactName: string;
  houseName: string;
  adminNote: string;
}): Promise<{ id: string; success: boolean; error?: string }> {
  const safeHouseName = escapeHtml(houseName);
  const safeContactName = escapeHtml(contactName);
  const safeAdminNote = escapeHtml(adminNote);

  const subject = `SafiHub — Information concernant votre demande de partenariat (${houseName})`;

  const text = `Bonjour ${contactName},

Nous vous remercions de l'intérêt porté à SafiHub et pour votre demande de partenariat concernant l'atelier "${houseName}".

Après examen attentif de votre dossier par notre équipe d'exploitation à Bukavu, nous avons le regret de vous informer que votre candidature ne peut pas être retenue pour le moment.

Motif de la décision :
${adminNote}

Si vous avez des questions ou si vous souhaitez soumettre un dossier actualisé, n'hésitez pas à répondre à ce message ou à contacter notre équipe d'assistance.

Cordialement,
L'équipe SafiHub Bukavu`;

  const contentHtml = `
    <h2 style="font-size: 18px; margin: 0 0 16px 0; color: #101828; font-weight: 700;">
      Mise à jour concernant votre dossier (${safeHouseName})
    </h2>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 16px 0;">
      Bonjour <strong>${safeContactName}</strong>,
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 20px 0;">
      Nous vous remercions d'avoir candidaté pour intégrer le réseau de pressing SafiHub avec votre atelier <strong>${safeHouseName}</strong>.
      Après étude de vos informations, nous ne sommes pas en mesure de valider votre demande actuellement.
    </p>

    <div style="background-color: #FEF3F2; border: 1px solid #FECDCA; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #B42318;">Remarque de l'équipe d'exploitation :</p>
      <p style="margin: 0; font-size: 13px; color: #475467; line-height: 1.6;">${safeAdminNote}</p>
    </div>

    <p style="font-size: 13px; line-height: 1.6; color: #344054; margin: 20px 0 0 0;">
      Vous pouvez répondre directement à cet email pour apporter des clarifications ou soumettre à nouveau votre atelier dès que les critères requis seront réunis.
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Décision concernant la demande de partenariat pour ${houseName}.`,
    badge: { text: "Candidature non retenue", variant: "destructive" },
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
 * Sends an email notification when an admin suspends or reactivates a laundry house.
 */
export async function sendHouseStatusChangeEmail({
  email,
  houseName,
  isActive,
  reason,
}: {
  email: string;
  houseName: string;
  isActive: boolean;
  reason?: string;
}): Promise<{ id: string; success: boolean; error?: string }> {
  const safeHouseName = escapeHtml(houseName);
  const safeReason = reason ? escapeHtml(reason) : null;

  const subject = isActive
    ? `SafiHub — Votre atelier "${houseName}" est réactivé`
    : `SafiHub — Suspension temporaire de votre atelier "${houseName}"`;

  const statusLabel = isActive ? "Atelier Réactivé" : "Atelier Suspendu";
  const badgeVariant = isActive ? "success" : "warning";

  const text = isActive
    ? `Bonjour,

Votre atelier de pressing "${houseName}" a été réactivé sur la plateforme SafiHub.
Les clients peuvent désormais sélectionner votre atelier et passer de nouvelles commandes.

L'équipe SafiHub Bukavu`
    : `Bonjour,

Nous vous informons que votre atelier de pressing "${houseName}" a été suspendu temporairement par l'administration SafiHub.
Pendant cette suspension, votre atelier n'apparaîtra plus dans les résultats de recherche des clients.

${reason ? `Motif : ${reason}\n` : ""}
Veuillez contacter le support SafiHub pour régulariser la situation.

L'équipe SafiHub Bukavu`;

  const reasonHtml = safeReason
    ? `<div style="background-color: ${isActive ? "#ECFDF3" : "#FEF3F2"}; border: 1px solid ${isActive ? "#A6F4C5" : "#FECDCA"}; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: ${isActive ? "#027A48" : "#B42318"};">Motif :</p>
        <p style="margin: 0; font-size: 13px; color: #475467; line-height: 1.6;">${safeReason}</p>
      </div>`
    : "";

  const contentHtml = `
    <h2 style="font-size: 18px; margin: 0 0 16px 0; color: #101828; font-weight: 700;">
      Statut de votre atelier ${safeHouseName}
    </h2>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 16px 0;">
      ${
        isActive
          ? `Votre atelier <strong>${safeHouseName}</strong> a été réactivé par l'administration SafiHub. Il est de nouveau visible aux clients pour la commande de pressing à Bukavu.`
          : `Votre atelier <strong>${safeHouseName}</strong> a été temporairement suspendu par l'administration SafiHub. Il ne recevra plus de nouvelles commandes jusqu'à sa réactivation.`
      }
    </p>

    ${reasonHtml}

    <p style="font-size: 13px; line-height: 1.6; color: #667085; margin: 20px 0 0 0;">
      Pour toute question, contactez notre équipe support.
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Mise à jour du statut opérationnel de ${houseName}.`,
    badge: { text: statusLabel, variant: badgeVariant },
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
 * Sends a notification email when a user is linked as a staff member to a partner house.
 */
export async function sendHouseStaffLinkedEmail({
  email,
  userName,
  houseName,
  houseSlug,
}: {
  email: string;
  userName: string;
  houseName: string;
  houseSlug: string;
}): Promise<{ id: string; success: boolean; error?: string }> {
  const safeHouseName = escapeHtml(houseName);
  const safeUserName = escapeHtml(userName);

  const subject = `SafiHub — Vous avez été ajouté à l'équipe "${houseName}"`;

  const baseUrl = getAppBaseUrl();
  const partnerUrl = `${baseUrl}/partner/${houseSlug}`;

  const text = `Bonjour ${userName},

Vous avez été associé en tant que collaborateur pour l'atelier de pressing "${houseName}" sur SafiHub.
Vous pouvez désormais accéder à l'espace de gestion et suivre les commandes de l'atelier ici :

${partnerUrl}

L'équipe SafiHub Bukavu`;

  const contentHtml = `
    <h2 style="font-size: 18px; margin: 0 0 16px 0; color: #101828; font-weight: 700;">
      Accès collaborateur attribué
    </h2>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 16px 0;">
      Bonjour <strong>${safeUserName}</strong>,
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 24px 0;">
      Vous avez été désigné comme membre de l'équipe pour le pressing <strong>${safeHouseName}</strong> sur la plateforme SafiHub. Vous pouvez traiter les commandes entrantes, la réception et la conformité du linge.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${partnerUrl}" style="background-color: #2824D5; color: #FFFFFF; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
        Accéder au pressing
      </a>
    </div>

    <p style="font-size: 12px; color: #667085; line-height: 1.5; margin: 24px 0 0 0;">
      Lien direct : <a href="${partnerUrl}" style="color: #2824D5; word-break: break-all;">${partnerUrl}</a>
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Vous avez rejoint l'équipe de ${houseName} sur SafiHub.`,
    badge: { text: "Membre d'équipe", variant: "indigo" },
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

