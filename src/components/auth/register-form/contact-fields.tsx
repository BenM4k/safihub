import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactFieldsProps {
  emailDefault?: string;
  phoneDefault?: string;
  errors?: {
    email?: string;
    phone?: string;
  };
}

export function ContactFields({
  emailDefault = "",
  phoneDefault = "",
  errors,
}: ContactFieldsProps) {
  return (
    <div className="space-y-3.5">
      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="register-email" className="text-xs sm:text-sm font-semibold">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="register-email"
          name="email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          defaultValue={emailDefault}
          hasError={Boolean(errors?.email)}
          aria-describedby={errors?.email ? "email-error" : undefined}
        />
        {errors?.email && (
          <p id="email-error" className="text-xs font-medium text-red-500">
            {errors.email}
          </p>
        )}
      </div>

      {/* Phone number */}
      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold">
          Phone number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Enter your phone number (ex: +243 999 000 123)"
          autoComplete="tel"
          defaultValue={phoneDefault}
          hasError={Boolean(errors?.phone)}
          aria-describedby={errors?.phone ? "phone-error" : undefined}
        />
        {errors?.phone && (
          <p id="phone-error" className="text-xs font-medium text-red-500">
            {errors.phone}
          </p>
        )}
      </div>
    </div>
  );
}
