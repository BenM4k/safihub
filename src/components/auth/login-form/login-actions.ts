export interface LoginFormState {
  errors?: {
    email?: string;
  };
  values?: {
    email: string;
  };
  success?: boolean;
}

export const initialLoginState: LoginFormState = {
  errors: undefined,
  values: { email: "" },
  success: false,
};

/**
 * UI-only validation action for login screen (no auth logic yet).
 */
export async function handleLoginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = (formData.get("email") as string)?.trim() ?? "";

  const errors: { email?: string } = {};

  if (!email) {
    errors.email = "Required field";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values: { email },
      success: false,
    };
  }

  // Placeholder for future auth logic
  return {
    errors: undefined,
    values: { email },
    success: true,
  };
}
