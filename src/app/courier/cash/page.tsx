import { guardCourierRoute } from "@/services/auth";
import { getCourierCashService } from "@/services/courier";
import { CashOverviewCard } from "@/components/courier/cash-overview-card";

export default async function CourierCashPage() {
  const auth = await guardCourierRoute();

  const cashRes = await getCourierCashService(auth.user.id);
  if (!cashRes.ok) {
    throw new Error(cashRes.error);
  }

  return <CashOverviewCard data={cashRes.value} />;
}
