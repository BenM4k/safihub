import Link from "next/link";
import { Sparkles } from "lucide-react";

/**
 * Lightweight header shell rendered inside the RootLayout Suspense fallback
 * so the brand bar is immediately visible on first byte before cookie-based
 * locale and session providers resolve.
 */
export function RootShellFallback() {
  return (
    <div
      data-testid="root-shell-fallback"
      className="flex min-h-screen flex-col bg-background text-foreground"
    >
      <header className="sticky top-0 left-0 right-0 z-50 w-full bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-slate-200/90 dark:border-border shadow-2xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="text-primary flex items-center justify-center">
              <Sparkles className="size-6 text-primary fill-primary" />
            </div>
            <span className="font-display font-black text-2xl tracking-tight text-heading">
              SafiHub<span className="text-primary">.</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-2 bg-slate-100/70 dark:bg-white/5 rounded-full px-4 py-2">
            <div className="h-3.5 w-14 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse" />
            <div className="h-3.5 w-16 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse" />
            <div className="h-3.5 w-24 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-24 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse" />
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </main>
    </div>
  );
}

