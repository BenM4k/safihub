import { ReactNode } from "react";
import { guardCourierRoute } from "@/services/auth";

export default async function CourierLayout({
  children,
}: {
  children: ReactNode;
}) {
  await guardCourierRoute();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
