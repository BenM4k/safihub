import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form/forgot-password-form";
import { AuthRedirectGate } from "@/components/auth/auth-redirect-gate";

export const metadata: Metadata = {
  title: "Mot de passe oublié | SafiHub",
  description:
    "Saisissez l'adresse e-mail associée à votre compte pour recevoir un lien de réinitialisation.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthRedirectGate />
      <ForgotPasswordForm />
    </>
  );
}
