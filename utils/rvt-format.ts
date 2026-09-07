import { format } from "date-fns";
import { apiUrl } from "@/constants/query";
import { SyncStatus, VisitPhoto } from "@/types/rvt.types";

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
  const base = (apiUrl ?? "").replace(/\/+$/, "");
  const path = raw.replace(/^\/+/, "");
  if (!base) return raw;
  return `${base}/sdkboard/api/${path}`;
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
