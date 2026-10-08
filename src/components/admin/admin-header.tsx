import Link from "next/link";
import { ShieldCheck } from "lucide-react";
export async function AdminHeader() {
  return (
    <header className="w-full bg-white border-b border-border shadow-xs sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 font-display font-bold text-lg text-heading tracking-tight"
          >
            <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center font-black text-sm">
              S
            </div>
            <span>SafiHub Admin</span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="size-3.5" />
            <span>Admin Clearance</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xs font-semibold text-muted-foreground hover:text-heading px-3 py-1.5 rounded-md hover:bg-slate-50 transition"
          >
            ← Retour au site
          </Link>
        </div>
      </div>
    </header>
  );
}
