import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { kvStorage } from "./db";

export const queryPersister = createAsyncStoragePersister({
  storage: kvStorage,
  key: "sdkwood-rq-cache",
  throttleTime: 2000,
});

/** Query keys persisted for offline use (voyage module + its reference data). */
export const PERSISTED_QUERY_ROOTS = [
  "voyages",
  "currentUser",
  "depots",
  "villes",
  "chauffeurs",
  "vehicles",
  "clients",
] as const;

export const shouldPersistQuery = (queryKey: readonly unknown[]) =>
  PERSISTED_QUERY_ROOTS.includes(
    queryKey[0] as (typeof PERSISTED_QUERY_ROOTS)[number],
  );
