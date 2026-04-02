import { BLItem } from "@/api/voyage.api";
import { create } from "zustand";

type CloseBLMode = "all" | "single" | null;
type SheetType =
  | "close-bl"
  | "voyage-action-confirm"
  | "return-action-confirm"
  | "return-delete-confirm"
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
type ReturnActionStatus = "terminer" | "refuser";
type ReturnActionPayload = {
  statut: ReturnActionStatus;
  commentaire: string;
};
type ReturnActionHandler = (
  returnId: number,
  payload: ReturnActionPayload,
) => void;
type ReturnDeleteHandler = (returnId: number) => void;
type SelectorOption = {
  id: number;
  label: string;
  subLabel?: string;
};
type SelectorSheetConfig = {
  title: string;
  options: SelectorOption[];
  selectedId?: number;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  onSelect: (id: number) => void;
};

export type VoyageFilterKey =
  | "chauffeur"
  | "vehicule"
  | "depot"
  | "ville"
  | "client"
  | "rotation-vehicule"
  | "rotation-interval";

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
  dateRetour?: string;
};

type CloseBLState = {
  sheetType: SheetType;
  voyageActionType: VoyageActionType;
  voyageId: number | null;
  voyageKmDepart: number | null;
  voyageDateDepart: string | null;
  bls: BLItem[];
  pendingUndeliveredCount: number;
  confirmedVoyageAction: ConfirmedVoyageAction | null;
  moreActionHandler: MoreActionHandler | null;
  returnActionHandler: ReturnActionHandler | null;
  returnActionReturnId: number | null;
  returnDeleteHandler: ReturnDeleteHandler | null;
  returnDeleteReturnId: number | null;
  selectorSheetConfig: SelectorSheetConfig | null;
  voyageFiltersSheetConfig: VoyageFiltersSheetConfig | null;
  isVoyageActionPending: boolean;
  isReturnActionPending: boolean;
  isReturnDeletePending: boolean;
  isSheetOpen: boolean;
  mode: CloseBLMode;
  selectedBL: BLItem | null;
  setContext: (voyageId: number, bls: BLItem[]) => void;
  openAcheveConfirm: (
    voyageId: number,
    pendingUndeliveredCount: number,
    voyageKmDepart: number,
    voyageDateDepart?: string | null,
  ) => void;
  openDeleteConfirm: (voyageId: number) => void;
  confirmVoyageAction: (kmRetour?: number, dateRetour?: string) => void;
  clearConfirmedVoyageAction: () => void;
  openMoreActions: (voyageId: number, handler: MoreActionHandler) => void;
  chooseMoreAction: (action: Exclude<MoreActionType, null>) => void;
  openReturnValidateConfirm: (
    returnId: number,
    handler: ReturnActionHandler,
  ) => void;
  openReturnDeleteConfirm: (
    returnId: number,
    handler: ReturnDeleteHandler,
  ) => void;
  confirmReturnAction: (payload: ReturnActionPayload) => void;
  confirmReturnDelete: () => void;
  finishReturnAction: () => void;
  finishReturnDelete: () => void;
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
  voyageDateDepart: null,
  bls: [],
  pendingUndeliveredCount: 0,
  confirmedVoyageAction: null,
  moreActionHandler: null,
  returnActionHandler: null,
  returnActionReturnId: null,
  returnDeleteHandler: null,
  returnDeleteReturnId: null,
  selectorSheetConfig: null,
  voyageFiltersSheetConfig: null,
  isVoyageActionPending: false,
  isReturnActionPending: false,
  isReturnDeletePending: false,
  isSheetOpen: false,
  mode: null,
  selectedBL: null,
  setContext: (voyageId: number, bls: BLItem[]) =>
    set({
      sheetType: "close-bl",
      voyageActionType: null,
      voyageId,
      voyageKmDepart: null,
      voyageDateDepart: null,
      bls,
      pendingUndeliveredCount: 0,
      moreActionHandler: null,
      returnActionHandler: null,
      returnActionReturnId: null,
      returnDeleteHandler: null,
      returnDeleteReturnId: null,
      selectorSheetConfig: null,
      voyageFiltersSheetConfig: null,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
      isReturnActionPending: false,
      isReturnDeletePending: false,
    }),
  openAcheveConfirm: (
    voyageId: number,
    pendingUndeliveredCount: number,
    voyageKmDepart: number,
    voyageDateDepart?: string | null,
  ) =>
    set({
      sheetType: "voyage-action-confirm",
      voyageActionType: "achever",
      voyageId,
      voyageKmDepart,
      voyageDateDepart: voyageDateDepart ?? null,
      bls: [],
      pendingUndeliveredCount,
      moreActionHandler: null,
      returnActionHandler: null,
      returnActionReturnId: null,
      returnDeleteHandler: null,
      returnDeleteReturnId: null,
      selectorSheetConfig: null,
      voyageFiltersSheetConfig: null,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
      isReturnActionPending: false,
      isReturnDeletePending: false,
      isSheetOpen: true,
    }),
  openDeleteConfirm: (voyageId: number) =>
    set({
      sheetType: "voyage-action-confirm",
      voyageActionType: "supprimer",
      voyageId,
      voyageKmDepart: null,
      voyageDateDepart: null,
      bls: [],
      pendingUndeliveredCount: 0,
      moreActionHandler: null,
      returnActionHandler: null,
      returnActionReturnId: null,
      returnDeleteHandler: null,
      returnDeleteReturnId: null,
      selectorSheetConfig: null,
      voyageFiltersSheetConfig: null,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
      isReturnActionPending: false,
      isReturnDeletePending: false,
      isSheetOpen: true,
    }),
  confirmVoyageAction: (kmRetour?: number, dateRetour?: string) =>
    set((state) => {
      if (state.isVoyageActionPending) {
        return state;
      }

      const hasVoyageAction =
        state.voyageId !== null && state.voyageActionType !== null;
      const hasValidKmRetour = typeof kmRetour === "number" && kmRetour > 0;
      const hasValidDateRetour =
        typeof dateRetour === "string" && dateRetour.trim().length > 0;
      const canConfirm =
        hasVoyageAction &&
        (state.voyageActionType === "supprimer" ||
          (hasValidKmRetour && hasValidDateRetour));

      return {
        confirmedVoyageAction:
          canConfirm && state.voyageId !== null && state.voyageActionType
            ? {
                action: state.voyageActionType,
                voyageId: state.voyageId,
                ...(state.voyageActionType === "achever" &&
                hasValidKmRetour &&
                hasValidDateRetour
                  ? { kmRetour, dateRetour }
                  : {}),
              }
            : null,
        isVoyageActionPending: canConfirm,
        isReturnActionPending: false,
        isReturnDeletePending: false,
      };
    }),
  clearConfirmedVoyageAction: () => set({ confirmedVoyageAction: null }),
  openMoreActions: (voyageId: number, handler: MoreActionHandler) =>
    set({
      sheetType: "voyage-more-actions",
      voyageActionType: null,
      voyageId,
      voyageKmDepart: null,
      voyageDateDepart: null,
      bls: [],
      pendingUndeliveredCount: 0,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
      isSheetOpen: true,
      moreActionHandler: handler,
      returnDeleteHandler: null,
      returnDeleteReturnId: null,
      selectorSheetConfig: null,
      voyageFiltersSheetConfig: null,
      isReturnDeletePending: false,
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
  openReturnValidateConfirm: (returnId: number, handler: ReturnActionHandler) =>
    set({
      sheetType: "return-action-confirm",
      voyageActionType: null,
      voyageId: null,
      voyageKmDepart: null,
      voyageDateDepart: null,
      bls: [],
      pendingUndeliveredCount: 0,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
      isReturnActionPending: false,
      isSheetOpen: true,
      moreActionHandler: null,
      returnActionHandler: handler,
      returnActionReturnId: returnId,
      returnDeleteHandler: null,
      returnDeleteReturnId: null,
      selectorSheetConfig: null,
      voyageFiltersSheetConfig: null,
      isReturnDeletePending: false,
    }),
  openReturnDeleteConfirm: (returnId: number, handler: ReturnDeleteHandler) =>
    set({
      sheetType: "return-delete-confirm",
      voyageActionType: null,
      voyageId: null,
      voyageKmDepart: null,
      voyageDateDepart: null,
      bls: [],
      pendingUndeliveredCount: 0,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
      isReturnActionPending: false,
      isReturnDeletePending: false,
      isSheetOpen: true,
      moreActionHandler: null,
      returnActionHandler: null,
      returnActionReturnId: null,
      returnDeleteHandler: handler,
      returnDeleteReturnId: returnId,
      selectorSheetConfig: null,
      voyageFiltersSheetConfig: null,
    }),
  confirmReturnAction: (payload: ReturnActionPayload) =>
    set((state) => {
      if (
        state.isReturnActionPending ||
        state.returnActionReturnId === null ||
        !state.returnActionHandler
      ) {
        return state;
      }

      state.returnActionHandler(state.returnActionReturnId, payload);

      return {
        isReturnActionPending: true,
        isSheetOpen: false,
      };
    }),
  confirmReturnDelete: () =>
    set((state) => {
      if (
        state.isReturnDeletePending ||
        state.returnDeleteReturnId === null ||
        !state.returnDeleteHandler
      ) {
        return state;
      }

      state.returnDeleteHandler(state.returnDeleteReturnId);

      return {
        isReturnDeletePending: true,
        isSheetOpen: false,
      };
    }),
  finishReturnAction: () =>
    set({
      isReturnActionPending: false,
      returnActionReturnId: null,
      returnActionHandler: null,
    }),
  finishReturnDelete: () =>
    set({
      isReturnDeletePending: false,
      returnDeleteReturnId: null,
      returnDeleteHandler: null,
    }),
  openSelectorOptions: (config: SelectorSheetConfig) =>
    set({
      sheetType: "selector-options",
      voyageActionType: null,
      voyageId: null,
      voyageKmDepart: null,
      voyageDateDepart: null,
      bls: [],
      pendingUndeliveredCount: 0,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
      isReturnActionPending: false,
      isSheetOpen: true,
      moreActionHandler: null,
      returnActionHandler: null,
      returnActionReturnId: null,
      returnDeleteHandler: null,
      returnDeleteReturnId: null,
      selectorSheetConfig: config,
      voyageFiltersSheetConfig: null,
      isReturnDeletePending: false,
    }),
  openVoyageFilters: (config: VoyageFiltersSheetConfig) =>
    set({
      sheetType: "voyage-filters",
      voyageActionType: null,
      voyageId: null,
      voyageKmDepart: null,
      voyageDateDepart: null,
      bls: [],
      pendingUndeliveredCount: 0,
      mode: null,
      selectedBL: null,
      isVoyageActionPending: false,
      isReturnActionPending: false,
      isSheetOpen: true,
      moreActionHandler: null,
      returnActionHandler: null,
      returnActionReturnId: null,
      returnDeleteHandler: null,
      returnDeleteReturnId: null,
      selectorSheetConfig: null,
      voyageFiltersSheetConfig: config,
      isReturnDeletePending: false,
    }),
  chooseSelectorOption: (id: number) =>
    set((state) => {
      state.selectorSheetConfig?.onSelect(id);

      // If the selection opened another sheet, do not override it by closing.
      if (get().sheetType !== "selector-options") {
        return {};
      }

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
      isReturnActionPending: false,
      isReturnDeletePending: false,
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
      voyageDateDepart: null,
      bls: [],
      pendingUndeliveredCount: 0,
      confirmedVoyageAction: null,
      moreActionHandler: null,
      returnActionHandler: null,
      returnActionReturnId: null,
      returnDeleteHandler: null,
      returnDeleteReturnId: null,
      selectorSheetConfig: null,
      voyageFiltersSheetConfig: null,
      isVoyageActionPending: false,
      isReturnActionPending: false,
      isReturnDeletePending: false,
      isSheetOpen: false,
      mode: null,
      selectedBL: null,
    }),
}));
