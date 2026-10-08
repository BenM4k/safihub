import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form/forgot-password-form";
import { redirectIfAuthenticated } from "@/services/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return {
    title: `${t("forgotPasswordTitle")} | SafiHub`,
    description: t("forgotPasswordSubtitle"),
  };
}

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated();
  return <ForgotPasswordForm />;
}
