import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form/register-form";
import { AuthRedirectGate } from "@/components/auth/auth-redirect-gate";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Inscription",
  description:
    "Créez votre compte SafiHub pour commander votre pressing à domicile à Bukavu.",
  noIndex: true,
});

export default function SignUpPage() {
  return (
    <>
      <AuthRedirectGate />
      <RegisterForm />
    </>
  );
}
