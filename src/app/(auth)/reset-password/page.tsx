import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form/reset-password-form";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Nouveau Mot de Passe",
  description:
    "Choisissez un nouveau mot de passe sécurisé pour votre compte SafiHub.",
  noIndex: true,
});

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
