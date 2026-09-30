import { Directory, File, Paths } from "expo-file-system";

export type LocalPhoto = { uri: string; name: string; type: string };

const QUEUE_ROOT = "close-bl-queue";

/**
 * Copies camera/cache photos into a durable document directory so they survive
 * app restarts and cache eviction while the close-BL request waits to sync.
 */
export const persistPhotos = (jobUuid: string, photos: LocalPhoto[]) => {
  const dir = new Directory(Paths.document, QUEUE_ROOT, jobUuid);
  if (!dir.exists) dir.create({ intermediates: true });

  const photoPaths: string[] = [];
  for (const photo of photos) {
    const source = new File(photo.uri);
    const dest = new File(dir, photo.name);
    if (dest.exists) dest.delete();
    source.copy(dest);
    photoPaths.push(dest.uri);
  }

  return { dirUri: dir.uri, photoPaths };
};

export const deletePhotoDir = (dirUri: string) => {
  try {
    const dir = new Directory(dirUri);
    if (dir.exists) dir.delete();
  } catch {
    // best-effort cleanup
  }
};

export const toUploadPhoto = (path: string): LocalPhoto => ({
  uri: path,
  name: path.split("/").pop() ?? `photo-${Date.now()}.jpg`,
  type: "image/jpeg",
});
