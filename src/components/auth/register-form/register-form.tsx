"use client";

import { useActionState, useState } from "react";
import { RegisterHeader } from "./register-header";
import { NameFields } from "./name-fields";
import { ContactFields } from "./contact-fields";
import { PasswordField } from "./password-field";
import { ConfirmPasswordField } from "./confirm-password-field";
import { RegisterSubmitButton } from "./register-submit-button";
import { RegisterSwitch } from "./register-switch";
import {
  handleRegisterAction,
  initialRegisterState,
} from "./register-actions";

export function RegisterForm() {
  const [state, formAction] = useActionState(
    handleRegisterAction,
    initialRegisterState
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      <RegisterHeader />

      <form action={formAction} noValidate className="space-y-4">
        {/* First & Last name grid */}
        <NameFields
          firstNameDefault={state.values?.firstName}
          lastNameDefault={state.values?.lastName}
          errors={state.errors}
        />

        {/* Email & Phone number */}
        <ContactFields
          emailDefault={state.values?.email}
          phoneDefault={state.values?.phone}
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

        {/* Submit Continue button */}
        <div className="pt-2">
          <RegisterSubmitButton />
        </div>
      </form>

      <RegisterSwitch />
    </div>
  );
}
