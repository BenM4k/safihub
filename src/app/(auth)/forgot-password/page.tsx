import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form/forgot-password-form";

export const metadata: Metadata = {
  title: "Mot de passe oublié | SafiHub",
  description:
    "Réinitialisez votre mot de passe pour accéder à votre compte SafiHub.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
