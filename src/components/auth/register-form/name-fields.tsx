import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NameFieldsProps {
  firstNameDefault?: string;
  lastNameDefault?: string;
  errors?: {
    firstName?: string;
    lastName?: string;
  };
}

export function NameFields({
  firstNameDefault = "",
  lastNameDefault = "",
  errors,
}: NameFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      {/* First Name */}
      <div className="space-y-1.5">
        <Label htmlFor="firstName" className="text-xs sm:text-sm font-semibold">
          First name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="firstName"
          name="firstName"
          type="text"
          placeholder="First name"
          autoComplete="given-name"
          defaultValue={firstNameDefault}
          hasError={Boolean(errors?.firstName)}
          aria-describedby={errors?.firstName ? "firstName-error" : undefined}
        />
        {errors?.firstName && (
          <p id="firstName-error" className="text-xs font-medium text-red-500">
            {errors.firstName}
          </p>
        )}
      </div>

      {/* Last Name */}
      <div className="space-y-1.5">
        <Label htmlFor="lastName" className="text-xs sm:text-sm font-semibold">
          Last name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="lastName"
          name="lastName"
          type="text"
          placeholder="Last name"
          autoComplete="family-name"
          defaultValue={lastNameDefault}
          hasError={Boolean(errors?.lastName)}
          aria-describedby={errors?.lastName ? "lastName-error" : undefined}
        />
        {errors?.lastName && (
          <p id="lastName-error" className="text-xs font-medium text-red-500">
            {errors.lastName}
          </p>
        )}
      </div>
    </div>
  );
}
