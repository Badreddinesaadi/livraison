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
  | "manage-lots"
  | "preparer-confirm"
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

type ManageLotsConfig = {
  idDT: number;
  idProduit: string;
  productDetailId: string;
  productName: string;
  currentLots: DemandeTransfertLot[];
};

type PreparerConfig = {
  type: "preparer_produit" | "preparer_lot";
  label: string;
  request: PreparerProduitRequest | PreparerLotRequest;
  handler: (
    request: PreparerProduitRequest | PreparerLotRequest,
  ) => Promise<void>;
};

type DemandeTransfertSheetState = {
  sheetType: SheetType;
  selectorSheetConfig: SelectorSheetConfig | null;
  addProductConfig: AddProductConfig | null;
  deleteProductConfig: DeleteProductConfig | null;
  manageLotsConfig: ManageLotsConfig | null;
  preparerConfig: PreparerConfig | null;
  isDeleteProductPending: boolean;
  isPreparerPending: boolean;
  isSheetOpen: boolean;
  openSelectorOptions: (config: SelectorSheetConfig) => void;
  chooseSelectorOption: (id: number) => void;
  openAddProductSheet: (config: AddProductConfig) => void;
  openDeleteProductConfirmSheet: (config: DeleteProductConfig) => void;
  confirmDeleteProduct: () => void;
  finishDeleteProduct: () => void;
  openManageLotsSheet: (config: ManageLotsConfig) => void;
  openPreparerConfirmSheet: (config: PreparerConfig) => void;
  confirmPreparer: () => void;
  finishPreparer: () => void;
  closeSheet: () => void;
};

export const useDemandeTransfertSheetStore = create<DemandeTransfertSheetState>(
  (set, get) => ({
    sheetType: null,
    selectorSheetConfig: null,
    addProductConfig: null,
    deleteProductConfig: null,
    manageLotsConfig: null,
    preparerConfig: null,
    isDeleteProductPending: false,
    isPreparerPending: false,
    isSheetOpen: false,
    openSelectorOptions: (config: SelectorSheetConfig) =>
      set({
        sheetType: "selector-options",
        selectorSheetConfig: config,
        addProductConfig: null,
        deleteProductConfig: null,
        manageLotsConfig: null,
        preparerConfig: null,
        isDeleteProductPending: false,
        isPreparerPending: false,
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
        manageLotsConfig: null,
        preparerConfig: null,
        isDeleteProductPending: false,
        isPreparerPending: false,
        isSheetOpen: true,
      }),
    openDeleteProductConfirmSheet: (config: DeleteProductConfig) =>
      set({
        sheetType: "delete-product-confirm",
        deleteProductConfig: config,
        selectorSheetConfig: null,
        addProductConfig: null,
        manageLotsConfig: null,
        preparerConfig: null,
        isDeleteProductPending: false,
        isPreparerPending: false,
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
    openManageLotsSheet: (config: ManageLotsConfig) =>
      set({
        sheetType: "manage-lots",
        manageLotsConfig: config,
        selectorSheetConfig: null,
        addProductConfig: null,
        deleteProductConfig: null,
        preparerConfig: null,
        isDeleteProductPending: false,
        isPreparerPending: false,
        isSheetOpen: true,
      }),
    openPreparerConfirmSheet: (config: PreparerConfig) =>
      set({
        sheetType: "preparer-confirm",
        preparerConfig: config,
        selectorSheetConfig: null,
        addProductConfig: null,
        deleteProductConfig: null,
        manageLotsConfig: null,
        isDeleteProductPending: false,
        isPreparerPending: false,
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
    closeSheet: () => set({ isSheetOpen: false }),
  }),
);