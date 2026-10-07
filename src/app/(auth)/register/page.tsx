import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form/register-form";

export const metadata: Metadata = {
  title: "Créer un compte | SafiHub",
  description:
    "Créez votre compte SafiHub pour commander votre pressing à domicile à Bukavu.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
