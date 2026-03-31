import { create } from "zustand";

type SheetType = "selector-options" | "projet-location-delete-confirm" | null;

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

type ProjetLocationDeleteHandler = (projetId: number) => void;

type ProjetLocationSheetState = {
  sheetType: SheetType;
  selectorSheetConfig: SelectorSheetConfig | null;
  projetLocationDeleteId: number | null;
  projetLocationDeleteHandler: ProjetLocationDeleteHandler | null;
  isProjetLocationDeletePending: boolean;
  isSheetOpen: boolean;
  openSelectorOptions: (config: SelectorSheetConfig) => void;
  chooseSelectorOption: (id: number) => void;
  openProjetLocationDeleteConfirm: (
    projetId: number,
    handler: ProjetLocationDeleteHandler,
  ) => void;
  confirmProjetLocationDelete: () => void;
  finishProjetLocationDelete: () => void;
  openSheet: () => void;
  closeSheet: () => void;
};

export const useProjetLocationSheetStore = create<ProjetLocationSheetState>(
  (set, get) => ({
    sheetType: null,
    selectorSheetConfig: null,
    projetLocationDeleteId: null,
    projetLocationDeleteHandler: null,
    isProjetLocationDeletePending: false,
    isSheetOpen: false,
    openSelectorOptions: (config: SelectorSheetConfig) =>
      set({
        sheetType: "selector-options",
        selectorSheetConfig: config,
        isSheetOpen: true,
        projetLocationDeleteId: null,
        projetLocationDeleteHandler: null,
        isProjetLocationDeletePending: false,
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
    openProjetLocationDeleteConfirm: (
      projetId: number,
      handler: ProjetLocationDeleteHandler,
    ) =>
      set({
        sheetType: "projet-location-delete-confirm",
        projetLocationDeleteId: projetId,
        projetLocationDeleteHandler: handler,
        isSheetOpen: true,
        selectorSheetConfig: null,
        isProjetLocationDeletePending: false,
      }),
    confirmProjetLocationDelete: () =>
      set((state) => {
        if (
          state.isProjetLocationDeletePending ||
          state.projetLocationDeleteId === null ||
          !state.projetLocationDeleteHandler
        ) {
          return state;
        }

        state.projetLocationDeleteHandler(state.projetLocationDeleteId);

        return {
          isProjetLocationDeletePending: true,
          isSheetOpen: false,
        };
      }),
    finishProjetLocationDelete: () =>
      set({
        isProjetLocationDeletePending: false,
        projetLocationDeleteId: null,
        projetLocationDeleteHandler: null,
      }),
    openSheet: () => set({ isSheetOpen: true }),
    closeSheet: () => set({ isSheetOpen: false }),
  }),
);
