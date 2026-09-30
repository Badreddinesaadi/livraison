import type { QueryClient } from "@tanstack/react-query";
import type { VoyageListItem } from "@/api/voyage.api";

type InfiniteVoyages = {
  pages: { data: VoyageListItem[] | null }[];
  pageParams: unknown[];
};

const patchVoyage = (
  voyage: VoyageListItem,
  voyageId: number,
  blIds: number[],
): VoyageListItem => {
  if (voyage.id !== voyageId) return voyage;
  return {
    ...voyage,
    bl_list:
      voyage.bl_list?.map((bl) =>
        blIds.includes(bl.id)
          ? { ...bl, statut: "Livré" as const, _pendingSync: true }
          : bl,
      ) ?? voyage.bl_list,
  };
};

/**
 * Optimistically marks BLs as delivered + pending-sync in every cached voyage
 * query (list pages and the single-detail query) after an offline close.
 */
export const markBlsPendingSync = (
  queryClient: QueryClient,
  voyageId: number,
  blIds: number[],
) => {
  queryClient.setQueriesData({ queryKey: ["voyages"] }, (old: unknown) => {
    if (!old || typeof old !== "object") return old;

    if ("pages" in old) {
      const data = old as InfiniteVoyages;
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          data:
            page.data?.map((v) => patchVoyage(v, voyageId, blIds)) ?? page.data,
        })),
      };
    }

    if ("id" in old) {
      return patchVoyage(old as VoyageListItem, voyageId, blIds);
    }

    return old;
  });
};
