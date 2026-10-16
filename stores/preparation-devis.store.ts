import {
  DevisProduitLot,
  PreparerDevisLotRequest,
  PreparerDevisProduitRequest,
} from "@/api/preparation-devis.api";
import { create } from "zustand";

export type DevisFilters = {
  clientId?: number;
  villeId?: number;
  commercialId?: number;
  statut?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type DevisFilterKey =
  | "client"
  | "ville"
  | "commercial"
  | "statut"
  | "date";

export type DevisFilterItem = {
  key: DevisFilterKey;
  label: string;
  valueLabel?: string;
};

type SheetType =
  | "filters"
  | "filter-options"
  | "date-range"
  | "preparer-confirm"
  | "replace-lots"
  | null;

type SelectorOption = {
  id: number;
  label: string;
  subLabel?: string;
  valueLabel?: string;
  type?: "highlight";
};

type FiltersSheetConfig = {
  title: string;
  items: DevisFilterItem[];
  onSelectItem: (key: DevisFilterKey) => void;
  onReset?: () => void;
};

type FilterOptionsConfig = {
  title: string;
  options: SelectorOption[];
  selectedId?: number;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  onSelect: (id: number) => void;
};

type DateRangeConfig = {
  from?: string;
  to?: string;
  onApply: (from?: string, to?: string) => void;
};

type ReplaceLotsConfig = {
  idDevis: number;
  idProduit: number;
  productName: string;
  currentLots: DevisProduitLot[];
};

type PreparerConfig = {
  type: "preparer_produit" | "preparer_lot";
  label: string;
  request: PreparerDevisProduitRequest | PreparerDevisLotRequest;
  handler: (
    request: PreparerDevisProduitRequest | PreparerDevisLotRequest,
  ) => Promise<void>;
};

type PreparationDevisSheetState = {
  sheetType: SheetType;
  filters: DevisFilters;
  filtersSheetConfig: FiltersSheetConfig | null;
  filterOptionsConfig: FilterOptionsConfig | null;
  dateRangeConfig: DateRangeConfig | null;
  preparerConfig: PreparerConfig | null;
  replaceLotsConfig: ReplaceLotsConfig | null;
  isPreparerPending: boolean;
  isSheetOpen: boolean;
  setFilters: (partial: DevisFilters) => void;
  resetFilters: () => void;
  openFiltersSheet: (config: FiltersSheetConfig) => void;
  openFilterOptionsSheet: (config: FilterOptionsConfig) => void;
  openDateRangeSheet: (config: DateRangeConfig) => void;
  openPreparerConfirmSheet: (config: PreparerConfig) => void;
  openReplaceLotsSheet: (config: ReplaceLotsConfig) => void;
  chooseFilterOption: (id: number) => void;
  applyDateRange: (from?: string, to?: string) => void;
  confirmPreparer: () => void;
  finishPreparer: () => void;
  closeSheet: () => void;
};

export const usePreparationDevisSheetStore =
  create<PreparationDevisSheetState>((set, get) => ({
    sheetType: null,
    filters: {},
    filtersSheetConfig: null,
    filterOptionsConfig: null,
    dateRangeConfig: null,
    preparerConfig: null,
    replaceLotsConfig: null,
    isPreparerPending: false,
    isSheetOpen: false,
    setFilters: (partial) =>
      set((state) => ({ filters: { ...state.filters, ...partial } })),
    resetFilters: () => set({ filters: {} }),
    openFiltersSheet: (config) =>
      set({
        sheetType: "filters",
        filtersSheetConfig: config,
        filterOptionsConfig: null,
        dateRangeConfig: null,
        preparerConfig: null,
        replaceLotsConfig: null,
        isPreparerPending: false,
        isSheetOpen: true,
      }),
    openFilterOptionsSheet: (config) =>
      set({
        sheetType: "filter-options",
        filterOptionsConfig: config,
        filtersSheetConfig: null,
        dateRangeConfig: null,
        preparerConfig: null,
        replaceLotsConfig: null,
        isPreparerPending: false,
        isSheetOpen: true,
      }),
    openDateRangeSheet: (config) =>
      set({
        sheetType: "date-range",
        dateRangeConfig: config,
        filtersSheetConfig: null,
        filterOptionsConfig: null,
        preparerConfig: null,
        replaceLotsConfig: null,
        isPreparerPending: false,
        isSheetOpen: true,
      }),
    openPreparerConfirmSheet: (config) =>
      set({
        sheetType: "preparer-confirm",
        preparerConfig: config,
        filtersSheetConfig: null,
        filterOptionsConfig: null,
        dateRangeConfig: null,
        replaceLotsConfig: null,
        isPreparerPending: false,
        isSheetOpen: true,
      }),
    openReplaceLotsSheet: (config) =>
      set({
        sheetType: "replace-lots",
        replaceLotsConfig: config,
        filtersSheetConfig: null,
        filterOptionsConfig: null,
        dateRangeConfig: null,
        preparerConfig: null,
        isPreparerPending: false,
        isSheetOpen: true,
      }),
    chooseFilterOption: (id) =>
      set((state) => {
        state.filterOptionsConfig?.onSelect(id);

        if (get().sheetType !== "filter-options") {
          return {};
        }

        return { isSheetOpen: false };
      }),
    applyDateRange: (from, to) =>
      set((state) => {
        state.dateRangeConfig?.onApply(from, to);

        if (get().sheetType !== "date-range") {
          return {};
        }

        return { isSheetOpen: false };
      }),
    confirmPreparer: () =>
      set((state) => {
        if (state.isPreparerPending || !state.preparerConfig) {
          return state;
        }

        state.preparerConfig.handler(state.preparerConfig.request);

        return {
          isPreparerPending: true,
          isSheetOpen: false,
        };
      }),
    finishPreparer: () =>
      set({
        isPreparerPending: false,
        preparerConfig: null,
      }),
    closeSheet: () => set({ isSheetOpen: false }),
  }));
