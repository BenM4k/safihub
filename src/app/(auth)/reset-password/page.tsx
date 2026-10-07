import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form/reset-password-form";

export const metadata: Metadata = {
  title: "Nouveau mot de passe | SafiHub",
  description:
    "Définissez un nouveau mot de passe pour accéder à votre compte SafiHub.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
