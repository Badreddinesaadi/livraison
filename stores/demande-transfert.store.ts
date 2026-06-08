import { create } from "zustand";

type SheetType = "selector-options" | null;

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

type DemandeTransfertSheetState = {
  sheetType: SheetType;
  selectorSheetConfig: SelectorSheetConfig | null;
  isSheetOpen: boolean;
  openSelectorOptions: (config: SelectorSheetConfig) => void;
  chooseSelectorOption: (id: number) => void;
  closeSheet: () => void;
};

export const useDemandeTransfertSheetStore = create<DemandeTransfertSheetState>(
  (set, get) => ({
    sheetType: null,
    selectorSheetConfig: null,
    isSheetOpen: false,
    openSelectorOptions: (config: SelectorSheetConfig) =>
      set({
        sheetType: "selector-options",
        selectorSheetConfig: config,
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
    closeSheet: () => set({ isSheetOpen: false }),
  }),
);
