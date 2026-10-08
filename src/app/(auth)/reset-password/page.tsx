import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "@/components/auth/reset-password-form/reset-password-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return {
    title: `${t("resetPasswordTitle")} | SafiHub`,
    description: t("resetPasswordSubtitle"),
  };
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
