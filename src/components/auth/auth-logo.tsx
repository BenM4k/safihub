import Link from "next/link";
import { BrandLogoMark } from "@/components/common/brand-logo";

/**
 * Brand logo for auth screens matching reference Legitify-style layout.
 */
export function AuthLogo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity"
    >
      <BrandLogoMark size="md" />
      <span className="font-display font-black text-2xl tracking-tight text-heading">
        Safi<span className="text-primary">Hub</span>
      </span>
    </Link>
  );
}
