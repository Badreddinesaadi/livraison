import { create } from "zustand";
import { PendingVisitPhoto } from "@/stores/create-visit.store";

export type { PendingVisitPhoto };

type CameraPickerConfig = {
  maxPhotos?: number;
  multiple?: boolean;
  onConfirm: (photos: PendingVisitPhoto[]) => void;
};

type RvtCameraState = {
  isOpen: boolean;
  maxPhotos: number;
  multiple: boolean;
  photos: PendingVisitPhoto[];
  onConfirm: ((photos: PendingVisitPhoto[]) => void) | null;

  open: (config: CameraPickerConfig) => void;
  addPhoto: (photo: PendingVisitPhoto) => void;
  removePhoto: (uri: string) => void;
  confirm: () => void;
  cancel: () => void;
};

export const useRvtCameraStore = create<RvtCameraState>((set, get) => ({
  isOpen: false,
  maxPhotos: 5,
  multiple: true,
  photos: [],
  onConfirm: null,

  open: (config) =>
    set({
      isOpen: true,
      maxPhotos: config.maxPhotos ?? 5,
      multiple: config.multiple ?? true,
      photos: [],
      onConfirm: config.onConfirm,
    }),
  addPhoto: (photo) =>
    set((state) => {
      if (!state.multiple) {
        return { photos: [photo] };
      }
      if (state.photos.length >= state.maxPhotos) return state;
      return { photos: [...state.photos, photo] };
    }),
  removePhoto: (uri) =>
    set((state) => ({
      photos: state.photos.filter((p) => p.uri !== uri),
    })),
  confirm: () => {
    const { photos, onConfirm } = get();
    if (onConfirm && photos.length > 0) {
      onConfirm(photos);
    }
    set({ isOpen: false, photos: [], onConfirm: null });
  },
  cancel: () => set({ isOpen: false, photos: [], onConfirm: null }),
}));
