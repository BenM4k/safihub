"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isValidLocale, DEFAULT_LOCALE, type AppLocale } from "@/i18n/config";

export async function setLocaleAction(locale: string) {
  const nextLocale: AppLocale = isValidLocale(locale) ? locale : DEFAULT_LOCALE;
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", nextLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
  return { success: true, locale: nextLocale };
}
