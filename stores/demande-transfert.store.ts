import {
  DemandeTransfertLot,
  PreparerProduitRequest,
  PreparerLotRequest,
} from "@/api/demande-transfert.api";
import { create } from "zustand";

type SheetType =
  | "selector-options"
  | "add-product"
  | "delete-product-confirm"
  | "add-lot"
  | "replace-lot"
  | "preparer-confirm"
  | "statut-selector"
  | "delete-dt-confirm"
  | null;

type SelectorOption = {
  id: number;
  label: string;
  subLabel?: string;
  valueLabel?: string;
  type?: "highlight";
};

type SelectorSheetConfig = {
  title: string;
  options: SelectorOption[];
  selectedId?: number;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  onSelect: (id: number) => void;
};

type AddProductConfig = {
  idDT: number;
};

type DeleteProductConfig = {
  productDetailId: string;
  productName: string;
  handler: (productDetailId: string) => void;
};

type AddTransfertLotConfig = {
  idDT: number;
  idProduit: string;
  productDetailId: string;
  productName: string;
};

type ReplaceTransfertLotConfig = {
  idDT: number;
  idProduit: string;
  productDetailId: string;
  productName: string;
  currentLot: DemandeTransfertLot;
};

type PreparerConfig = {
  type: "preparer_produit" | "preparer_lot";
  label: string;
  request: PreparerProduitRequest | PreparerLotRequest;
  handler: (
    request: PreparerProduitRequest | PreparerLotRequest,
  ) => Promise<void>;
};

type StatutSelectorConfig = {
  idDT: number;
  currentStatut: string;
  onSelect: (statut: string) => void;
};

type DeleteDTConfig = {
  idDT: number;
  reference: string;
  handler: () => Promise<void>;
};

type DemandeTransfertSheetState = {
  sheetType: SheetType;
  selectorSheetConfig: SelectorSheetConfig | null;
  addProductConfig: AddProductConfig | null;
  deleteProductConfig: DeleteProductConfig | null;
  addLotConfig: AddTransfertLotConfig | null;
  replaceLotConfig: ReplaceTransfertLotConfig | null;
  preparerConfig: PreparerConfig | null;
  statutSelectorConfig: StatutSelectorConfig | null;
  deleteDTConfig: DeleteDTConfig | null;
  isDeleteProductPending: boolean;
  isPreparerPending: boolean;
  isDeleteDTPending: boolean;
  isSheetOpen: boolean;
  openSelectorOptions: (config: SelectorSheetConfig) => void;
  chooseSelectorOption: (id: number) => void;
  openAddProductSheet: (config: AddProductConfig) => void;
  openDeleteProductConfirmSheet: (config: DeleteProductConfig) => void;
  confirmDeleteProduct: () => void;
  finishDeleteProduct: () => void;
  openAddLotSheet: (config: AddTransfertLotConfig) => void;
  openReplaceLotSheet: (config: ReplaceTransfertLotConfig) => void;
  openPreparerConfirmSheet: (config: PreparerConfig) => void;
  confirmPreparer: () => void;
  finishPreparer: () => void;
  openStatutSelectorSheet: (config: StatutSelectorConfig) => void;
  openDeleteDTConfirmSheet: (config: DeleteDTConfig) => void;
  confirmDeleteDT: () => void;
  finishDeleteDT: () => void;
  closeSheet: () => void;
};

export const useDemandeTransfertSheetStore = create<DemandeTransfertSheetState>(
  (set, get) => ({
    sheetType: null,
    selectorSheetConfig: null,
    addProductConfig: null,
    deleteProductConfig: null,
    addLotConfig: null,
    replaceLotConfig: null,
    preparerConfig: null,
    statutSelectorConfig: null,
    deleteDTConfig: null,
    isDeleteProductPending: false,
    isPreparerPending: false,
    isDeleteDTPending: false,
    isSheetOpen: false,
    openSelectorOptions: (config: SelectorSheetConfig) =>
      set({
        sheetType: "selector-options",
        selectorSheetConfig: config,
        addProductConfig: null,
        deleteProductConfig: null,
        addLotConfig: null,
        replaceLotConfig: null,
        preparerConfig: null,
        statutSelectorConfig: null,
        deleteDTConfig: null,
        isDeleteProductPending: false,
        isPreparerPending: false,
        isDeleteDTPending: false,
        isSheetOpen: true,
      }),
    chooseSelectorOption: (id: number) =>
      set((state) => {
        state.selectorSheetConfig?.onSelect(id);

        if (get().sheetType !== "selector-options") {
          return {};
        }

        return {
          isSheetOpen: false,
        };
      }),
    openAddProductSheet: (config: AddProductConfig) =>
      set({
        sheetType: "add-product",
        addProductConfig: config,
        selectorSheetConfig: null,
        deleteProductConfig: null,
        addLotConfig: null,
        replaceLotConfig: null,
        preparerConfig: null,
        statutSelectorConfig: null,
        deleteDTConfig: null,
        isDeleteProductPending: false,
        isPreparerPending: false,
        isDeleteDTPending: false,
        isSheetOpen: true,
      }),
    openDeleteProductConfirmSheet: (config: DeleteProductConfig) =>
      set({
        sheetType: "delete-product-confirm",
        deleteProductConfig: config,
        selectorSheetConfig: null,
        addProductConfig: null,
        addLotConfig: null,
        replaceLotConfig: null,
        preparerConfig: null,
        statutSelectorConfig: null,
        deleteDTConfig: null,
        isDeleteProductPending: false,
        isPreparerPending: false,
        isDeleteDTPending: false,
        isSheetOpen: true,
      }),
    confirmDeleteProduct: () =>
      set((state) => {
        if (
          state.isDeleteProductPending ||
          !state.deleteProductConfig
        ) {
          return state;
        }

        state.deleteProductConfig.handler(
          state.deleteProductConfig.productDetailId,
        );

        return {
          isDeleteProductPending: true,
          isSheetOpen: false,
        };
      }),
    finishDeleteProduct: () =>
      set({
        isDeleteProductPending: false,
        deleteProductConfig: null,
      }),
    openAddLotSheet: (config: AddTransfertLotConfig) =>
      set({
        sheetType: "add-lot",
        addLotConfig: config,
        selectorSheetConfig: null,
        addProductConfig: null,
        deleteProductConfig: null,
        replaceLotConfig: null,
        preparerConfig: null,
        statutSelectorConfig: null,
        deleteDTConfig: null,
        isDeleteProductPending: false,
        isPreparerPending: false,
        isDeleteDTPending: false,
        isSheetOpen: true,
      }),
    openReplaceLotSheet: (config: ReplaceTransfertLotConfig) =>
      set({
        sheetType: "replace-lot",
        replaceLotConfig: config,
        selectorSheetConfig: null,
        addProductConfig: null,
        deleteProductConfig: null,
        addLotConfig: null,
        preparerConfig: null,
        statutSelectorConfig: null,
        deleteDTConfig: null,
        isDeleteProductPending: false,
        isPreparerPending: false,
        isDeleteDTPending: false,
        isSheetOpen: true,
      }),
    openPreparerConfirmSheet: (config: PreparerConfig) =>
      set({
        sheetType: "preparer-confirm",
        preparerConfig: config,
        selectorSheetConfig: null,
        addProductConfig: null,
        deleteProductConfig: null,
        addLotConfig: null,
        replaceLotConfig: null,
        statutSelectorConfig: null,
        deleteDTConfig: null,
        isDeleteProductPending: false,
        isPreparerPending: false,
        isDeleteDTPending: false,
        isSheetOpen: true,
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
    openStatutSelectorSheet: (config: StatutSelectorConfig) =>
      set({
        sheetType: "statut-selector",
        statutSelectorConfig: config,
        selectorSheetConfig: null,
        addProductConfig: null,
        deleteProductConfig: null,
        addLotConfig: null,
        replaceLotConfig: null,
        preparerConfig: null,
        deleteDTConfig: null,
        isDeleteProductPending: false,
        isPreparerPending: false,
        isDeleteDTPending: false,
        isSheetOpen: true,
      }),
    openDeleteDTConfirmSheet: (config: DeleteDTConfig) =>
      set({
        sheetType: "delete-dt-confirm",
        deleteDTConfig: config,
        selectorSheetConfig: null,
        addProductConfig: null,
        deleteProductConfig: null,
        addLotConfig: null,
        replaceLotConfig: null,
        preparerConfig: null,
        statutSelectorConfig: null,
        isDeleteProductPending: false,
        isPreparerPending: false,
        isDeleteDTPending: false,
        isSheetOpen: true,
      }),
    confirmDeleteDT: () =>
      set((state) => {
        if (state.isDeleteDTPending || !state.deleteDTConfig) {
          return state;
        }

        state.deleteDTConfig.handler();

        return {
          isDeleteDTPending: true,
          isSheetOpen: false,
        };
      }),
    finishDeleteDT: () =>
      set({
        isDeleteDTPending: false,
        deleteDTConfig: null,
      }),
    closeSheet: () => set({ isSheetOpen: false }),
  }),
);