import Link from "next/link";
import { Sparkles } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  variant?: "transparent" | "solid";
}

export function Navbar({ variant = "transparent" }: NavbarProps = {}) {
  const isSolid = variant === "solid";

  return (
    <header
      className={
        isSolid
          ? "sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs transition-all pointer-events-auto"
          : "fixed top-0 left-0 right-0 z-50 w-full bg-transparent transition-all pointer-events-none"
      }
    >
      <div className="container-page flex h-20 items-center justify-between gap-4 pointer-events-auto">
        {/* Brand logo: star/asterisk mark + SafiHub. */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="text-primary flex items-center justify-center">
            <Sparkles className="size-6 text-primary fill-primary" />
          </div>
          <span className="font-display font-black text-2xl tracking-tight text-heading">
            SafiHub<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Center Pill Segmented Nav (matching reference exactly) */}
        <nav className="hidden md:flex items-center bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-xs rounded-full px-2 py-1 text-xs sm:text-sm font-semibold text-foreground">
          <Link
            href="/#catalogue"
            className="px-4 py-1.5 rounded-full text-heading hover:text-primary transition-colors"
          >
            Particuliers
          </Link>
          <Link
            href="/#services"
            className="px-4 py-1.5 rounded-full text-heading hover:text-primary transition-colors"
          >
            Entreprises
          </Link>
          <Link
            href="/house"
            className="px-4 py-1.5 rounded-full text-heading hover:text-primary transition-colors"
          >
            Pressings
          </Link>
        </nav>

        {/* Right actions: Log In link + Black Sign up pill button */}
        <div className="hidden sm:flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm font-semibold text-heading hover:text-primary transition-colors"
          >
            Log In
          </Link>
          <Button asChild variant="contrast" size="pill-sm" className="shadow-xs">
            <Link href="/#catalogue">Commander</Link>
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-3">
          <Button asChild variant="contrast" size="sm" className="rounded-full text-xs font-semibold px-3.5">
            <Link href="/#catalogue">Commander</Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
