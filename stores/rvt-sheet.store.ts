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
  | "rvt-round-edit"
  | "rvt-round-delete-confirm"
  | "rvt-round-toggle-confirm"
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

type RoundEditConfig = {
  roundId: string;
  nom: string;
  startedAt: Date;
  onConfirm: (nom: string, startedAt: Date) => void;
};

type RoundDeleteConfig = {
  roundId: string;
  nom: string | null;
  onConfirm: () => void;
};

type RoundToggleConfig = {
  roundId: string;
  nom: string | null;
  isOpen: boolean;
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
  roundEditConfig: RoundEditConfig | null;
  roundDeleteConfig: RoundDeleteConfig | null;
  roundToggleConfig: RoundToggleConfig | null;
  isRoundDeletePending: boolean;
  isSheetOpen: boolean;

  openSelect: (config: SelectConfig) => void;
  chooseSelectOption: (id: string) => void;
  openMultiSelect: (config: MultiSelectConfig) => void;
  toggleMultiSelectOption: (id: string) => void;
  confirmMultiSelect: () => void;
  openVisitDeleteConfirm: (visitId: string, handler: VisitDeleteHandler) => void;
  confirmVisitDelete: () => void;
  finishVisitDelete: () => void;
  openRoundEdit: (config: RoundEditConfig) => void;
  updateRoundEditDraft: (patch: { nom?: string; startedAt?: Date }) => void;
  confirmRoundEdit: () => void;
  openRoundDeleteConfirm: (config: RoundDeleteConfig) => void;
  confirmRoundDelete: () => void;
  finishRoundDelete: () => void;
  openRoundToggleConfirm: (config: RoundToggleConfig) => void;
  confirmRoundToggle: () => void;
  finishRoundToggle: () => void;
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
  roundEditConfig: null,
  roundDeleteConfig: null,
  roundToggleConfig: null,
  isRoundDeletePending: false,
  isSheetOpen: false,

  openSelect: (config) =>
    set({
      sheetType: "rvt-select",
      selectConfig: config,
      multiSelectConfig: null,
      roundEditConfig: null,
      roundDeleteConfig: null,
      roundToggleConfig: null,
      isRoundDeletePending: false,
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
      roundEditConfig: null,
      roundDeleteConfig: null,
      roundToggleConfig: null,
      isRoundDeletePending: false,
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
      roundEditConfig: null,
      roundDeleteConfig: null,
      roundToggleConfig: null,
      isRoundDeletePending: false,
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
  openRoundEdit: (config) =>
    set({
      sheetType: "rvt-round-edit",
      roundEditConfig: { ...config },
      selectConfig: null,
      multiSelectConfig: null,
      roundDeleteConfig: null,
      roundToggleConfig: null,
      isRoundDeletePending: false,
      isSheetOpen: true,
    }),
  updateRoundEditDraft: (patch) =>
    set((state) => ({
      roundEditConfig: state.roundEditConfig
        ? { ...state.roundEditConfig, ...patch }
        : null,
    })),
  confirmRoundEdit: () => {
    const config = get().roundEditConfig;
    if (!config) return;
    config.onConfirm(config.nom, config.startedAt);
    if (get().sheetType === "rvt-round-edit") {
      set({ roundEditConfig: null, isSheetOpen: false });
    }
  },
  openRoundDeleteConfirm: (config) =>
    set({
      sheetType: "rvt-round-delete-confirm",
      roundDeleteConfig: { ...config },
      roundEditConfig: null,
      selectConfig: null,
      multiSelectConfig: null,
      isVisitDeletePending: false,
      isRoundDeletePending: false,
      isSheetOpen: true,
    }),
  confirmRoundDelete: () =>
    set((state) => {
      if (state.isRoundDeletePending || !state.roundDeleteConfig) {
        return state;
      }
      state.roundDeleteConfig.onConfirm();
      return { isRoundDeletePending: true, isSheetOpen: false };
    }),
  finishRoundDelete: () =>
    set({ isRoundDeletePending: false, roundDeleteConfig: null }),
  openRoundToggleConfirm: (config) =>
    set({
      sheetType: "rvt-round-toggle-confirm",
      roundToggleConfig: { ...config },
      roundEditConfig: null,
      selectConfig: null,
      multiSelectConfig: null,
      roundDeleteConfig: null,
      isVisitDeletePending: false,
      isRoundDeletePending: false,
      isSheetOpen: true,
    }),
  confirmRoundToggle: () =>
    set((state) => {
      if (!state.roundToggleConfig) return state;
      state.roundToggleConfig.onConfirm();
      return { roundToggleConfig: null, isSheetOpen: false };
    }),
  finishRoundToggle: () => set({ roundToggleConfig: null }),
  closeSheet: () => set({ isSheetOpen: false }),
}));
