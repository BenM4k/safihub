import { redirect } from "next/navigation";

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

