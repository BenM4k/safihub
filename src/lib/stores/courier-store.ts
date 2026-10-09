"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/offline/idb-storage";
import type {
  CourierAssignedMissionSummary,
  CourierMissionDetail,
} from "@/dal";
import type {
  QueuedCourierAction,
  ActionSyncResult,
} from "@/services/courier";
import { syncOfflineCourierActionsAction } from "@/actions/courier.actions";

export interface ConflictItem {
  actionId: string;
  action: QueuedCourierAction;
  message: string;
}

export interface CourierStoreState {
  isOnline: boolean;
  missions: CourierAssignedMissionSummary[];
  missionDetails: Record<string, CourierMissionDetail>;
  queue: QueuedCourierAction[];
  syncStatus: "idle" | "syncing" | "synced" | "has_conflicts";
  conflicts: ConflictItem[];

  setOnline: (isOnline: boolean) => void;
  setMissions: (missions: CourierAssignedMissionSummary[]) => void;
  setMissionDetail: (detail: CourierMissionDetail) => void;
  enqueueAction: (
    action: Omit<QueuedCourierAction, "id" | "timestamp">
  ) => QueuedCourierAction;
  dismissConflict: (actionId: string) => void;
  clearResolvedConflicts: () => void;
  syncQueue: () => Promise<{ success: boolean; results?: ActionSyncResult[] }>;
}

export const useCourierStore = create<CourierStoreState>()(
  persist(
    (set, get) => ({
      isOnline: typeof window !== "undefined" ? navigator.onLine : true,
      missions: [],
      missionDetails: {},
      queue: [],
      syncStatus: "idle",
      conflicts: [],

      setOnline: (isOnline) => {
        set({ isOnline });
        if (isOnline && get().queue.length > 0) {
          get().syncQueue();
        }
      },

      setMissions: (missions) => set({ missions }),

      setMissionDetail: (detail) =>
        set((state) => ({
          missionDetails: {
            ...state.missionDetails,
            [detail.mission.id]: detail,
          },
        })),

      enqueueAction: (actionData) => {
        const id =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `offline_act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        const queuedAction: QueuedCourierAction = {
          ...actionData,
          id,
          timestamp: Date.now(),
        };

        // Optimistically apply update to cached missions
        const state = get();
        const updatedMissions = state.missions.map((m) => {
          if (m.id !== queuedAction.missionId) return m;

          switch (queuedAction.type) {
            case "accept_mission":
              return { ...m, status: "accepted" as const };
            case "start_pickup":
            case "start_delivery":
              return { ...m, status: "in_progress" as const };
            case "complete_pickup":
            case "complete_delivery":
              return {
                ...m,
                status: "completed" as const,
                cashCollected:
                  queuedAction.type === "complete_delivery"
                    ? Number(queuedAction.payload.cashCollected || m.cashCollected)
                    : m.cashCollected,
              };
            case "fail_pickup":
            case "fail_delivery":
              return { ...m, status: "failed" as const };
            default:
              return m;
          }
        });

        // Also update cached mission details if present
        const currentDetail = state.missionDetails[queuedAction.missionId];
        let updatedDetails = state.missionDetails;

        if (currentDetail) {
          const updatedMission = updatedMissions.find(
            (m) => m.id === queuedAction.missionId
          ) || currentDetail.mission;

          updatedDetails = {
            ...state.missionDetails,
            [queuedAction.missionId]: {
              ...currentDetail,
              mission: updatedMission,
            },
          };
        }

        set({
          queue: [...state.queue, queuedAction],
          missions: updatedMissions,
          missionDetails: updatedDetails,
          syncStatus: "idle",
        });

        // If online, immediately attempt synchronization
        if (state.isOnline) {
          setTimeout(() => {
            get().syncQueue();
          }, 50);
        }

        return queuedAction;
      },

      dismissConflict: (actionId) =>
        set((state) => ({
          conflicts: state.conflicts.filter((c) => c.actionId !== actionId),
          syncStatus:
            state.conflicts.length <= 1
              ? state.queue.length > 0
                ? "idle"
                : "synced"
              : "has_conflicts",
        })),

      clearResolvedConflicts: () =>
        set((state) => ({
          conflicts: [],
          syncStatus: state.queue.length > 0 ? "idle" : "synced",
        })),

      syncQueue: async () => {
        const { queue, isOnline } = get();
        if (queue.length === 0) {
          set({ syncStatus: "synced" });
          return { success: true };
        }

        if (!isOnline) {
          return { success: false };
        }

        set({ syncStatus: "syncing" });

        try {
          const res = await syncOfflineCourierActionsAction(queue);
          if (!res.ok) {
            set({ syncStatus: "idle" });
            return { success: false };
          }

          const { results } = res.value;
          const successfulActionIds = new Set(
            results
              .filter((r) => r.status === "applied" || r.status === "duplicate")
              .map((r) => r.actionId)
          );

          const remainingQueue: QueuedCourierAction[] = [];
          const newConflicts: ConflictItem[] = [];

          for (const action of queue) {
            if (successfulActionIds.has(action.id)) {
              // Successfully synced or duplicate, safe to drop from queue
              continue;
            }

            const rejectedResult = results.find(
              (r) => r.actionId === action.id && r.status === "rejected"
            );

            if (rejectedResult) {
              newConflicts.push({
                actionId: action.id,
                action,
                message: rejectedResult.message || "Action rejetée par le serveur",
              });
            } else {
              remainingQueue.push(action);
            }
          }

          set((state) => ({
            queue: remainingQueue,
            conflicts: [...state.conflicts, ...newConflicts],
            syncStatus:
              newConflicts.length > 0
                ? "has_conflicts"
                : remainingQueue.length > 0
                ? "idle"
                : "synced",
          }));

          return { success: newConflicts.length === 0, results };
        } catch {
          set({ syncStatus: "idle" });
          return { success: false };
        }
      },
    }),
    {
      name: "safihub-courier-store",
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        missions: state.missions,
        missionDetails: state.missionDetails,
        queue: state.queue,
        conflicts: state.conflicts,
      }),
    }
  )
);
