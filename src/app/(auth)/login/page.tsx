import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form/login-form";
import { AuthRedirectGate } from "@/components/auth/auth-redirect-gate";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Connexion à votre Compte",
  description:
    "Connectez-vous à votre compte SafiHub pour gérer vos commandes de pressing et blanchisserie à Bukavu.",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <>
      <AuthRedirectGate />
      <LoginForm />
    </>
  );
}
