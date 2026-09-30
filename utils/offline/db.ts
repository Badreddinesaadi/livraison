import * as SQLite from "expo-sqlite";

const DB_NAME = "sdkwood-offline.db";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const getDb = (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME).then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS kv (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS close_bl_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_uuid TEXT NOT NULL UNIQUE,
          id_voyage INTEGER NOT NULL,
          id_bl INTEGER NOT NULL,
          status TEXT NOT NULL,
          coordinates_x REAL,
          coordinates_y REAL,
          photo_paths TEXT NOT NULL,
          photo_dir TEXT NOT NULL,
          state TEXT NOT NULL DEFAULT 'pending',
          attempts INTEGER NOT NULL DEFAULT 0,
          last_error TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_close_bl_queue_state ON close_bl_queue(state);
      `);
      return db;
    });
  }
  return dbPromise;
};

/* ---------------------------- KV (persister store) ---------------------------- */

export const kvStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const db = await getDb();
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM kv WHERE key = ?",
      [key],
    );
    return row?.value ?? null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO kv (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [key, value, Date.now()],
    );
  },
  removeItem: async (key: string): Promise<void> => {
    const db = await getDb();
    await db.runAsync("DELETE FROM kv WHERE key = ?", [key]);
  },
};

/* ------------------------------- Close-BL queue ------------------------------- */

export type CloseBlJobState = "pending" | "sending" | "failed";

export type CloseBlJob = {
  id: number;
  clientUuid: string;
  idVoyage: number;
  idBl: number;
  status: string;
  coordinates: { x: number; y: number } | null;
  photoPaths: string[];
  photoDir: string;
  state: CloseBlJobState;
  attempts: number;
  lastError: string | null;
  createdAt: number;
  updatedAt: number;
};

export type NewCloseBlJob = {
  idVoyage: number;
  idBl: number;
  status: string;
  coordinates: { x: number; y: number } | null;
  photoPaths: string[];
  photoDir: string;
};

type CloseBlRow = {
  id: number;
  client_uuid: string;
  id_voyage: number;
  id_bl: number;
  status: string;
  coordinates_x: number | null;
  coordinates_y: number | null;
  photo_paths: string;
  photo_dir: string;
  state: CloseBlJobState;
  attempts: number;
  last_error: string | null;
  created_at: number;
  updated_at: number;
};

const rowToJob = (row: CloseBlRow): CloseBlJob => ({
  id: row.id,
  clientUuid: row.client_uuid,
  idVoyage: row.id_voyage,
  idBl: row.id_bl,
  status: row.status,
  coordinates:
    row.coordinates_x !== null && row.coordinates_y !== null
      ? { x: row.coordinates_x, y: row.coordinates_y }
      : null,
  photoPaths: JSON.parse(row.photo_paths) as string[],
  photoDir: row.photo_dir,
  state: row.state,
  attempts: row.attempts,
  lastError: row.last_error,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const makeClientUuid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;

export const enqueueCloseBlJob = async (
  job: NewCloseBlJob,
): Promise<CloseBlJob> => {
  const db = await getDb();
  const uuid = makeClientUuid();
  const now = Date.now();
  const res = await db.runAsync(
    `INSERT INTO close_bl_queue
       (client_uuid, id_voyage, id_bl, status, coordinates_x, coordinates_y, photo_paths, photo_dir, state, attempts, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?)`,
    [
      uuid,
      job.idVoyage,
      job.idBl,
      job.status,
      job.coordinates?.x ?? null,
      job.coordinates?.y ?? null,
      JSON.stringify(job.photoPaths),
      job.photoDir,
      now,
      now,
    ],
  );
  const row = await db.getFirstAsync<CloseBlRow>(
    "SELECT * FROM close_bl_queue WHERE id = ?",
    [res.lastInsertRowId],
  );
  return rowToJob(row as CloseBlRow);
};

export const listPendingJobs = async (): Promise<CloseBlJob[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<CloseBlRow>(
    "SELECT * FROM close_bl_queue WHERE state IN ('pending', 'sending', 'failed') ORDER BY created_at ASC",
  );
  return rows.map(rowToJob);
};

export const countPendingJobs = async (): Promise<number> => {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    "SELECT COUNT(*) AS total FROM close_bl_queue",
  );
  return row?.total ?? 0;
};

export const markJobSending = async (id: number): Promise<void> => {
  const db = await getDb();
  await db.runAsync(
    "UPDATE close_bl_queue SET state = 'sending', updated_at = ? WHERE id = ?",
    [Date.now(), id],
  );
};

export const markJobFailed = async (
  id: number,
  error: string,
): Promise<void> => {
  const db = await getDb();
  await db.runAsync(
    "UPDATE close_bl_queue SET state = 'failed', attempts = attempts + 1, last_error = ?, updated_at = ? WHERE id = ?",
    [error, Date.now(), id],
  );
};

export const removeJob = async (id: number): Promise<void> => {
  const db = await getDb();
  await db.runAsync("DELETE FROM close_bl_queue WHERE id = ?", [id]);
};

export const resetSendingJobs = async (): Promise<void> => {
  const db = await getDb();
  await db.runAsync(
    "UPDATE close_bl_queue SET state = 'pending', updated_at = ? WHERE state = 'sending'",
    [Date.now()],
  );
};

/** Clears any not-yet-sent job for the same BL so a re-close does not double-queue. */
export const clearUnsentJobsForBl = async (
  idVoyage: number,
  idBl: number,
): Promise<CloseBlJob[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<CloseBlRow>(
    "SELECT * FROM close_bl_queue WHERE id_voyage = ? AND id_bl = ? AND state IN ('pending', 'failed')",
    [idVoyage, idBl],
  );
  await db.runAsync(
    "DELETE FROM close_bl_queue WHERE id_voyage = ? AND id_bl = ? AND state IN ('pending', 'failed')",
    [idVoyage, idBl],
  );
  return rows.map(rowToJob);
};
