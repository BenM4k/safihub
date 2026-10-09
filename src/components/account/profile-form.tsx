"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { updateProfileAction, type AccountActionState } from "@/actions/customer-account.actions";
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    contactPhone: string | null;
  };
}

const initialState: AccountActionState = { success: false };

function SaveButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("account");

  return (
    <Button
      type="submit"
      variant="primary"
      size="default"
      disabled={pending}
      className="font-bold gap-2"
    >
      <Save className="size-4" />
      <span>{pending ? "..." : t("saveProfile")}</span>
    </Button>
  );
}

export function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations("account");
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <form
      action={formAction}
      className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4"
    >
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
        {t("profileTab")}
      </h3>

      {state.error && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2"
        >
          <AlertCircle className="size-4 text-rose-600 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {state.success && (
        <div
          role="status"
          className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2"
        >
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span>{t("profileSuccess")}</span>
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="profile-name" className="text-xs font-semibold text-slate-600">
          {t("nameLabel")}
        </label>
        <input
          id="profile-name"
          type="text"
          name="name"
          defaultValue={user.name}
          required
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="profile-email" className="text-xs font-semibold text-slate-600">
          {t("emailLabel")}
        </label>
        <input
          id="profile-email"
          type="email"
          disabled
          value={user.email}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="profile-phone" className="text-xs font-semibold text-slate-600">
          {t("phoneLabel")}
        </label>
        <input
          id="profile-phone"
          type="tel"
          name="contactPhone"
          defaultValue={user.contactPhone || ""}
          required
          placeholder="0991234567"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        />
      </div>

      <div className="pt-2">
        <SaveButton />
      </div>
    </form>
  );
}
