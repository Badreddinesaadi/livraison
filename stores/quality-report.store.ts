import { create } from "zustand";

type SheetType = "quality-report-delete-confirm" | null;

type QualityReportDeleteHandler = (qualityReportId: number) => void;

type QualityReportSheetState = {
  sheetType: SheetType;
  qualityReportDeleteId: number | null;
  qualityReportDeleteHandler: QualityReportDeleteHandler | null;
  isQualityReportDeletePending: boolean;
  isSheetOpen: boolean;
  openQualityReportDeleteConfirm: (
    qualityReportId: number,
    handler: QualityReportDeleteHandler,
  ) => void;
  confirmQualityReportDelete: () => void;
  finishQualityReportDelete: () => void;
  openSheet: () => void;
  closeSheet: () => void;
};

export const useQualityReportSheetStore = create<QualityReportSheetState>(
  (set) => ({
    sheetType: null,
    qualityReportDeleteId: null,
    qualityReportDeleteHandler: null,
    isQualityReportDeletePending: false,
    isSheetOpen: false,
    openQualityReportDeleteConfirm: (
      qualityReportId: number,
      handler: QualityReportDeleteHandler,
    ) =>
      set({
        sheetType: "quality-report-delete-confirm",
        qualityReportDeleteId: qualityReportId,
        qualityReportDeleteHandler: handler,
        isQualityReportDeletePending: false,
        isSheetOpen: true,
      }),
    confirmQualityReportDelete: () =>
      set((state) => {
        if (
          state.isQualityReportDeletePending ||
          state.qualityReportDeleteId === null ||
          !state.qualityReportDeleteHandler
        ) {
          return state;
        }

        state.qualityReportDeleteHandler(state.qualityReportDeleteId);

        return {
          isQualityReportDeletePending: true,
          isSheetOpen: false,
        };
      }),
    finishQualityReportDelete: () =>
      set({
        isQualityReportDeletePending: false,
        qualityReportDeleteId: null,
        qualityReportDeleteHandler: null,
      }),
    openSheet: () => set({ isSheetOpen: true }),
    closeSheet: () => set({ isSheetOpen: false }),
  }),
);
