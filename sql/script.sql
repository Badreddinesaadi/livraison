CREATE TABLE `voyage` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `date_depart` datetime NOT NULL,
 `idChauffeur` int(11) NOT NULL,
 `idVehicule` int(11) NOT NULL,
 `km_depart` int(11) NOT NULL,
 `km_retour` int(11) DEFAULT NULL,
 `date_retour` datetime DEFAULT NULL,
 `date_create` datetime DEFAULT CURRENT_TIMESTAMP,
 `idCreate` int(11) NOT NULL,
 `statut` enum('encours','terminer') NOT NULL DEFAULT 'encours',
 `depot_depart` int(11) NOT NULL,
 `idVille` int(11) DEFAULT NULL,
 PRIMARY KEY (`id`),
 KEY `idx_voyage_date` (`date_depart`),
 KEY `idx_voyage_vehicule` (`idVehicule`),
 KEY `idx_voyage_ville` (`idVille`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4

CREATE TABLE `voyage_bl` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `statut` enum('Encours','Livré','') NOT NULL DEFAULT 'Encours',
 `idVoyage` int(11) NOT NULL,
 `idBL` int(11) NOT NULL,
 `coordinates` varchar(200) NOT NULL,
 PRIMARY KEY (`id`),
 KEY `idx_voyage_bl_idBL` (`idBL`)
) ENGINE=InnoDB AUTO_INCREMENT=16498 DEFAULT CHARSET=utf8mb4

CREATE TABLE `voyage_bl_image` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `idVoyageBL` int(11) NOT NULL,
 `nom_fichier` varchar(255) NOT NULL,
 `chemin_fichier` varchar(500) NOT NULL,
  `date_upload` datetime DEFAULT CURRENT_TIMESTAMP,
  `idCreate` int(11) NOT NULL, -- UNUSED
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4


CREATE TABLE `utilisateur` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
  `idSociete` int(11) NOT NULL, -- UNUSED
  `idDepartement` int(11) NOT NULL, -- UNUSED
  `responsable` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `idBm` int(11) NOT NULL, -- UNUSED
  `nom` varchar(30) NOT NULL,
  `prenom` varchar(40) NOT NULL,
  `fonction` varchar(200) NOT NULL, -- UNUSED
  `civilite` enum('M','Mme') NOT NULL DEFAULT 'M', -- UNUSED
  `gsm` varchar(40) NOT NULL, -- UNUSED
  `email` varchar(80) NOT NULL, -- UNUSED
  `idCaisse` int(11) NOT NULL, -- UNUSED
  `idCreate` int(11) NOT NULL, -- UNUSED
  `dateCreate` date NOT NULL, -- UNUSED
  `heureCreate` time NOT NULL, -- UNUSED
  `idModif` int(11) NOT NULL, -- UNUSED
  `dateModif` date NOT NULL, -- UNUSED
  `heureModif` time NOT NULL, -- UNUSED
  `login` varchar(200) NOT NULL, -- UNUSED
  `mot_passe` text NOT NULL, -- UNUSED
  `profile` int(11) NOT NULL, -- UNUSED
  `userJBM` int(11) NOT NULL, -- UNUSED
  `commercials` varchar(50) NOT NULL COMMENT 'Liste des commerciaux à consulter sur les devis', -- UNUSED
  `role` enum('user','parc','dg','rh','admin','tresorier','comptable','rstock','rreception','adv','daf','dc','chauffeur','commercial') NOT NULL DEFAULT 'user',
  `matricule` varchar(15) DEFAULT NULL, -- UNUSED
  `cin` varchar(15) DEFAULT NULL, -- UNUSED
  `dateEmbauche` date DEFAULT NULL, -- UNUSED
  `dateNaissance` date NOT NULL, -- UNUSED
  `adresse` varchar(255) DEFAULT NULL, -- UNUSED
  `RIB` varchar(100) DEFAULT NULL, -- UNUSED
  `cnss` varchar(30) NOT NULL, -- UNUSED
  `user` enum('Oui','Non') DEFAULT 'Non', -- UNUSED
  `photoIdentite` varchar(255) DEFAULT NULL, -- UNUSED
  `ville` varchar(100) DEFAULT NULL, -- UNUSED
  `dashbord` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `dashbord_vm` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `respAch` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `supperAdmin` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `exportation` tinyint(4) NOT NULL DEFAULT '0', -- UNUSED
  `voirCUMP` tinyint(4) NOT NULL DEFAULT '0', -- UNUSED
  `majCUMP` tinyint(4) NOT NULL, -- UNUSED
  `majPV` tinyint(4) NOT NULL, -- UNUSED
  `majColor` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `derniereConnexion` datetime NOT NULL, -- UNUSED
  `desactive` tinyint(4) NOT NULL, -- UNUSED
  `dateDesactive` datetime NOT NULL, -- UNUSED
  `validerCollecte` tinyint(4) NOT NULL DEFAULT '0', -- UNUSED
  `propreClients` enum('Oui','Non') NOT NULL DEFAULT 'Non' COMMENT 'LImiter l''acces a ces propre clients', -- UNUSED
  `inventorierClt` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `validerVV` enum('Oui','Non') NOT NULL DEFAULT 'Non' COMMENT 'Droit de validation des Virements et ou versement', -- UNUSED
  `toutCaisse` enum('Oui','Non') NOT NULL DEFAULT 'Non' COMMENT 'utilisateur a accès a toutes les caisse espece', -- UNUSED
  `cloturerCaisse` enum('Oui','Non') NOT NULL DEFAULT 'Non' COMMENT 'L''utilisateur px cloturer la caisse espece dont il appartient', -- UNUSED
  `verifierEspece` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `validerDevis` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `ajusterAvance` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `dettacherReglement` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `voirEncours` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `majClassification` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `saisirTVA` enum('Oui','Non') DEFAULT 'Non', -- UNUSED
  `masquerPU` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `signature` varchar(100) NOT NULL, -- UNUSED
  `dateMajPwd` datetime NOT NULL, -- UNUSED
  `notifStkAtelier` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `notifReclamationFrs` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `validerBM` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `controleGestion` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `receptionMarketing` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `masquer_espece` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `ValidationRetourChauffeur` enum('Oui','Non') NOT NULL DEFAULT 'Non',
  PRIMARY KEY (`id`),
  KEY `login` (`login`), -- UNUSED
  KEY `idDepartement` (`idDepartement`), -- UNUSED
  KEY `idCreate` (`idCreate`), -- UNUSED
  KEY `profile` (`profile`), -- UNUSED
  KEY `idFonction` (`fonction`), -- UNUSED
  KEY `idBm` (`idBm`), -- UNUSED
  KEY `idSociete` (`idSociete`) -- UNUSED
) ENGINE=InnoDB AUTO_INCREMENT=154 DEFAULT CHARSET=latin1

CREATE TABLE `utilisateur_token` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idUser` int(11) NOT NULL,
  `date_demander_appel` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, -- UNUSED
  `token` text,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=408 DEFAULT CHARSET=latin1
CREATE TABLE `vehicule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) DEFAULT NULL, -- UNUSED
  `immatriculation` varchar(20) DEFAULT NULL,
  `idType` int(11) DEFAULT NULL, -- UNUSED
  `idMarque` int(11) DEFAULT NULL,
 PRIMARY KEY (`id`),
 KEY `idType` (`idType`),
 KEY `idMarque` (`idMarque`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=latin1
CREATE TABLE `marque_vehicule` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `designation` varchar(100) DEFAULT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1


CREATE TABLE `ville` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `designation` varchar(120) NOT NULL,
  `region` varchar(200) NOT NULL, -- UNUSED
  `kmDeCasa` double NOT NULL,
  `idCreate` int(11) NOT NULL, -- UNUSED
  `idModif` int(11) NOT NULL, -- UNUSED
  `dateCreate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, -- UNUSED
  `dateModif` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- UNUSED
  `supp` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `idSupp` int(11) NOT NULL, -- UNUSED
  `dateSupp` datetime NOT NULL, -- UNUSED
 PRIMARY KEY (`id`),
 KEY `idCreate` (`idCreate`)
) ENGINE=MyISAM AUTO_INCREMENT=82 DEFAULT CHARSET=latin1


CREATE TABLE `retour_chauffeur` (
 `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
 `Bl_cachetet` enum('oui','non') NOT NULL DEFAULT 'non',
 `reglement` enum('oui','non') NOT NULL DEFAULT 'non',
 `retour_Mse` enum('oui','non') NOT NULL DEFAULT 'non',
 `reclamation` enum('Retard de livraison','Prix incorrect','Qte incorrecte','Mauvaise qualité','Aucune') NOT NULL,
 `statut` enum('envoyer','terminer','refuser') NOT NULL DEFAULT 'envoyer',
 `client_id` int(11) NOT NULL,
 `chauffeur_id` int(11) DEFAULT NULL,
 `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
 `commentaire` text NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4

CREATE TABLE `retour_chauffeur_image` (
 `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
 `idRetourChaufeur` int(10) unsigned NOT NULL,
 `nom_fichier` varchar(255) NOT NULL,
 `chemin_fichier` varchar(500) NOT NULL,
 `date_upload` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
 `idCreate` int(10) unsigned NOT NULL,
 PRIMARY KEY (`id`),
 KEY `idRetourChaufeur` (`idRetourChaufeur`),
 CONSTRAINT `retour_chauffeur_image_ibfk_1` FOREIGN KEY (`idRetourChaufeur`) REFERENCES `retour_chauffeur` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=152 DEFAULT CHARSET=utf8mb4

CREATE TABLE `rapport_qualite` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `dum` varchar(100) NOT NULL,
 `dossier` varchar(150) NOT NULL,
  `commentaire` text,
  `user_id` int(11) NOT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP, -- UNUSED
  `idCreate` int(11) DEFAULT NULL,
 `idModif` int(11) DEFAULT NULL,
 `dateCreate` datetime DEFAULT CURRENT_TIMESTAMP,
 `dateModif` datetime DEFAULT NULL,
 PRIMARY KEY (`id`),
 KEY `user_id` (`user_id`),
 CONSTRAINT `rapport_qualite_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `utilisateur` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1

CREATE TABLE `rapport_qualite_image` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `idRapportQualite` int(11) NOT NULL,
 `nom_fichier` varchar(255) DEFAULT NULL,
 `chemin_fichier` text,
 `date_upload` datetime DEFAULT CURRENT_TIMESTAMP,
 `idCreate` int(11) DEFAULT NULL,
 PRIMARY KEY (`id`),
 KEY `idRapportQualite` (`idRapportQualite`),
 CONSTRAINT `rapport_qualite_image_ibfk_1` FOREIGN KEY (`idRapportQualite`) REFERENCES `rapport_qualite` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=latin1

CREATE TABLE `projet` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `projet` enum('depot','chantier') NOT NULL,
 `localisation` varchar(255) NOT NULL,
 `commentaire` text,
  `contact_nom` varchar(100) NOT NULL,
  `contact_telephone` varchar(20) NOT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP, -- UNUSED
  `idCreate` int(11) DEFAULT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=latin1

CREATE TABLE `projet_image` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `idProjet` int(11) NOT NULL,
 `nom_fichier` varchar(255) NOT NULL,
 `chemin_fichier` varchar(255) NOT NULL,
 `date_upload` datetime DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (`id`),
 KEY `idProjet` (`idProjet`),
 CONSTRAINT `projet_image_ibfk_1` FOREIGN KEY (`idProjet`) REFERENCES `projet` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=latin1



CREATE TABLE `demandetransfert` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_ancien` int(11) NOT NULL, -- UNUSED
  `reference` varchar(255) NOT NULL,
  `dum` varchar(50) NOT NULL,
  `transporteur` varchar(50) NOT NULL,
  `matricule` varchar(50) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `idDepotSource` int(11) DEFAULT NULL,
  `idDepotDestination` int(11) DEFAULT NULL,
  `idCreate` int(11) DEFAULT NULL,
  `idModif` int(11) NOT NULL, -- UNUSED
  `observation` text,
  `statut` enum('Brouillon','Encours','Envoye','Reçue') DEFAULT 'Brouillon',
  `idValider` int(11) DEFAULT NULL, -- UNUSED
  `dateValider` datetime DEFAULT NULL, -- UNUSED
  `datePreparation` date DEFAULT NULL, -- UNUSED
  `dateValidation` date DEFAULT NULL, -- UNUSED
  `validate_by` int(11) DEFAULT NULL, -- UNUSED
 `idSigneDemamdeur` int(11) NOT NULL,
 `dateSingeDemandeur` datetime NOT NULL,
 `idEnvoie` int(11) NOT NULL,
 `dateEnvoie` datetime NOT NULL,
 `idRecu` int(11) NOT NULL,
 `dateRecu` datetime NOT NULL,
 PRIMARY KEY (`id`),
 KEY `idDepotSource` (`idDepotSource`),
 KEY `idDepotDestination` (`idDepotDestination`),
 KEY `idCreate` (`idCreate`),
 KEY `idValider` (`idValider`),
 KEY `idEnvoie` (`idEnvoie`),
 KEY `idSigneDemamdeur` (`idSigneDemamdeur`),
 KEY `idRecu` (`idRecu`),
 KEY `idModif` (`idModif`),
 KEY `id_ancien` (`id_ancien`)
) ENGINE=InnoDB AUTO_INCREMENT=1540 DEFAULT CHARSET=latin1

CREATE TABLE `demandetransfert_details` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `idDT` int(11) DEFAULT NULL,
  `idSource` int(11) NOT NULL, -- UNUSED
  `idProduit` int(11) NOT NULL,
 `nbrFDX` int(11) DEFAULT NULL,
 `Qte` double DEFAULT NULL,
 `Unite` char(20) DEFAULT NULL,
 `preparer` enum('Non','Oui') DEFAULT 'Non',
 PRIMARY KEY (`id`),
 KEY `idDT` (`idDT`),
 KEY `idProduit` (`idProduit`),
 KEY `Unite` (`Unite`),
 KEY `idSource` (`idSource`)
) ENGINE=InnoDB AUTO_INCREMENT=3355 DEFAULT CHARSET=latin1

CREATE TABLE `transfer_lots` (
 `idItem` int(11) NOT NULL,
 `idProduit` int(11) NOT NULL,
 `Lot` varchar(50) NOT NULL,
 `preparer` enum('Non','Oui') DEFAULT 'Non',
  `qte` double DEFAULT NULL,
  `qte_uv` double NOT NULL, -- UNUSED
 `idModif` int(11) NOT NULL,
 `old_lot` varchar(50) NOT NULL,
 PRIMARY KEY (`idItem`,`idProduit`,`Lot`),
 KEY `idItems` (`idItem`),
 KEY `idProduit` (`idProduit`),
 KEY `idModif` (`idModif`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1


CREATE TABLE `permissions` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `user_id` int(11) DEFAULT NULL,
 `menu_id` int(11) DEFAULT NULL,
 `can_view` tinyint(1) DEFAULT '1',
 `can_create` tinyint(1) DEFAULT '0',
 `can_update` tinyint(1) DEFAULT '0',
 `can_delete` tinyint(1) DEFAULT '0',
 `can_take_picture_bl` tinyint(1) DEFAULT '0',
 `can_close_bl` tinyint(1) DEFAULT '0',
 `can_achever` tinyint(1) DEFAULT '0',
 PRIMARY KEY (`id`),
 KEY `user_id` (`user_id`),
 KEY `menu_id` (`menu_id`),
 CONSTRAINT `permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `utilisateur` (`id`),
 CONSTRAINT `permissions_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1


CREATE TABLE `menus` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `code` varchar(100) NOT NULL,
 `designation` varchar(200) NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1



CREATE TABLE `document` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
 `domaine_id` int(11) NOT NULL, -- UNUSED
  `id_document` varchar(50) NOT NULL,
  `id_type_document` int(11) NOT NULL,
  `id_entreprise` int(11) NOT NULL,
  `id_projet` int(11) NOT NULL, -- UNUSED
  `id_transport` varchar(50) NOT NULL, -- UNUSED
  `id_ancien` int(11) NOT NULL, -- UNUSED
  `id_etat` int(11) NOT NULL, -- UNUSED
  `id_devise` int(11) NOT NULL, -- UNUSED
  `id_user` int(11) NOT NULL, -- UNUSED
  `date_document` int(20) NOT NULL, -- UNUSED
  `datetime_document` datetime NOT NULL,
  `mois_valeur` varchar(200) NOT NULL, -- UNUSED
  `validite` int(20) NOT NULL, -- UNUSED
  `validite_devis` int(11) NOT NULL, -- UNUSED
  `ref_doc` varchar(100) NOT NULL, -- UNUSED
  `ref_ext` varchar(50) NOT NULL, -- UNUSED
  `type_achat` varchar(250) NOT NULL, -- UNUSED
  `avoir_financier` enum('n','y') NOT NULL DEFAULT 'n', -- UNUSED
  `document_bs` enum('n','y','') NOT NULL DEFAULT '', -- UNUSED
  `action_storekeeper` enum('y','n') NOT NULL DEFAULT 'n', -- UNUSED
  `active` enum('y','n') NOT NULL DEFAULT 'n', -- UNUSED
  `print` enum('y','n') NOT NULL DEFAULT 'n', -- UNUSED
  `delai` text, -- UNUSED
  `condition_reg` varchar(100) NOT NULL, -- UNUSED
  `montant_ht` decimal(30,2) NOT NULL, -- UNUSED
  `montant_tva` decimal(30,2) NOT NULL, -- UNUSED
  `montant_ttc` decimal(30,2) NOT NULL, -- UNUSED
  `taux_devise` decimal(30,4) NOT NULL DEFAULT '1.0000', -- UNUSED
  `montant_ht_devise` decimal(30,2) NOT NULL, -- UNUSED
  `montant_tva_devise` decimal(30,2) NOT NULL, -- UNUSED
  `montant_ttc_devise` decimal(30,2) NOT NULL, -- UNUSED
  `solde` decimal(30,2) NOT NULL, -- UNUSED
  `retenu_garantie` decimal(30,2) NOT NULL, -- UNUSED
  `prorata` decimal(30,2) NOT NULL, -- UNUSED
  `assurance` decimal(30,2) NOT NULL, -- UNUSED
  `deduction_details` text NOT NULL, -- UNUSED
  `acompte` decimal(30,2) NOT NULL, -- UNUSED
  `qte_total` varchar(100) NOT NULL, -- UNUSED
  `qte_principale_total` varchar(100) NOT NULL, -- UNUSED
  `qte_restant_total` varchar(100) NOT NULL, -- UNUSED
  `montant_restant_total` float NOT NULL, -- UNUSED
  `code_unite` varchar(100) NOT NULL, -- UNUSED
  `modalitepaiement` text NOT NULL, -- UNUSED
  `moyenpaiement` varchar(50) NOT NULL, -- UNUSED
  `devises` text NOT NULL, -- UNUSED
  `taux_escompte` decimal(30,2) NOT NULL, -- UNUSED
  `escompte` decimal(30,2) NOT NULL, -- UNUSED
  `appliquertva` enum('y','n') NOT NULL DEFAULT 'y', -- UNUSED
  `piece_jointe` varchar(250) NOT NULL, -- UNUSED
  `sujet` text NOT NULL, -- UNUSED
  `note` text NOT NULL, -- UNUSED
  `valeurescompte` varchar(250) NOT NULL DEFAULT 'NODISCOUNT', -- UNUSED
  `action_commercial` text NOT NULL, -- UNUSED
  `provenance` int(11) NOT NULL, -- UNUSED
  `sous_type_exist` enum('y','n') NOT NULL DEFAULT 'n', -- UNUSED
  `tvaintra` varchar(50) NOT NULL, -- UNUSED
  `exo_tva` enum('0','1') NOT NULL DEFAULT '0', -- UNUSED
  `ref_for_accompte` int(11) NOT NULL DEFAULT '0', -- UNUSED
  `sended_mail` enum('0','1') NOT NULL DEFAULT '0', -- UNUSED
  `order_jbm` varchar(100) NOT NULL, -- UNUSED
  `reference_piece` varchar(250) NOT NULL, -- UNUSED
  `libelle_piece` varchar(250) DEFAULT NULL, -- UNUSED
  `description_piece` varchar(250) DEFAULT NULL, -- UNUSED
  `numero_piece` varchar(250) NOT NULL, -- UNUSED
  `type_piece` varchar(200) NOT NULL DEFAULT 'fournisseur', -- UNUSED
  `comptabilise` enum('y','n') NOT NULL DEFAULT 'n', -- UNUSED
  `canceled` enum('y','n') NOT NULL DEFAULT 'n', -- UNUSED
  `insert_mode` varchar(50) NOT NULL, -- UNUSED
  `facturation_ht` enum('y','n') NOT NULL DEFAULT 'y', -- UNUSED
  `num_dossier` varchar(100) NOT NULL, -- UNUSED
  `clos` enum('y','n') NOT NULL DEFAULT 'n', -- UNUSED
  `total_charges` decimal(30,4) NOT NULL, -- UNUSED
  `total_marge` decimal(30,2) NOT NULL, -- UNUSED
  `calculate_cost` int(11) NOT NULL, -- UNUSED
  `k_approche` decimal(30,4) NOT NULL DEFAULT '1.0000', -- UNUSED
  `k_approche_c` decimal(30,4) NOT NULL DEFAULT '1.0000', -- UNUSED
  `k_approche_plus` decimal(30,4) NOT NULL, -- UNUSED
  `launch_trigger` int(11) NOT NULL DEFAULT '0', -- UNUSED
  `generated_from_reception` enum('n','y') NOT NULL DEFAULT 'n', -- UNUSED
  `validate_document` enum('n','y','r','w','c','v') NOT NULL DEFAULT 'y', -- UNUSED
  `validate_by` text NOT NULL, -- UNUSED
  `generate_bl_from_reception` enum('n','y') NOT NULL DEFAULT 'n', -- UNUSED
  `montant_taxes` decimal(30,0) NOT NULL, -- UNUSED
  `amo_json` text NOT NULL, -- UNUSED
  `emplacement` varchar(200) DEFAULT NULL, -- UNUSED
  `external_id` varchar(50) NOT NULL, -- UNUSED
  `compta` enum('encours','non conforme','comptabilise') NOT NULL DEFAULT 'encours', -- UNUSED
  `treso` enum('encours','regle') NOT NULL DEFAULT 'encours', -- UNUSED
  `statut_devis` enum('encours','valider','preparer','refuser') NOT NULL DEFAULT 'encours', -- UNUSED
  `dateValidation` datetime NOT NULL, -- UNUSED
  `datePreparation` datetime NOT NULL, -- UNUSED
  `importer` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `modification_proforma` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, -- UNUSED
  `etat_facture` enum('estime','reel') NOT NULL DEFAULT 'estime', -- UNUSED
  `facturer` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `solde_a_facturee` double NOT NULL, -- UNUSED
  `type_facturation` enum('Conforme','Non conforme') DEFAULT NULL, -- UNUSED
  `idComforme` int(11) NOT NULL, -- UNUSED
  `dateComforme` datetime NOT NULL, -- UNUSED
  `avoir_cree` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  PRIMARY KEY (`id`) USING BTREE,
  KEY `id_entreprise` (`id_entreprise`),
  KEY `id_projet_id_ancien_id_user` (`id_projet`,`id_ancien`,`id_user`), -- UNUSED
  KEY `id` (`id`),
  KEY `id_type_document` (`id_type_document`),
  KEY `domaine_id` (`domaine_id`), -- UNUSED
  KEY `id_etat` (`id_etat`), -- UNUSED
  KEY `id_devise` (`id_devise`), -- UNUSED
  KEY `num_dossier` (`num_dossier`), -- UNUSED
  KEY `idComforme` (`idComforme`), -- UNUSED
  KEY `id_document` (`id_document`),
  KEY `idx_document_type_id` (`id_type_document`,`id_entreprise`,`id_document`), -- UNUSED
  KEY `id_2` (`id`,`id_type_document`), -- UNUSED
  KEY `id_3` (`id`,`id_type_document`,`id_entreprise`), -- UNUSED
  KEY `id_4` (`id`,`id_document`,`id_type_document`,`id_entreprise`,`datetime_document`) -- UNUSED
) ENGINE=InnoDB AUTO_INCREMENT=62193 DEFAULT CHARSET=utf8



CREATE TABLE `document_items` (
  `id_item` int(11) NOT NULL AUTO_INCREMENT,
  `domaine_id` int(11) NOT NULL, -- UNUSED
  `id_document` int(11) NOT NULL,
  `id_depot` int(11) NOT NULL, -- UNUSED
  `idproduit` int(250) NOT NULL,
  `ref_produit` varchar(200) NOT NULL, -- UNUSED
  `num_prix` varchar(200) NOT NULL, -- UNUSED
  `objet` text NOT NULL, -- UNUSED
  `delai` varchar(200) NOT NULL, -- UNUSED
  `quantity` varchar(20) NOT NULL, -- UNUSED
  `quantity_unit_principale` varchar(20) NOT NULL, -- UNUSED
  `multiplicateur` varchar(50) NOT NULL DEFAULT '1', -- UNUSED
  `prixunitaire` varchar(255) NOT NULL, -- UNUSED
  `prixunitaire_devise` varchar(255) NOT NULL, -- UNUSED
  `prixunitaire_ttc` varchar(255) NOT NULL, -- UNUSED
  `prixunitaire_ttc_devise` varchar(255) NOT NULL, -- UNUSED
  `prixunitaire_up` varchar(255) NOT NULL, -- UNUSED
  `prixunitaire_up_devise` varchar(255) NOT NULL, -- UNUSED
  `unite` int(11) NOT NULL, -- UNUSED
  `id_unite_principale` int(11) NOT NULL, -- UNUSED
  `coefficient` float NOT NULL, -- UNUSED
  `code_unite` varchar(255) NOT NULL, -- UNUSED
  `id_tauxtva` int(11) NOT NULL, -- UNUSED
  `tauxtva` varchar(10) NOT NULL, -- UNUSED
  `montant_tva` varchar(255) NOT NULL DEFAULT '0', -- UNUSED
  `totalht` varchar(255) NOT NULL DEFAULT '0', -- UNUSED
  `total` varchar(255) NOT NULL DEFAULT '', -- UNUSED
  `total_ttc` varchar(255) NOT NULL DEFAULT '', -- UNUSED
  `montant_tva_devise` varchar(255) NOT NULL DEFAULT '', -- UNUSED
  `total_devise` varchar(255) NOT NULL DEFAULT '0', -- UNUSED
  `total_ttc_devise` varchar(255) NOT NULL DEFAULT '', -- UNUSED
  `totalht_devise` varchar(255) NOT NULL DEFAULT '0', -- UNUSED
  `cump` decimal(30,2) NOT NULL, -- UNUSED
  `stock` enum('r','y','n') NOT NULL DEFAULT 'r', -- UNUSED
  `marge` decimal(30,2) NOT NULL, -- UNUSED
  `remise` decimal(30,2) NOT NULL, -- UNUSED
  `pos` text NOT NULL, -- UNUSED
  `ref` int(11) NOT NULL, -- UNUSED
  `type` varchar(20) NOT NULL, -- UNUSED
  `classement` varchar(100) NOT NULL, -- UNUSED
  `transformer` enum('0','1') NOT NULL DEFAULT '0', -- UNUSED
  `quantity_restante` decimal(30,5) NOT NULL DEFAULT '0.00000', -- UNUSED
  `totalht_restant` decimal(30,2) NOT NULL COMMENT 'valeur saisie par user ', -- UNUSED
  `etat` enum('v','a','u','d') NOT NULL DEFAULT 'a', -- UNUSED
  `old_value` text NOT NULL, -- UNUSED
  `compte_comptable` varchar(50) NOT NULL, -- UNUSED
  `compte_tva` varchar(50) NOT NULL, -- UNUSED
  `montant_patronal` decimal(30,2) NOT NULL, -- UNUSED
  `compte_patronal` varchar(100) NOT NULL DEFAULT '', -- UNUSED
  `part_salariale` enum('n','y') NOT NULL DEFAULT 'y', -- UNUSED
  `part_patronale` enum('n','y') NOT NULL DEFAULT 'n', -- UNUSED
  `generated_item` enum('n','y') NOT NULL DEFAULT 'n', -- UNUSED
  `launch_trigger` int(11) NOT NULL DEFAULT '0', -- UNUSED
  `insert_mode` varchar(50) NOT NULL, -- UNUSED
  `json_sl` text COMMENT 'Liste series/lots', -- UNUSED
  `more_infos` text NOT NULL, -- UNUSED
  `preparer` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
  `solde_ligne` double NOT NULL, -- UNUSED
 PRIMARY KEY (`id_item`),
 KEY `id_item` (`id_item`),
 KEY `domaine_id` (`domaine_id`),
 KEY `id_document` (`id_document`),
 KEY `idproduit` (`idproduit`),
 KEY `ref` (`ref`),
 KEY `unite` (`unite`),
 KEY `id_unite_principale` (`id_unite_principale`),
 KEY `idx_document_items_document_produit` (`id_document`,`idproduit`),
 KEY `id_document_2` (`id_document`,`idproduit`)
) ENGINE=InnoDB AUTO_INCREMENT=185600 DEFAULT CHARSET=utf8



CREATE TABLE `partenaires` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `domaine_id` int(11) NOT NULL, -- UNUSED
  `compte_collectif` int(11) DEFAULT NULL, -- UNUSED
  `compte_acompte` int(11) NOT NULL, -- UNUSED
  `compte_douteux` int(11) DEFAULT NULL, -- UNUSED
  `compte_tiers` varchar(20) NOT NULL COMMENT 'compte specifique du tier', -- UNUSED
  `compte_tiers_bs` varchar(20) NOT NULL, -- UNUSED
  `compte_comptable` varchar(50) NOT NULL COMMENT 'compte comptable doit figurer dans le plan comptable', -- UNUSED
  `type_societe` enum('prospect','client','fournisseur') NOT NULL DEFAULT 'client', -- UNUSED
  `genre` enum('personne','societe') NOT NULL DEFAULT 'societe', -- UNUSED
  `societe` varchar(200) NOT NULL,
  `fname` varchar(200) NOT NULL, -- UNUSED
  `lname` varchar(200) NOT NULL, -- UNUSED
  `civility` varchar(50) NOT NULL, -- UNUSED
  `telephone` varchar(100) NOT NULL, -- UNUSED
  `telephone2` varchar(100) NOT NULL, -- UNUSED
  `fax` varchar(100) NOT NULL, -- UNUSED
  `mail` varchar(200) NOT NULL, -- UNUSED
  `adresse` varchar(250) NOT NULL, -- UNUSED
  `adresse2` varchar(255) NOT NULL, -- UNUSED
  `code_postal` varchar(50) DEFAULT NULL, -- UNUSED
  `ville` varchar(50) NOT NULL, -- UNUSED
  `pays` varchar(50) DEFAULT NULL, -- UNUSED
  `site_web` varchar(30) DEFAULT NULL, -- UNUSED
  `logo` varchar(50) DEFAULT NULL, -- UNUSED
  `commercial` int(11) NOT NULL, -- UNUSED
  `recouvreur` varchar(250) NOT NULL, -- UNUSED
  `tvaintracom` varchar(255) NOT NULL, -- UNUSED
  `activite` int(255) DEFAULT '0', -- UNUSED
  `region` int(255) DEFAULT '0', -- UNUSED
  `id_devise` int(11) NOT NULL, -- UNUSED
  `autreinfos` text NOT NULL, -- UNUSED
  `provenance_societe` int(50) DEFAULT '0', -- UNUSED
  `categorie_societe` int(50) DEFAULT '0', -- UNUSED
  `mem_adresse` enum('y','n') NOT NULL DEFAULT 'y', -- UNUSED
  `adresse_livraison` varchar(100) DEFAULT NULL, -- UNUSED
  `adresse2_livraison` varchar(50) NOT NULL, -- UNUSED
  `code_postal_livraison` varchar(20) DEFAULT NULL, -- UNUSED
  `ville_livraison` varchar(200) DEFAULT NULL, -- UNUSED
  `pays_livraison` varchar(200) DEFAULT NULL, -- UNUSED
  `date_creation` int(11) NOT NULL, -- UNUSED
  `ice_code` varchar(200) NOT NULL, -- UNUSED
  `if_code` varchar(200) NOT NULL, -- UNUSED
  `rc_code` varchar(200) NOT NULL, -- UNUSED
  `active` enum('0','1') NOT NULL DEFAULT '1', -- UNUSED
  `doubted` enum('y','n') NOT NULL DEFAULT 'n', -- UNUSED
  `providercost` enum('y','n') NOT NULL DEFAULT 'n', -- UNUSED
  `text1` text, -- UNUSED
  `text2` text, -- UNUSED
  `text3` text, -- UNUSED
  `text4` text, -- UNUSED
  `more_text` text, -- UNUSED
  `solde` decimal(30,2) NOT NULL DEFAULT '0.00', -- UNUSED
  `plafond` decimal(30,2) NOT NULL, -- UNUSED
  `plafond_impaye` decimal(30,2) NOT NULL, -- UNUSED
  `total_impaye` decimal(30,2) NOT NULL, -- UNUSED
  `solde_opening` float NOT NULL DEFAULT '0', -- UNUSED
  `ca_ht` decimal(30,2) NOT NULL, -- UNUSED
  `transorme_aclient` enum('y','n') NOT NULL DEFAULT 'n', -- UNUSED
  `filter_name_import` varchar(250) NOT NULL, -- UNUSED
  `client_id_jbm` int(11) NOT NULL, -- UNUSED
  `accountant_update` enum('0','1') NOT NULL DEFAULT '0', -- UNUSED
  `piece_jointe` varchar(250) NOT NULL, -- UNUSED
  `id_condition_reg` int(11) NOT NULL, -- UNUSED
  `encours_bs` decimal(30,2) NOT NULL, -- UNUSED
  `encours_terme` decimal(30,2) NOT NULL, -- UNUSED
  `en_traitement` decimal(30,2) NOT NULL, -- UNUSED
  `impaye_non_regle` decimal(30,2) NOT NULL, -- UNUSED
  `delai_paiement` decimal(30,2) NOT NULL, -- UNUSED
  `ca_encours` decimal(30,2) NOT NULL, -- UNUSED
  `banks` text, -- UNUSED
  `dossier_transport` enum('y','n') NOT NULL DEFAULT 'n', -- UNUSED
  `code_transport` varchar(50) NOT NULL, -- UNUSED
  `client_principal_transport` enum('y','n') NOT NULL DEFAULT 'n', -- UNUSED
  `transitaire_id` int(11) NOT NULL, -- UNUSED
  `external_id` varchar(50) NOT NULL, -- UNUSED
  `commercial2` int(11) NOT NULL, -- UNUSED
  `objectif_com` double NOT NULL, -- UNUSED
  `plafond_acmar` double NOT NULL DEFAULT '0', -- UNUSED
  `client_conforme` enum('Oui','Non') NOT NULL DEFAULT 'Non', -- UNUSED
 PRIMARY KEY (`id`),
 KEY `domaine_id_activite_region_provenance_societe_categorie_societe` (`domaine_id`,`activite`,`region`,`provenance_societe`,`categorie_societe`),
 KEY `commercial2` (`commercial2`),
 KEY `id` (`id`),
 KEY `transitaire_id` (`transitaire_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2790 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC