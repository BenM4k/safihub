import "server-only";
import { sendEmail } from "../client";
import { escapeHtml, renderEmailLayout } from "./layout";
import { getAppBaseUrl } from "../domain";

/**
 * Sends an email verification link to verify user email address.
 */
export async function sendVerificationEmail({
  email,
  name,
  verificationUrl,
  token,
}: {
  email: string;
  name?: string | null;
  verificationUrl: string;
  token?: string;
}): Promise<{ id: string; success: boolean; error?: string }> {
  const displayName = name ? escapeHtml(name.trim()) : "Cher client";
  const subject = "SafiHub — Confirmez votre adresse email";

  const baseUrl = getAppBaseUrl();
  // Direct verification URL handled by the auth endpoint
  const targetUrl = verificationUrl.startsWith("http")
    ? verificationUrl
    : `${baseUrl}${verificationUrl.startsWith("/") ? "" : "/"}${verificationUrl}`;

  const text = `Bonjour ${name ? name.trim() : ""},

Merci d'avoir créé votre compte sur SafiHub Bukavu !

Pour activer votre compte et commencer à commander votre pressing à domicile, veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :

${targetUrl}

${token ? `Code de vérification : ${token}\n` : ""}
Ce lien expirera dans 24 heures. Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer ce message.

L'équipe SafiHub Bukavu`;

  const contentHtml = `
    <h2 style="font-size: 18px; margin: 0 0 16px 0; color: #101828; font-weight: 700;">
      Confirmez votre adresse email
    </h2>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 16px 0;">
      Bonjour <strong>${displayName}</strong>,
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 24px 0;">
      Merci d'avoir rejoint SafiHub ! Pour sécuriser votre compte et finaliser votre inscription, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${targetUrl}" style="background-color: #2824D5; color: #FFFFFF; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);">
        Vérifier mon adresse email
      </a>
    </div>

    <p style="font-size: 12px; color: #667085; line-height: 1.5; margin: 24px 0 0 0;">
      Si le bouton ne fonctionne pas, copiez-collez ce lien direct dans votre navigateur :<br/>
      <a href="${targetUrl}" style="color: #2824D5; word-break: break-all;">${targetUrl}</a>
    </p>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #F2F4F7;">
      <p style="font-size: 12px; color: #98A2B3; margin: 0;">
        Ce lien expirera dans 24 heures. Si vous n'avez pas créé de compte SafiHub, vous pouvez ignorer cet e-mail.
      </p>
    </div>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: "Confirmez votre adresse email pour activer votre compte SafiHub.",
    badge: { text: "Activation de compte", variant: "indigo" },
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
 * Sends a password reset email containing a secure one-time link.
 */
export async function sendPasswordResetEmail({
  email,
  resetUrl,
  token,
}: {
  email: string;
  resetUrl: string;
  token: string;
}): Promise<{ id: string; success: boolean; error?: string }> {
  const subject = "SafiHub — Réinitialisation de votre mot de passe";

  const baseUrl = getAppBaseUrl();
  const webResetUrl = `${baseUrl}/reset-password?token=${token}`;

  const text = `Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe sur SafiHub Bukavu.
Veuillez cliquer sur le lien ci-dessous pour choisir un nouveau mot de passe :

${webResetUrl}

Lien d'authentification direct :
${resetUrl}

Ce lien expirera dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message en toute sécurité.

L'équipe SafiHub Bukavu`;

  const contentHtml = `
    <h2 style="font-size: 18px; margin: 0 0 16px 0; color: #101828; font-weight: 700;">
      Réinitialisation de votre mot de passe
    </h2>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 16px 0;">
      Bonjour, vous avez demandé à réinitialiser le mot de passe associé à votre compte SafiHub.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #344054; margin: 0 0 24px 0;">
      Cliquez sur le bouton ci-dessous pour choisir votre nouveau mot de passe sécurisé :
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${webResetUrl}" style="background-color: #2824D5; color: #FFFFFF; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);">
        Réinitialiser mon mot de passe
      </a>
    </div>

    <p style="font-size: 12px; color: #667085; line-height: 1.5; margin: 24px 0 0 0;">
      Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>
      <a href="${webResetUrl}" style="color: #2824D5; word-break: break-all;">${webResetUrl}</a>
    </p>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #F2F4F7;">
      <p style="font-size: 12px; color: #98A2B3; margin: 0;">
        Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail.
      </p>
    </div>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: "Réinitialisez le mot de passe de votre compte SafiHub.",
    badge: { text: "Sécurité du compte", variant: "warning" },
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

