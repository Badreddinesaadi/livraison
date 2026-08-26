import { create } from "zustand";

export type RvtOption = {
  id: string;
  label: string;
  subLabel?: string;
};

type SheetType =
  | "rvt-select"
  | "rvt-multi"
  | "rvt-visit-delete-confirm"
  | null;

type SelectConfig = {
  title: string;
  options: RvtOption[];
  selectedId?: string;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  onSelect: (id: string) => void;
};

type MultiSelectConfig = {
  title: string;
  items: RvtOption[];
  getSelectedIds: () => string[];
  enableSearch?: boolean;
  searchPlaceholder?: string;
  onToggle: (id: string) => void;
  onConfirm: () => void;
};

type VisitDeleteHandler = (visitId: string) => void;

type RvtSheetState = {
  sheetType: SheetType;
  selectConfig: SelectConfig | null;
  multiSelectConfig: MultiSelectConfig | null;
  selectionTick: number;
  visitDeleteId: string | null;
  visitDeleteHandler: VisitDeleteHandler | null;
  isVisitDeletePending: boolean;
  isSheetOpen: boolean;

  openSelect: (config: SelectConfig) => void;
  chooseSelectOption: (id: string) => void;
  openMultiSelect: (config: MultiSelectConfig) => void;
  toggleMultiSelectOption: (id: string) => void;
  confirmMultiSelect: () => void;
  openVisitDeleteConfirm: (visitId: string, handler: VisitDeleteHandler) => void;
  confirmVisitDelete: () => void;
  finishVisitDelete: () => void;
  closeSheet: () => void;
};

export const useRvtSheetStore = create<RvtSheetState>((set, get) => ({
  sheetType: null,
  selectConfig: null,
  multiSelectConfig: null,
  selectionTick: 0,
  visitDeleteId: null,
  visitDeleteHandler: null,
  isVisitDeletePending: false,
  isSheetOpen: false,

  openSelect: (config) =>
    set({
      sheetType: "rvt-select",
      selectConfig: config,
      multiSelectConfig: null,
      visitDeleteId: null,
      visitDeleteHandler: null,
      isVisitDeletePending: false,
      isSheetOpen: true,
    }),
  chooseSelectOption: (id) =>
    set((state) => {
      state.selectConfig?.onSelect(id);
      if (get().sheetType !== "rvt-select") return {};
      return { isSheetOpen: false };
    }),
  openMultiSelect: (config) =>
    set({
      sheetType: "rvt-multi",
      multiSelectConfig: config,
      selectConfig: null,
      visitDeleteId: null,
      visitDeleteHandler: null,
      isVisitDeletePending: false,
      selectionTick: 0,
      isSheetOpen: true,
    }),
  toggleMultiSelectOption: (id) => {
    const config = get().multiSelectConfig;
    if (!config) return;
    config.onToggle(id);
    set({ selectionTick: get().selectionTick + 1 });
  },
  confirmMultiSelect: () => {
    const config = get().multiSelectConfig;
    if (!config) return;
    config.onConfirm();
    if (get().sheetType === "rvt-multi") {
      set({ isSheetOpen: false });
    }
  },
  openVisitDeleteConfirm: (visitId, handler) =>
    set({
      sheetType: "rvt-visit-delete-confirm",
      visitDeleteId: visitId,
      visitDeleteHandler: handler,
      selectConfig: null,
      multiSelectConfig: null,
      isVisitDeletePending: false,
      isSheetOpen: true,
    }),
  confirmVisitDelete: () =>
    set((state) => {
      if (
        state.isVisitDeletePending ||
        state.visitDeleteId === null ||
        !state.visitDeleteHandler
      ) {
        return state;
      }
      state.visitDeleteHandler(state.visitDeleteId);
      return { isVisitDeletePending: true, isSheetOpen: false };
    }),
  finishVisitDelete: () =>
    set({
      isVisitDeletePending: false,
      visitDeleteId: null,
      visitDeleteHandler: null,
    }),
  closeSheet: () => set({ isSheetOpen: false }),
}));
