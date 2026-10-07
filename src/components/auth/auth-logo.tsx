import Link from "next/link";
import { Sparkles } from "lucide-react";

/**
 * Brand logo for auth screens matching reference Legitify-style layout.
 */
export function AuthLogo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 text-heading font-extrabold text-xl tracking-tight hover:opacity-90 transition-opacity"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
        <Sparkles className="size-4.5" />
      </span>
      <span className="text-xl font-extrabold tracking-tight text-heading">
        Safi<span className="text-primary">Hub</span>
      </span>
    </Link>
  );
}
