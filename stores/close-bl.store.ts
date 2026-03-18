import { BLItem } from "@/api/voyage.api";
import { create } from "zustand";

type CloseBLMode = "all" | "single" | null;
type SheetType =
  | "close-bl"
  | "voyage-action-confirm"
  | "voyage-more-actions"
  | "selector-options"
  | "voyage-filters"
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

export type VoyageFilterKey = "chauffeur" | "vehicule" | "depot";

export type VoyageFilterItem = {
  key: VoyageFilterKey;
  label: string;
  valueLabel?: string;
};

type VoyageFiltersSheetConfig = {
  title: string;
  items: VoyageFilterItem[];
  onPressItem: (key: VoyageFilterKey) => void;
  onReset?: () => void;
};

type ConfirmedVoyageAction = {
  action: Exclude<VoyageActionType, null>;
  voyageId: number;
  kmRetour?: number;
};

type CloseBLState = {
  sheetType: SheetType;
  voyageActionType: VoyageActionType;
  voyageId: number | null;
  voyageKmDepart: number | null;
  bls: BLItem[];
  pendingUndeliveredCount: number;
  confirmedVoyageAction: ConfirmedVoyageAction | null;
  moreActionHandler: MoreActionHandler | null;
  selectorSheetConfig: SelectorSheetConfig | null;
  voyageFiltersSheetConfig: VoyageFiltersSheetConfig | null;
  isVoyageActionPending: boolean;
  isSheetOpen: boolean;
  mode: CloseBLMode;
  selectedBL: BLItem | null;
  setContext: (voyageId: number, bls: BLItem[]) => void;
  openAcheveConfirm: (
    voyageId: number,
    pendingUndeliveredCount: number,
    voyageKmDepart: number,
  ) => void;
  openDeleteConfirm: (voyageId: number) => void;
  confirmVoyageAction: (kmRetour?: number) => void;
  clearConfirmedVoyageAction: () => void;
  openMoreActions: (voyageId: number, handler: MoreActionHandler) => void;
  chooseMoreAction: (action: Exclude<MoreActionType, null>) => void;
  openSelectorOptions: (config: SelectorSheetConfig) => void;
  chooseSelectorOption: (id: number) => void;
  openVoyageFilters: (config: VoyageFiltersSheetConfig) => void;
  chooseVoyageFilterItem: (key: VoyageFilterKey) => void;
  finishVoyageAction: () => void;
  openSheet: () => void;
  closeSheet: () => void;
  selectAll: () => void;
  selectBL: (bl: BLItem) => void;
  reset: () => void;
};

export const useCloseBLStore = create<CloseBLState>((set, get) => ({
  sheetType: null,
  voyageActionType: null,
  voyageId: null,
  voyageKmDepart: null,
  bls: [],
  pendingUndeliveredCount: 0,
  confirmedVoyageAction: null,
  moreActionHandler: null,
  selectorSheetConfig: null,
  voyageFiltersSheetConfig: null,
  isVoyageActionPending: false,
  isSheetOpen: false,
  mode: null,
  selectedBL: null,
  setContext: (voyageId: number, bls: BLItem[]) =>
    set({
      sheetType: "close-bl",
      voyageActionType: null,
      voyageId,
      voyageKmDepart: null,
      bls,
      pendingUndeliveredCount: 0,
      moreActionHandler: null,
      selectorSheetConfig: null,
      voyageFiltersSheetConfig: null,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
    }),
  openAcheveConfirm: (
    voyageId: number,
    pendingUndeliveredCount: number,
    voyageKmDepart: number,
  ) =>
    set({
      sheetType: "voyage-action-confirm",
      voyageActionType: "achever",
      voyageId,
      voyageKmDepart,
      bls: [],
      pendingUndeliveredCount,
      moreActionHandler: null,
      selectorSheetConfig: null,
      voyageFiltersSheetConfig: null,
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
      voyageKmDepart: null,
      bls: [],
      pendingUndeliveredCount: 0,
      moreActionHandler: null,
      selectorSheetConfig: null,
      voyageFiltersSheetConfig: null,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
      isSheetOpen: true,
    }),
  confirmVoyageAction: (kmRetour?: number) =>
    set((state) => {
      if (state.isVoyageActionPending) {
        return state;
      }

      const hasVoyageAction =
        state.voyageId !== null && state.voyageActionType !== null;
      const hasValidKmRetour = typeof kmRetour === "number" && kmRetour > 0;
      const canConfirm =
        hasVoyageAction &&
        (state.voyageActionType === "supprimer" || hasValidKmRetour);

      return {
        confirmedVoyageAction:
          canConfirm && state.voyageId !== null && state.voyageActionType
            ? {
                action: state.voyageActionType,
                voyageId: state.voyageId,
                ...(state.voyageActionType === "achever" && hasValidKmRetour
                  ? { kmRetour }
                  : {}),
              }
            : null,
        isVoyageActionPending: canConfirm,
      };
    }),
  clearConfirmedVoyageAction: () => set({ confirmedVoyageAction: null }),
  openMoreActions: (voyageId: number, handler: MoreActionHandler) =>
    set({
      sheetType: "voyage-more-actions",
      voyageActionType: null,
      voyageId,
      voyageKmDepart: null,
      bls: [],
      pendingUndeliveredCount: 0,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
      isSheetOpen: true,
      moreActionHandler: handler,
      selectorSheetConfig: null,
      voyageFiltersSheetConfig: null,
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
      voyageKmDepart: null,
      bls: [],
      pendingUndeliveredCount: 0,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
      isSheetOpen: true,
      moreActionHandler: null,
      selectorSheetConfig: config,
      voyageFiltersSheetConfig: null,
    }),
  openVoyageFilters: (config: VoyageFiltersSheetConfig) =>
    set({
      sheetType: "voyage-filters",
      voyageActionType: null,
      voyageId: null,
      voyageKmDepart: null,
      bls: [],
      pendingUndeliveredCount: 0,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
      isSheetOpen: true,
      moreActionHandler: null,
      selectorSheetConfig: null,
      voyageFiltersSheetConfig: config,
    }),
  chooseSelectorOption: (id: number) =>
    set((state) => {
      state.selectorSheetConfig?.onSelect(id);

      return {
        isSheetOpen: false,
      };
    }),
  chooseVoyageFilterItem: (key: VoyageFilterKey) => {
    get().voyageFiltersSheetConfig?.onPressItem(key);
  },
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
      voyageKmDepart: null,
      bls: [],
      pendingUndeliveredCount: 0,
      confirmedVoyageAction: null,
      moreActionHandler: null,
      selectorSheetConfig: null,
      voyageFiltersSheetConfig: null,
      isVoyageActionPending: false,
      isSheetOpen: false,
      mode: null,
      selectedBL: null,
    }),
}));
