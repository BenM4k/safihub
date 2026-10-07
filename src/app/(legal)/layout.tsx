import { Navbar } from "@/components/home/header/navbar";
import { Footer } from "@/components/home/footer/footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-foreground selection:bg-primary-soft selection:text-primary">
      <Navbar variant="solid" />
      <main className="flex-1">
        <div className="container-page max-w-4xl py-12 sm:py-20 lg:py-24">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
