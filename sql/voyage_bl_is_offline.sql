-- Migration: offline close-BL trace.
-- Purely informational: records whether a BL was closed while the DLM was offline.
-- No dedup semantics (per product decision) — replay may still duplicate images.
--
-- Applied to `voyage_bl` (the table written by backend/voyage_chauffeur.php).

ALTER TABLE `voyage_bl`
  ADD COLUMN `is_offline` tinyint(1) NOT NULL DEFAULT 0;
