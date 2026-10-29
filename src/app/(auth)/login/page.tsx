import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form/login-form";
import { AuthRedirectGate } from "@/components/auth/auth-redirect-gate";

export const metadata: Metadata = {
  title: "Connexion | SafiHub",
  description:
    "Connectez-vous à votre compte SafiHub pour gérer vos commandes de pressing et blanchisserie à Bukavu.",
};

export default function LoginPage() {
  return (
    <>
      <AuthRedirectGate />
      <LoginForm />
    </>
  );
}
