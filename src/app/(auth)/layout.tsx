import { AuthLogo } from "@/components/auth/auth-logo";
import { AuthSidebar } from "@/components/auth/auth-sidebar";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen w-full bg-white grid grid-cols-1 lg:grid-cols-2">
      {/* Left Column: Navigation, Form, Copyright */}
      <div className="flex flex-col justify-between min-h-screen p-6 sm:p-10 lg:p-12 xl:p-14">
        {/* Brand header */}
        <header className="w-full">
          <AuthLogo />
        </header>

        {/* Dynamic Auth View */}
        <main className="w-full flex-1 flex flex-col justify-center py-8">
          {children}
        </main>

        {/* Legal copyright footer */}
        <footer className="w-full text-xs text-muted-foreground pt-4">
          <p>© SafiHub 2026. All rights reserved.</p>
        </footer>
      </div>

      {/* Right Column: Visual Showcase Frame */}
      <AuthSidebar />
    </div>
  );
}
