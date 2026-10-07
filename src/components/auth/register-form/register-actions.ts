export interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
}

export interface RegisterFormState {
  errors?: RegisterFormErrors;
  values?: RegisterFormValues;
  success?: boolean;
}

export const initialRegisterState: RegisterFormState = {
  errors: undefined,
  values: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  },
  success: false,
};

/**
 * UI-only validation action for registration form matching form-errors.png.
 * Does not invoke backend/auth logic yet as instructed.
 */
export async function handleRegisterAction(
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const firstName = (formData.get("firstName") as string)?.trim() ?? "";
  const lastName = (formData.get("lastName") as string)?.trim() ?? "";
  const email = (formData.get("email") as string)?.trim() ?? "";
  const phone = (formData.get("phone") as string)?.trim() ?? "";
  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

  const errors: RegisterFormErrors = {};

  if (!firstName) errors.firstName = "Required field";
  if (!lastName) errors.lastName = "Required field";
  if (!email) {
    errors.email = "Required field";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!phone) {
    errors.phone = "Required field";
  }

  if (!password) {
    errors.password = "Required field";
  } else {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasLength = password.length >= 8;

    if (!hasLower || !hasUpper || !hasNumber || !hasSpecial || !hasLength) {
      errors.password = "Password does not meet all criteria";
    }
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm Password is required";
  } else if (password && confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values: { firstName, lastName, email, phone },
      success: false,
    };
  }

  // Placeholder for future auth registration logic
  return {
    errors: undefined,
    values: { firstName, lastName, email, phone },
    success: true,
  };
}
