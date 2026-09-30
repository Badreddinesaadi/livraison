import { closeBL } from "@/api/BLS.api";
import {
  listPendingJobs,
  markJobFailed,
  markJobSending,
  removeJob,
  resetSendingJobs,
  type CloseBlJob,
} from "@/utils/offline/db";
import { deletePhotoDir, toUploadPhoto } from "@/utils/offline/photos";

export type SyncOutcome = {
  synced: number;
  failed: number;
  authError: boolean;
};

const AUTH_ERROR = /token/i;

let isFlushing = false;

export const isQueueFlushing = () => isFlushing;

const sendJob = async (job: CloseBlJob) => {
  await closeBL({
    idVoyage: job.idVoyage,
    idBL: job.idBl,
    status: job.status,
    coordinates: job.coordinates,
    images: job.photoPaths.map(toUploadPhoto),
    offline: true,
  });
};

/**
 * Sends queued close-BL jobs serially. Stops on the first network/auth failure so
 * the remaining jobs stay queued for the next reconnect (no hammering offline).
 */
export const flushCloseBlQueue = async (): Promise<SyncOutcome> => {
  const outcome: SyncOutcome = { synced: 0, failed: 0, authError: false };
  if (isFlushing) {
    return outcome;
  }

  isFlushing = true;
  try {
    await resetSendingJobs();
    const jobs = await listPendingJobs();

    for (const job of jobs) {
      await markJobSending(job.id);
      try {
        await sendJob(job);
        await removeJob(job.id);
        deletePhotoDir(job.photoDir);
        outcome.synced += 1;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erreur inconnue";
        await markJobFailed(job.id, message);
        outcome.failed += 1;

        if (AUTH_ERROR.test(message)) {
          outcome.authError = true;
        }
        // Stop: likely offline or session invalid. Retry on next reconnect.
        break;
      }
    }
  } finally {
    isFlushing = false;
  }

  return outcome;
};
