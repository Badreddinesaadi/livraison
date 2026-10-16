import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useCallback, useSyncExternalStore } from "react";

type Paged = { data?: { id: number | string }[] };

/**
 * Reactively selects a single item from an infinite-list query cache, regardless
 * of the active search/filters that produced the cached pages. The details
 * screens navigate with only an id, so they cannot rebuild the list's exact
 * query key — this reads every cached variant of that list instead.
 */
export function useListItemFromCache<T extends { id: number | string }>(
  listQueryKey: QueryKey,
  id: string | undefined,
): T | null {
  const queryClient = useQueryClient();

  const getSnapshot = useCallback((): T | null => {
    if (!id) return null;
    const entries = queryClient.getQueriesData<{ pages?: Paged[] }>({
      queryKey: listQueryKey,
    });
    for (const [, data] of entries) {
      const found = data?.pages
        ?.flatMap((page) => page?.data ?? [])
        .find((item) => String(item.id) === String(id));
      if (found) return found as T;
    }
    return null;
  }, [queryClient, listQueryKey, id]);

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      queryClient.getQueryCache().subscribe(onStoreChange),
    [queryClient],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
