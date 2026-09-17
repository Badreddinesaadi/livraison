import { getApiUrl } from "@/stores/api-url.store";
import {
  ProductCategoriesJson,
  ProductCategory1,
  SyncStatus,
  VisitPhoto,
} from "@/types/rvt.types";
import { format } from "date-fns";

export const formatDateLabel = (value?: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return format(parsed, "dd/MM/yyyy HH:mm");
};

export const formatDuration = (seconds?: number | null) => {
  if (seconds === undefined || seconds === null) return "-";
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `${h}h ${pad(m)}m`;
  if (m > 0) return `${m}m ${pad(s)}s`;
  return `${s}s`;
};

export const rvtPhotoUrl = (
  photo?: Pick<VisitPhoto, "remoteUrl" | "thumbnailUrl"> | null,
) => {
  if (!photo) return null;
  const raw = photo.remoteUrl ?? photo.thumbnailUrl ?? null;
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = (getApiUrl() ?? "").replace(/\/+$/, "");
  const path = raw.replace(/^\/+/, "");
  if (!base) return raw;
  return `${base}/api/${path}`;
};

export const SYNC_STATUS_UI: Record<
  SyncStatus,
  { label: string; color: string; bg: string }
> = {
  draft: { label: "Brouillon", color: "#64748b", bg: "#64748b18" },
  pending_sync: { label: "En attente", color: "#f59e0b", bg: "#f59e0b18" },
  synced: { label: "Synchronisé", color: "#16a34a", bg: "#16a34a18" },
  sync_error: { label: "Erreur", color: "#ef4444", bg: "#ef444418" },
};

export const syncStatusUi = (status?: SyncStatus | null) => {
  if (!status) return SYNC_STATUS_UI.draft;
  return SYNC_STATUS_UI[status] ?? SYNC_STATUS_UI.draft;
};

type CategoryLike = number | { id: number } | null | undefined;

const toCategoryId = (value: CategoryLike): number | null =>
  typeof value === "number" ? value : (value?.id ?? null);

export const normalizeVisitCategories = (input: {
  categories?:
    | { categorie2: CategoryLike; categorie3: CategoryLike }[]
    | null;
  categorie2?: CategoryLike;
  categorie3?: CategoryLike;
}): ProductCategoriesJson[] => {
  if (Array.isArray(input.categories) && input.categories.length) {
    return input.categories
      .map((c) => ({
        categorie2: toCategoryId(c.categorie2),
        categorie3: toCategoryId(c.categorie3),
      }))
      .filter(
        (c): c is ProductCategoriesJson =>
          c.categorie2 != null && c.categorie3 != null,
      );
  }
  const categorie2 = toCategoryId(input.categorie2);
  const categorie3 = toCategoryId(input.categorie3);
  if (categorie2 != null && categorie3 != null) {
    return [{ categorie2, categorie3 }];
  }
  return [];
};

export const resolveCategoryNames = (
  pair: ProductCategoriesJson,
  productCategories: ProductCategory1[],
): { famille: string; produit: string } => {
  const famille = productCategories.find((c) => c.id === pair.categorie2);
  const produit = famille?.categorie3?.find(
    (c) => c.id === pair.categorie3,
  );
  return {
    famille: famille?.designation ?? String(pair.categorie2),
    produit: produit?.designation ?? String(pair.categorie3),
  };
};
