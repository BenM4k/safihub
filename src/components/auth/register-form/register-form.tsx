"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterHeader } from "./register-header";
import { NameFields } from "./name-fields";
import { ContactFields } from "./contact-fields";
import { PasswordField } from "./password-field";
import { ConfirmPasswordField } from "./confirm-password-field";
import { ConsentField } from "./consent-field";
import { RegisterSubmitButton } from "./register-submit-button";
import { RegisterSwitch } from "./register-switch";
import { registerAction } from "@/actions/auth.actions";
import {
  getRegisterSchema,
  initialAuthState,
  type RegisterFormValues,
} from "@/lib/validations/auth.schema";

export function RegisterForm() {
  const t = useTranslations("auth");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const schema = getRegisterSchema((k) => t(k as Parameters<typeof t>[0]));

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      consent: false,
    },
    mode: "onSubmit",
  });

  const onSubmit = (data: RegisterFormValues) => {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);
      formData.append("consent", data.consent ? "true" : "false");

      const res = await registerAction(initialAuthState, formData);
      if (!res.success && res.errors) {
        if (res.errors.form) {
          setServerError(res.errors.form);
        }
        if (res.errors.firstName) {
          setError("firstName", { message: res.errors.firstName });
        }
        if (res.errors.lastName) {
          setError("lastName", { message: res.errors.lastName });
        }
        if (res.errors.email) {
          setError("email", { message: res.errors.email });
        }
        if (res.errors.phone) {
          setError("phone", { message: res.errors.phone });
        }
        if (res.errors.password) {
          setError("password", { message: res.errors.password });
        }
        if (res.errors.confirmPassword) {
          setError("confirmPassword", { message: res.errors.confirmPassword });
        }
        if (res.errors.consent) {
          setError("consent", { message: res.errors.consent });
        }
      }
    });
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      <RegisterHeader />

      {serverError && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium"
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* First & Last name grid */}
        <NameFields register={register} errors={errors} />

        {/* Email & Phone number */}
        <ContactFields register={register} errors={errors} />

        {/* Password with live 5-criteria checklist */}
        <PasswordField
          control={control}
          registration={register("password")}
          error={errors.password?.message}
        />

        {/* Retype password */}
        <ConfirmPasswordField
          registration={register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        {/* Mandatory legal consent and photo consent */}
        <ConsentField
          registration={register("consent")}
          photoRegistration={register("photoConsent")}
          error={errors.consent?.message}
        />

        {/* Submit Continue button */}
        <div className="pt-2">
          <RegisterSubmitButton isPending={isPending} />
        </div>
      </form>

      <RegisterSwitch />
    </div>
  );
}
