"use client";

import { useActionState, useState } from "react";
import { RegisterHeader } from "./register-header";
import { NameFields } from "./name-fields";
import { ContactFields } from "./contact-fields";
import { PasswordField } from "./password-field";
import { ConfirmPasswordField } from "./confirm-password-field";
import { ConsentField } from "./consent-field";
import { RegisterSubmitButton } from "./register-submit-button";
import { RegisterSwitch } from "./register-switch";
import { registerAction, initialAuthState } from "@/actions/auth.actions";

export function RegisterForm() {
  const [state, formAction] = useActionState(
    registerAction,
    initialAuthState
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      <RegisterHeader />

      {state.errors?.form && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium"
        >
          {state.errors.form}
        </div>
      )}

      <form action={formAction} noValidate className="space-y-4">
        {/* First & Last name grid */}
        <NameFields
          errors={state.errors}
        />

        {/* Email & Phone number */}
        <ContactFields
          errors={state.errors}
        />

        {/* Password with live 5-criteria checklist */}
        <PasswordField
          value={password}
          onChange={setPassword}
          error={state.errors?.password}
        />

        {/* Retype password */}
        <ConfirmPasswordField
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={state.errors?.confirmPassword}
        />

        {/* Mandatory legal consent */}
        <ConsentField
          error={state.errors?.consent}
        />

        {/* Submit Continue button */}
        <div className="pt-2">
          <RegisterSubmitButton />
        </div>
      </form>

      <RegisterSwitch />
    </div>
  );
}
