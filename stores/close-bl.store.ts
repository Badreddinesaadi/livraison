import { BLItem } from "@/api/voyage.api";
import { create } from "zustand";

type CloseBLMode = "all" | "single" | null;

type CloseBLState = {
  voyageId: number | null;
  bls: BLItem[];
  isSheetOpen: boolean;
  mode: CloseBLMode;
  selectedBL: BLItem | null;
  setContext: (voyageId: number, bls: BLItem[]) => void;
  openSheet: () => void;
  closeSheet: () => void;
  selectAll: () => void;
  selectBL: (bl: BLItem) => void;
  reset: () => void;
};

export const useCloseBLStore = create<CloseBLState>((set) => ({
  voyageId: null,
  bls: [],
  isSheetOpen: false,
  mode: null,
  selectedBL: null,
  setContext: (voyageId: number, bls: BLItem[]) =>
    set({ voyageId, bls, mode: null, selectedBL: null }),
  openSheet: () => set({ isSheetOpen: true }),
  closeSheet: () => set({ isSheetOpen: false }),
  selectAll: () => set({ mode: "all", selectedBL: null }),
  selectBL: (bl: BLItem) => set({ mode: "single", selectedBL: bl }),
  reset: () =>
    set({
      voyageId: null,
      bls: [],
      isSheetOpen: false,
      mode: null,
      selectedBL: null,
    }),
}));
