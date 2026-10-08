import { getAdminDispatchData } from "@/services/admin";
import { DispatchAwaitingList } from "@/components/admin/dispatch/dispatch-awaiting-list";
import { DispatchMissionsList } from "@/components/admin/dispatch/dispatch-missions-list";

export default async function AdminDispatchPage() {
  const res = await getAdminDispatchData();

  if (!res.ok) {
    return (
      <div className="p-8 text-center text-sm text-[#D92D20]">
        Erreur lors du chargement des données de dispatch: {res.error}
      </div>
    );
  }

  const { ordersAwaitingAcceptance, unassignedMissions, allCouriers } = res.value;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EAECF0] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#101828]">
            Écran de Dispatch Opérationnel
          </h1>
          <p className="text-sm text-[#667085] mt-1">
            Affectation des missions de collecte et relance directe des pressings partenaires
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-[#EAECF0] bg-white shadow-sm">
          <p className="text-xs font-semibold text-[#667085] uppercase">En attente d&apos;acceptation</p>
          <p className="text-2xl font-bold text-[#101828] mt-1">
            {ordersAwaitingAcceptance.length}
          </p>
          <p className="text-xs text-[#B54708] mt-0.5">Relance téléphonique nécessaire</p>
        </div>

        <div className="p-4 rounded-xl border border-[#EAECF0] bg-white shadow-sm">
          <p className="text-xs font-semibold text-[#667085] uppercase">Missions à assigner</p>
          <p className="text-2xl font-bold text-[#101828] mt-1">
            {unassignedMissions.length}
          </p>
          <p className="text-xs text-[#2824D5] mt-0.5">Collectes et livraisons non affectées</p>
        </div>

        <div className="p-4 rounded-xl border border-[#EAECF0] bg-white shadow-sm">
          <p className="text-xs font-semibold text-[#667085] uppercase">Coursiers sur la flotte</p>
          <p className="text-2xl font-bold text-[#101828] mt-1">
            {allCouriers.length}
          </p>
          <p className="text-xs text-[#027A48] mt-0.5">Coursiers enregistrés au total</p>
        </div>
      </div>

      {/* Two main dispatch sections */}
      <div className="space-y-6">
        <DispatchAwaitingList orders={ordersAwaitingAcceptance} />
        <DispatchMissionsList missions={unassignedMissions} />
      </div>
    </div>
  );
}
