import { BLItem } from "@/api/voyage.api";
import { create } from "zustand";

type CloseBLMode = "all" | "single" | null;
type SheetType =
  | "close-bl"
  | "voyage-action-confirm"
  | "voyage-more-actions"
  | "selector-options"
  | null;
type VoyageActionType = "achever" | "supprimer" | null;
type MoreActionType = "modifier" | "details" | null;
type MoreActionHandler = (
  action: Exclude<MoreActionType, null>,
  voyageId: number,
) => void;
type SelectorOption = {
  id: number;
  label: string;
  subLabel?: string;
};
type SelectorSheetConfig = {
  title: string;
  options: SelectorOption[];
  selectedId?: number;
  onSelect: (id: number) => void;
};

type ConfirmedVoyageAction = {
  action: Exclude<VoyageActionType, null>;
  voyageId: number;
};

type CloseBLState = {
  sheetType: SheetType;
  voyageActionType: VoyageActionType;
  voyageId: number | null;
  bls: BLItem[];
  pendingUndeliveredCount: number;
  confirmedVoyageAction: ConfirmedVoyageAction | null;
  moreActionHandler: MoreActionHandler | null;
  selectorSheetConfig: SelectorSheetConfig | null;
  isVoyageActionPending: boolean;
  isSheetOpen: boolean;
  mode: CloseBLMode;
  selectedBL: BLItem | null;
  setContext: (voyageId: number, bls: BLItem[]) => void;
  openAcheveConfirm: (
    voyageId: number,
    pendingUndeliveredCount: number,
  ) => void;
  openDeleteConfirm: (voyageId: number) => void;
  confirmVoyageAction: () => void;
  clearConfirmedVoyageAction: () => void;
  openMoreActions: (voyageId: number, handler: MoreActionHandler) => void;
  chooseMoreAction: (action: Exclude<MoreActionType, null>) => void;
  openSelectorOptions: (config: SelectorSheetConfig) => void;
  chooseSelectorOption: (id: number) => void;
  finishVoyageAction: () => void;
  openSheet: () => void;
  closeSheet: () => void;
  selectAll: () => void;
  selectBL: (bl: BLItem) => void;
  reset: () => void;
};

export const useCloseBLStore = create<CloseBLState>((set) => ({
  sheetType: null,
  voyageActionType: null,
  voyageId: null,
  bls: [],
  pendingUndeliveredCount: 0,
  confirmedVoyageAction: null,
  moreActionHandler: null,
  selectorSheetConfig: null,
  isVoyageActionPending: false,
  isSheetOpen: false,
  mode: null,
  selectedBL: null,
  setContext: (voyageId: number, bls: BLItem[]) =>
    set({
      sheetType: "close-bl",
      voyageActionType: null,
      voyageId,
      bls,
      pendingUndeliveredCount: 0,
      moreActionHandler: null,
      selectorSheetConfig: null,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
    }),
  openAcheveConfirm: (voyageId: number, pendingUndeliveredCount: number) =>
    set({
      sheetType: "voyage-action-confirm",
      voyageActionType: "achever",
      voyageId,
      bls: [],
      pendingUndeliveredCount,
      moreActionHandler: null,
      selectorSheetConfig: null,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
      isSheetOpen: true,
    }),
  openDeleteConfirm: (voyageId: number) =>
    set({
      sheetType: "voyage-action-confirm",
      voyageActionType: "supprimer",
      voyageId,
      bls: [],
      pendingUndeliveredCount: 0,
      moreActionHandler: null,
      selectorSheetConfig: null,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
      isSheetOpen: true,
    }),
  confirmVoyageAction: () =>
    set((state) => {
      if (state.isVoyageActionPending) {
        return state;
      }

      return {
        confirmedVoyageAction:
          state.voyageId && state.voyageActionType
            ? { action: state.voyageActionType, voyageId: state.voyageId }
            : null,
        isVoyageActionPending:
          Boolean(state.voyageId) && Boolean(state.voyageActionType),
      };
    }),
  clearConfirmedVoyageAction: () => set({ confirmedVoyageAction: null }),
  openMoreActions: (voyageId: number, handler: MoreActionHandler) =>
    set({
      sheetType: "voyage-more-actions",
      voyageActionType: null,
      voyageId,
      bls: [],
      pendingUndeliveredCount: 0,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
      isSheetOpen: true,
      moreActionHandler: handler,
      selectorSheetConfig: null,
    }),
  chooseMoreAction: (action: Exclude<MoreActionType, null>) =>
    set((state) => {
      if (state.voyageId && state.moreActionHandler) {
        state.moreActionHandler(action, state.voyageId);
      }

      return {
        isSheetOpen: false,
      };
    }),
  openSelectorOptions: (config: SelectorSheetConfig) =>
    set({
      sheetType: "selector-options",
      voyageActionType: null,
      voyageId: null,
      bls: [],
      pendingUndeliveredCount: 0,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
      isSheetOpen: true,
      moreActionHandler: null,
      selectorSheetConfig: config,
    }),
  chooseSelectorOption: (id: number) =>
    set((state) => {
      state.selectorSheetConfig?.onSelect(id);

      return {
        isSheetOpen: false,
      };
    }),
  finishVoyageAction: () =>
    set({
      confirmedVoyageAction: null,
      isVoyageActionPending: false,
      isSheetOpen: false,
    }),
  openSheet: () => set({ isSheetOpen: true }),
  closeSheet: () => set({ isSheetOpen: false }),
  selectAll: () => set({ mode: "all", selectedBL: null }),
  selectBL: (bl: BLItem) => set({ mode: "single", selectedBL: bl }),
  reset: () =>
    set({
      sheetType: null,
      voyageActionType: null,
      voyageId: null,
      bls: [],
      pendingUndeliveredCount: 0,
      confirmedVoyageAction: null,
      moreActionHandler: null,
      selectorSheetConfig: null,
      isVoyageActionPending: false,
      isSheetOpen: false,
      mode: null,
      selectedBL: null,
    }),
}));
