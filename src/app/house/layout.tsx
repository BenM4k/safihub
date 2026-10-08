import { ReactNode } from "react";
import { guardHouseRoute } from "@/services/auth";

export default async function HouseLayout({
  children,
}: {
  children: ReactNode;
}) {
  await guardHouseRoute();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
