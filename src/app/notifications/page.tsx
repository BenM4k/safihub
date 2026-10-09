import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getUserInbox } from "@/services/notifications";
import { NotificationsView } from "@/components/notifications/notifications-view";
import { Navbar } from "@/components/home/header/navbar";
import { Footer } from "@/components/home/footer";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/notifications");
  }

  const inboxRes = await getUserInbox(user.id, 50, 0);
  const items = inboxRes.ok ? inboxRes.value.items : [];
  const unreadCount = inboxRes.ok ? inboxRes.value.unreadCount : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar variant="solid" user={user} />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <NotificationsView
          initialItems={items}
          initialUnreadCount={unreadCount}
        />
      </main>
      <Footer />
    </div>
  );
}
