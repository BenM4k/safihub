import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form/register-form";
import { redirectIfAuthenticated } from "@/services/auth";

export const metadata: Metadata = {
  title: "Créer un compte | SafiHub",
  description:
    "Créez votre compte SafiHub pour commander votre pressing à domicile à Bukavu.",
};

export default async function SignUpPage() {
  await redirectIfAuthenticated();
  return <RegisterForm />;
}
