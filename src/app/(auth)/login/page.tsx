import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form/login-form";
import { redirectIfAuthenticated } from "@/services/auth";

export const metadata: Metadata = {
  title: "Connexion | SafiHub",
  description:
    "Connectez-vous à votre compte SafiHub pour gérer vos commandes de pressing et blanchisserie à Bukavu.",
};

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return <LoginForm />;
}
