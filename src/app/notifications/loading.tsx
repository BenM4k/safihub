import { NotificationsSkeleton } from "@/components/notifications/notifications-skeleton";

export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="h-18 border-b border-slate-200/80 bg-white" />
      <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <NotificationsSkeleton />
      </main>
    </div>
  );
}
