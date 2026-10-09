"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Inbox } from "lucide-react";
import type { CourierAssignedMissionSummary } from "@/dal";
import { useCourierStore } from "@/lib/stores/courier-store";
import { acceptMissionAction } from "@/actions/courier.actions";
import { MissionCard } from "./mission-card";
import { CourierSyncBanner } from "./courier-sync-banner";
import { ConflictResolutionDialog } from "./conflict-resolution-dialog";

interface MissionListViewProps {
  initialMissions: CourierAssignedMissionSummary[];
}

export function MissionListView({ initialMissions }: MissionListViewProps) {
  const t = useTranslations("courier.missions");
  const [activeTab, setActiveTab] = useState<"all" | "pickup" | "delivery">("all");
  const [isPending, startTransition] = useTransition();
  const [showConflictsModal, setShowConflictsModal] = useState(false);

  const missions = useCourierStore((s) => s.missions);
  const setMissions = useCourierStore((s) => s.setMissions);
  const enqueueAction = useCourierStore((s) => s.enqueueAction);
  const isOnline = useCourierStore((s) => s.isOnline);

  // Sync initial server data into local Zustand/IndexedDB store
  useEffect(() => {
    const applyInitial = () => {
      setMissions(initialMissions ?? []);
    };

    if (useCourierStore.persist?.hasHydrated?.()) {
      applyInitial();
    }

    const unsub = useCourierStore.persist?.onFinishHydration?.(() => {
      applyInitial();
    });

    return () => {
      unsub?.();
    };
  }, [initialMissions, setMissions]);

  const displayMissions = missions.length > 0 ? missions : initialMissions;

  const pickupsCount = displayMissions.filter((m) => m.type === "pickup").length;
  const deliveriesCount = displayMissions.filter((m) => m.type === "delivery").length;

  const filteredMissions = displayMissions.filter((m) => {
    if (activeTab === "pickup") return m.type === "pickup";
    if (activeTab === "delivery") return m.type === "delivery";
    return true;
  });

  const handleAcceptMission = (missionId: string) => {
    startTransition(async () => {
      if (!isOnline) {
        // Enqueue offline action
        enqueueAction({
          type: "accept_mission",
          missionId,
          payload: {},
        });
        return;
      }

      // Online: call server action
      const res = await acceptMissionAction(missionId);
      if (res.ok) {
        const updated = displayMissions.map((m) =>
          m.id === missionId ? { ...m, status: "accepted" as const } : m
        );
        setMissions(updated);
      }
    });
  };

  return (
    <div className="space-y-4 pb-20">
      <CourierSyncBanner onOpenConflicts={() => setShowConflictsModal(true)} />

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
            activeTab === "all"
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {t("tabAll", { count: displayMissions.length })}
        </button>
        <button
          onClick={() => setActiveTab("pickup")}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
            activeTab === "pickup"
              ? "bg-white text-purple-700 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {t("tabPickups", { count: pickupsCount })}
        </button>
        <button
          onClick={() => setActiveTab("delivery")}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
            activeTab === "delivery"
              ? "bg-white text-blue-700 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {t("tabDeliveries", { count: deliveriesCount })}
        </button>
      </div>

      {/* Mission Cards List */}
      {filteredMissions.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
          <div className="size-12 rounded-full bg-slate-50 text-slate-400 mx-auto flex items-center justify-center">
            <Inbox className="size-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            {t("noMissions")}
          </p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {t("noMissionsSub")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onAccept={handleAcceptMission}
              isAccepting={isPending}
            />
          ))}
        </div>
      )}

      <ConflictResolutionDialog
        isOpen={showConflictsModal}
        onClose={() => setShowConflictsModal(false)}
      />
    </div>
  );
}
