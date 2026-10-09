import { guardCourierRoute } from "@/services/auth";
import { getCourierAssignedMissionsService } from "@/services/courier";
import { MissionListView } from "@/components/courier/mission-list-view";

export default async function CourierPage() {
  const auth = await guardCourierRoute();

  const missionsRes = await getCourierAssignedMissionsService(auth.user.id);
  const initialMissions = missionsRes.ok ? missionsRes.value : [];

  return <MissionListView initialMissions={initialMissions} />;
}
