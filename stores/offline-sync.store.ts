import { flushCloseBlQueue } from "@/services/close-bl-sync";
import { queryClient } from "@/constants/query";
import { countPendingJobs } from "@/utils/offline/db";
import { onlineManager } from "@tanstack/react-query";
import { AppState } from "react-native";
import { create } from "zustand";

type OfflineSyncState = {
  pendingCount: number;
  isSyncing: boolean;
  needsLogin: boolean;
  refreshCount: () => Promise<void>;
  syncNow: () => Promise<void>;
};

let initialized = false;

export const useOfflineSyncStore = create<OfflineSyncState>((set, get) => ({
  pendingCount: 0,
  isSyncing: false,
  needsLogin: false,
  refreshCount: async () => {
    try {
      set({ pendingCount: await countPendingJobs() });
    } catch {
      // DB not ready yet — ignore.
    }
  },
  syncNow: async () => {
    if (get().isSyncing) return;
    set({ isSyncing: true });
    try {
      const outcome = await flushCloseBlQueue();
      if (outcome.synced > 0) {
        set({ needsLogin: false });
        queryClient.invalidateQueries({ queryKey: ["voyages"] });
      }
      if (outcome.authError) {
        set({ needsLogin: true });
      }
    } finally {
      set({ isSyncing: false });
      await get().refreshCount();
    }
  },
}));

/** Wires reconnect/foreground triggers. Call once from the app root. */
export const initOfflineSync = () => {
  if (initialized) return;
  initialized = true;

  void useOfflineSyncStore.getState().refreshCount();

  onlineManager.subscribe((online) => {
    if (online) {
      void useOfflineSyncStore.getState().syncNow();
    }
  });

  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      void useOfflineSyncStore.getState().syncNow();
    }
  });
};
