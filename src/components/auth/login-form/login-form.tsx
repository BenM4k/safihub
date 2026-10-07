"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginHeader } from "./login-header";
import { LoginSubmitButton } from "./login-submit-button";
import { SocialButtons } from "./social-buttons";
import { LoginSwitch } from "./login-switch";
import { handleLoginAction, initialLoginState } from "./login-actions";

export function LoginForm() {
  const [state, formAction] = useActionState(
    handleLoginAction,
    initialLoginState
  );

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      <LoginHeader />

      <form action={formAction} noValidate className="space-y-4">
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            defaultValue={state.values?.email}
            hasError={Boolean(state.errors?.email)}
            aria-describedby={state.errors?.email ? "email-error" : undefined}
          />
          {state.errors?.email && (
            <p id="email-error" className="text-xs font-medium text-red-500 mt-1">
              {state.errors.email}
            </p>
          )}
        </div>

        {/* Primary CTA */}
        <div className="pt-1">
          <LoginSubmitButton />
        </div>

        {/* Social auth alternative */}
        <div className="pt-2">
          <SocialButtons />
        </div>
      </form>

      <LoginSwitch />
    </div>
  );
}
