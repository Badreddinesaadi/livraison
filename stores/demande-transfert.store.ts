import { DemandeTransfertLot } from "@/api/demande-transfert.api";
import { create } from "zustand";

type SheetType =
  | "selector-options"
  | "add-product"
  | "delete-product-confirm"
  | "manage-lots"
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

type DemandeTransfertSheetState = {
  sheetType: SheetType;
  selectorSheetConfig: SelectorSheetConfig | null;
  addProductConfig: AddProductConfig | null;
  deleteProductConfig: DeleteProductConfig | null;
  manageLotsConfig: ManageLotsConfig | null;
  isDeleteProductPending: boolean;
  isSheetOpen: boolean;
  openSelectorOptions: (config: SelectorSheetConfig) => void;
  chooseSelectorOption: (id: number) => void;
  openAddProductSheet: (config: AddProductConfig) => void;
  openDeleteProductConfirmSheet: (config: DeleteProductConfig) => void;
  confirmDeleteProduct: () => void;
  finishDeleteProduct: () => void;
  openManageLotsSheet: (config: ManageLotsConfig) => void;
  closeSheet: () => void;
};

export const useDemandeTransfertSheetStore = create<DemandeTransfertSheetState>(
  (set, get) => ({
    sheetType: null,
    selectorSheetConfig: null,
    addProductConfig: null,
    deleteProductConfig: null,
    manageLotsConfig: null,
    isDeleteProductPending: false,
    isSheetOpen: false,
    openSelectorOptions: (config: SelectorSheetConfig) =>
      set({
        sheetType: "selector-options",
        selectorSheetConfig: config,
        addProductConfig: null,
        deleteProductConfig: null,
        manageLotsConfig: null,
        isDeleteProductPending: false,
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
        isDeleteProductPending: false,
        isSheetOpen: true,
      }),
    openDeleteProductConfirmSheet: (config: DeleteProductConfig) =>
      set({
        sheetType: "delete-product-confirm",
        deleteProductConfig: config,
        selectorSheetConfig: null,
        addProductConfig: null,
        manageLotsConfig: null,
        isDeleteProductPending: false,
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
        isDeleteProductPending: false,
        isSheetOpen: true,
      }),
    closeSheet: () => set({ isSheetOpen: false }),
  }),
);