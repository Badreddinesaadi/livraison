-- Migration: support rented (loué) vs company (société) vehicles on voyages.
-- Applied to `mapp_voyage` (the table written by backend/voyage.php).
--
-- A rented voyage has no company chauffeur/vehicle and no starting odometer:
-- the operator instead records the external driver name and the rental company.
-- Existing rows keep the previous behaviour (type_vehicule = 'societe').

ALTER TABLE `mapp_voyage`
  MODIFY COLUMN `idChauffeur` int(11) NULL,
  MODIFY COLUMN `idVehicule` int(11) NULL,
  MODIFY COLUMN `km_depart` int(11) NULL,
  ADD COLUMN `type_vehicule` enum('societe','location') NOT NULL DEFAULT 'societe' AFTER `idVehicule`,
  ADD COLUMN `chauffeur_externe_nom` varchar(100) DEFAULT NULL AFTER `type_vehicule`,
  ADD COLUMN `societe_location_nom` varchar(100) DEFAULT NULL AFTER `chauffeur_externe_nom`,
  ADD KEY `idx_voyage_type_vehicule` (`type_vehicule`);
