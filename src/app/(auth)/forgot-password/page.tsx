import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form/forgot-password-form";
import { AuthRedirectGate } from "@/components/auth/auth-redirect-gate";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Mot de Passe Oublié",
  description:
    "Saisissez l'adresse e-mail associée à votre compte pour recevoir un lien de réinitialisation sécurisé.",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthRedirectGate />
      <ForgotPasswordForm />
    </>
  );
}
