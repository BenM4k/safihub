import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form/reset-password-form";

export const metadata: Metadata = {
  title: "Nouveau mot de passe | SafiHub",
  description:
    "Choisissez un nouveau mot de passe sécurisé pour votre compte SafiHub.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
