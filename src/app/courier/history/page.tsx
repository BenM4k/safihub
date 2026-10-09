import { guardCourierRoute } from "@/services/auth";
import { getCourierHistoryService } from "@/services/courier";
import { HistoryListView } from "@/components/courier/history-list-view";

export default async function CourierHistoryPage() {
  const auth = await guardCourierRoute();

  const historyRes = await getCourierHistoryService(auth.user.id);
  if (!historyRes.ok) {
    throw new Error(historyRes.error);
  }

  return <HistoryListView data={historyRes.value} />;
}
