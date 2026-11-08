import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Vérification de l'Adresse E-mail",
  description: "Vérification sécurisée de votre compte SafiHub.",
  noIndex: true,
});

interface VerifyEmailPageProps {
  searchParams: Promise<{
    token?: string;
    callbackURL?: string;
    error?: string;
  }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;

  if (params.error) {
    redirect(`/login?error=${encodeURIComponent(params.error)}`);
  }

  if (!params.token) {
    redirect("/login?error=invalid_token");
  }

  const targetCallback = params.callbackURL || "/login?verified=true";
  const authEndpoint = `/api/auth/verify-email?token=${encodeURIComponent(
    params.token
  )}&callbackURL=${encodeURIComponent(targetCallback)}`;

  redirect(authEndpoint);
}

