# Graph Report - sdk-app-v2  (2026-09-28)

## Corpus Check
- Large corpus: 368 files · ~567,358 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 2044 nodes · 4090 edges · 171 communities (141 shown, 30 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 434 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Demande Transfert API
- Auth & App Shell
- RVT Reference Data
- App Routing & Drawer
- Stack Layouts
- Projet Location API
- Return API
- Expo Dependencies
- Reference Data & Clients
- Quality Report API
- UML Data Model
- Expo App Config
- Product & Lots API
- Visit Details & Photos
- Conceptual Data Model
- Backend Architecture Diagram
- Reusable Card Components
- Nested Stack Layouts
- Voyage Postman Requests
- Package Manifest
- RVT Module Docs
- RVT Analytics
- Project Structure Docs
- Gantt Project Timeline
- Sprint Planning Timeline
- Close BL Store
- Transfer Request Use Cases
- BL & Chauffeur Samples
- Lieux de Projets Use Cases
- Quality Report Sequence
- Transfer Request Workflow
- Project Locations Sequence
- Edit & Create Screens
- Visits API
- Rounds API
- Product Lots Workflow
- Rotation Sequence
- Returns Use Cases
- Voyage API
- Transfer Request Sequence
- Rotation List UI
- BL Selection & API
- Quality Reports Sequence
- Return Card UI
- Voyage Creation Sequence
- Voyage Use Cases
- API Module Overview
- Rotation Chauffeur API
- Auth & Delete Sheets
- Camera Screen
- Return Capture Sequence
- Return Validation Flow
- Layouts & Offline Notice
- Home Screen UI
- Lot Preparation Permission
- Scrum Process
- Quality Report Use Cases
- Returns List UI
- Button Component
- RVT Tournee Collection
- Quality/Return Endpoints
- Create Location Sequence
- Transfer Request Actions
- Quality Report Card UI
- Return Details Card UI
- Create Voyage Form
- Voyage Confirmation Step
- RVT Sheet Store
- Product Preparation UI
- Locations List UI
- Return Details Screen
- Returns Filter Sheet
- NPM Scripts
- PDF Download Utilities
- Reference Data APIs
- Quality Reports List
- Voyage Details Screen
- Transport Card UI
- New Transfer Request Form
- Manage Lots Sheet
- Lieux Card UI
- Create Lieu Form
- Create Report Form
- Rotations Filter Sheet
- Return Summary Card
- BL Selection Step
- Ville & Chauffeur Selection
- Voyage Summary Screen
- OAuth Authorization Model
- Drawer Menu UI
- Transfer Request List UI
- Login Failure Screen
- Login Screen UI
- Report Delete Confirmation
- Reports List Offline
- Rotation Use Cases
- Trip Completion Modal
- Delivery Proof Capture
- TypeScript Config
- Create Return Form
- Return Validation Dialog
- ESLint Config
- Android Studio Logo
- Lumber Yard Photo
- Forklift Logistics Photo
- Samsara Logo
- Voyage Bottom Sheet
- Dev Dependencies
- Project Locations Postman
- Transfer Request Endpoints
- Apache Logo
- Project Location Server Sequence
- Prepare Lot Confirmation
- Git Logo
- GitHub Repository
- phpMyAdmin Logo
- React Native Logo
- Return Delete Dialog
- Voyage Delete Dialog
- Transfer Detail Endpoints
- Product Lots Endpoints
- Expo Logo
- Adaptive Icon Template
- App Icon Asset
- SDK WOOD Logo
- Splash Icon Light
- MySQL Logo
- Postman Logo
- Onfleet Logo
- SDK WOOD Brand Logo
- BL Action Bottom Sheet
- VS Code Logo
- External Link Component
- Metro Config
- Auth Postman Requests
- Visit Photo Utilities
- Clients Endpoints
- Android Foreground Icon
- React Logo Variants
- SDKWood Adaptive Icon
- Splash Icon Motif
- PHP Logo
- HelloWave Component
- Icon Symbol
- Project Planning Notes
- Dashboard Analytics
- Rounds Visits Endpoint
- GitHub Logo
- Monochrome Icon
- Partial React Logo
- React Logo
- React Logo Variant
- SDKWood Adaptive Icon 3
- Returns Use Case Diagram
- Postman Workspace
- Chauffeur/Clients Requests
- Vehicle/Ville Requests
- Auth Module Docs
- Visit Deletion
- Gitignore
- Favicon Icon
- Quality Reports Use Case
- TypeScript Logo
- Return Validation Sequence
- Voyages Use Case
- Auth Collection
- List Depots Request
- Quality Report Collection
- Return Collection
- Transfer Request Collection

## God Nodes (most connected - your core abstractions)
1. `react-native` - 87 edges
2. `useSession()` - 75 edges
3. `react` - 64 edges
4. `@expo/vector-icons` - 59 edges
5. `Button()` - 48 edges
6. `expo-router` - 46 edges
7. `PRIMARY` - 42 edges
8. `@tanstack/react-query` - 40 edges
9. `react-native-toast-message` - 33 edges
10. `Loader()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `Module Voyages` --semantically_similar_to--> `Voyage Module Permissions`  [INFERRED] [semantically similar]
  prompt.txt → todo-rapport.txt
- `Module Retours Chauffeur` --semantically_similar_to--> `Retour Module Permissions`  [INFERRED] [semantically similar]
  prompt.txt → todo-rapport.txt
- `Module Rapports Qualité` --semantically_similar_to--> `Rapport Qualité Module Permissions`  [INFERRED] [semantically similar]
  prompt.txt → todo-rapport.txt
- `Module Rotation Chauffeur` --semantically_similar_to--> `Rotation Chauffeur Module Permissions`  [INFERRED] [semantically similar]
  prompt.txt → todo-rapport.txt
- `Module Lieux de Projets` --semantically_similar_to--> `Lieux Projets Module Permissions`  [INFERRED] [semantically similar]
  prompt.txt → todo-rapport.txt

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **RVT visit lifecycle flow** — api_docs_rvt_module_rapport_visite_terrain, api_docs_rvt_module_visite, api_docs_rvt_module_tournee, api_docs_rvt_openapi_createvisit, api_docs_rvt_openapi_createround [INFERRED 0.85]
- **SDKWOOD homescreen PHP API modules** — doc_demande_transfert_api, doc_lieux_projets_api, doc_rapports_qualite_api, doc_retours_api, doc_rotation_chauffeur_api, doc_voyages_api [INFERRED 0.85]
- **Postman HTTP example fixtures** — postman_postman_collections_sdkwood_app__resources_list_bls_resources_examples_list_bls_example, postman_postman_collections_sdkwood_app__resources_list_chauffeurs_resources_examples_list_chauffeurs_example, postman_postman_collections_sdkwood_app__resources_list_clients_resources_examples_list_clients_example, postman_postman_collections_sdkwood_app__resources_list_depots_resources_examples_list_depots_example, postman_postman_collections_sdkwood_app__resources_list_vehicles_resources_examples_list_vehicles_example, postman_postman_collections_sdkwood_app__resources_list_villes_resources_examples_list_villes_example [INFERRED 0.85]
- **Authentication Login Flow** — postman_postman_collections_sdkwood_app_auth_login_request, postman_postman_collections_sdkwood_app_auth_login_chauffeur_request, postman_postman_collections_sdkwood_app_auth_get_current_user_request, postman_postman_collections_sdkwood_app_auth__resources_login_resources_examples_login_example [INFERRED 0.90]
- **Project Locations CRUD Operations** — postman_postman_collections_sdkwood_app_project_locations_create_project_locations_request, postman_postman_collections_sdkwood_app_project_locations_delete_project_locations_request, postman_postman_collections_sdkwood_app_project_locations_list_project_locations_request, postman_postman_collections_sdkwood_app_project_locations_update_project_locations_request [INFERRED 0.90]
- **Rounds API Flow** — postman_postman_collections_sdkwood_app_rapport_de_visite_terrain_analytics_request, postman_postman_collections_sdkwood_app_rapport_de_visite_terrain_tourn_e_close_tourn_e_request, postman_postman_collections_sdkwood_app_rapport_de_visite_terrain_tourn_e_create_tourn_e_request, postman_postman_collections_sdkwood_app_rapport_de_visite_terrain_tourn_e_list_tourn_e_request, postman_postman_collections_sdkwood_app_rapport_de_visite_terrain_visits_add_photo_to_visit_request, postman_postman_collections_sdkwood_app_rapport_de_visite_terrain_visits_create_visits_request [INFERRED 0.85]
- **Rapport Quality Collection Requests** — postman_postman_collections_sdkwood_app_rapport_quality__resources_definition, postman_postman_collections_sdkwood_app_rapport_quality__resources_list_rq_resources_examples_list_return_example, postman_postman_collections_sdkwood_app_rapport_quality_create_rq_request, postman_postman_collections_sdkwood_app_rapport_quality_delete_rq_request, postman_postman_collections_sdkwood_app_rapport_quality_list_rq_request [INFERRED 0.85]
- **Return Collection Requests** — postman_postman_collections_sdkwood_app_return__resources_definition, postman_postman_collections_sdkwood_app_return__resources_list_return_resources_examples_list_return_1_example, postman_postman_collections_sdkwood_app_return__resources_list_return_resources_examples_list_return_example, postman_postman_collections_sdkwood_app_return_create_return_request, postman_postman_collections_sdkwood_app_return_delete_return_request, postman_postman_collections_sdkwood_app_return_list_produits_request, postman_postman_collections_sdkwood_app_return_list_return_request [INFERRED 0.85]
- **Transfert Demande Collection Requests** — postman_postman_collections_sdkwood_app_transfert_demande__resources_definition, postman_postman_collections_sdkwood_app_transfert_demande__resources_create_transport_resources_examples_create_transport_example, postman_postman_collections_sdkwood_app_transfert_demande__resources_list_transfert_resources_examples_list_transfert_example, postman_postman_collections_sdkwood_app_transfert_demande__resources_list_validation_transfert_resources_examples_list_transfert_example, postman_postman_collections_sdkwood_app_transfert_demande_create_product_in_dt_request, postman_postman_collections_sdkwood_app_transfert_demande_create_transport_request, postman_postman_collections_sdkwood_app_transfert_demande_delete_product_from_dt_request, postman_postman_collections_sdkwood_app_transfert_demande_details_demande_transfert_request, postman_postman_collections_sdkwood_app_transfert_demande_get_lots_of_product_request [INFERRED 0.85]
- **Voyage CRUD Endpoints (voyage.php)** — postman_postman_collections_sdkwood_app_voyage_create_voyage_request, postman_postman_collections_sdkwood_app_voyage_delete_voyage_request, postman_postman_collections_sdkwood_app_voyage_list_voyages_request, postman_postman_collections_sdkwood_app_voyage_update_voyage_request [INFERRED 0.85]
- **Demande de Transfert Flow** — postman_postman_collections_sdkwood_app_transfert_demande_list_transfert_request, postman_postman_collections_sdkwood_app_transfert_demande_list_validation_transfert_request, postman_postman_collections_sdkwood_app_transfert_demande_modify_lots_of_product_in_dt_request [INFERRED 0.75]
- **SDKWOOD Role Permission Model** — todo_rapport_roles_permissions, todo_rapport_voyage_permissions, todo_rapport_retour_permissions, todo_rapport_rapport_qualite_permissions, todo_rapport_rotation_chauffeur_permissions, todo_rapport_lieux_projets_permissions, todo_rapport_demande_transfert_permissions [EXTRACTED 1.00]
- **Android Studio Logo Brand Symbols** — assets_android_studio_logo, assets_android_studio_logo_android_studio, assets_android_studio_logo_android_robot, assets_android_studio_logo_drafting_compass [INFERRED 0.85]
- **Apache Visual Identity System** — assets_apache_logo, assets_apache_logo_apache_feather, assets_apache_logo_apache_software_foundation, assets_apache_logo_trademark_mark [INFERRED 0.75]
- **Token Based Authentication Flow Participants** — assets_auth_flow_uml_user, assets_auth_flow_uml_client, assets_auth_flow_uml_authorization_server, assets_auth_flow_uml_resource_server [EXTRACTED 1.00]
- **Authentication Artifacts Exchanged** — assets_auth_flow_uml_password, assets_auth_flow_uml_token, assets_auth_flow_uml_resource [INFERRED 0.85]
- **Transfer Request Workflow** — backend_demande_transfert, backend_details_demande_transfert, backend_preparation_transfert, backend_validation_transfert [INFERRED 0.85]
- **Voyage / Driver Workflow** — backend_voyage, backend_voyage_chauffeur, backend_bl_voyage_list, backend_rotation_chauffeur, backend_retour_chauffeur [INFERRED 0.85]
- **Backend PHP Module** — backend_projet, backend_rapport_qualite, backend_voyage, backend_demande_transfert [INFERRED 0.65]
- **Flux de création d'une demande de transfert** — assets_creer_demande_transfert_saisie_du_formulaire, assets_creer_demande_transfert_soumission, assets_creer_demande_transfert_verifications, assets_creer_demande_transfert_generation_de_la_reference, assets_creer_demande_transfert_enregistrement_de_la_demande [INFERRED 0.85]
- **Acteurs du diagramme de séquence** — assets_creer_demande_transfert_utilisateur, assets_creer_demande_transfert_application_mobile, assets_creer_demande_transfert_serveur, assets_creer_demande_transfert_base_de_donnees [EXTRACTED 1.00]
- **Participants du flux de création de lieu** — assets_creer_lieu_projet_utilisateur, assets_creer_lieu_projet_application_mobile, assets_creer_lieu_projet_serveur_projet_php, assets_creer_lieu_projet_base_de_donnees [EXTRACTED 1.00]
- **Phases séquentielles de création de lieu** — assets_creer_lieu_projet_saisie_du_formulaire, assets_creer_lieu_projet_capture_de_la_position, assets_creer_lieu_projet_prise_de_photo_optionnelle, assets_creer_lieu_projet_soumission, assets_creer_lieu_projet_verifications, assets_creer_lieu_projet_enregistrement_du_lieu, assets_creer_lieu_projet_sauvegarde_des_fichiers [EXTRACTED 1.00]
- **Persistance transactionnelle du lieu et des fichiers** — assets_creer_lieu_projet_enregistrement_du_lieu, assets_creer_lieu_projet_sauvegarde_des_fichiers, assets_creer_lieu_projet_transaction [EXTRACTED 1.00]
- **BL Photo Capture and Selection Flow** — assets_voyages_use_case_modifier_un_voyage, assets_voyages_use_case_creer_un_voyage, assets_voyages_use_case_achever_un_voyage, assets_voyages_use_case_prendre_des_photos_des_bls, assets_voyages_use_case_selectionner_des_bls [EXTRACTED 1.00]
- **Voyage Listing and Consultation Flow** — assets_voyages_use_case_lister_les_voyages, assets_voyages_use_case_filtrer_les_voyages, assets_voyages_use_case_rechercher_un_voyage, assets_voyages_use_case_consulter_les_details_d_un_voyage [EXTRACTED 1.00]
- **VS Code Logo Brand Identity** — assets_vscode_logo, assets_vscode_logo_visual_studio_code_brand_mark, assets_vscode_logo_blue_angular_fold, assets_vscode_logo_visual_studio_code [INFERRED 0.85]
- **Flux de création d'un rapport qualité** — assets_creer_rapport_qualite_saisie_du_formulaire, assets_creer_rapport_qualite_prise_de_photo_fichiers, assets_creer_rapport_qualite_soumission, assets_creer_rapport_qualite_verifications, assets_creer_rapport_qualite_enregistrement_du_rapport, assets_creer_rapport_qualite_sauvegarde_des_fichiers [EXTRACTED 1.00]
- **Participants du diagramme de séquence** — assets_creer_rapport_qualite_utilisateur, assets_creer_rapport_qualite_application_mobile, assets_creer_rapport_qualite_serveur_rapport_qualite_php, assets_creer_rapport_qualite_base_de_donnees [EXTRACTED 1.00]
- **Champs enregistrés du rapport qualité** — assets_creer_rapport_qualite_reference_dum, assets_creer_rapport_qualite_reference_dossier, assets_creer_rapport_qualite_commentaire [EXTRACTED 1.00]
- **Créer un retour end-to-end sequence flow** — assets_creer_retour_utilisateur, assets_creer_retour_application_mobile, assets_creer_retour_serveur_retour_chauffeur_php, assets_creer_retour_base_de_donnees, assets_creer_retour_saisie_formulaire, assets_creer_retour_prise_de_photo_fichiers, assets_creer_retour_soumission, assets_creer_retour_verifications, assets_creer_retour_enregistrement_retour, assets_creer_retour_sauvegarde_fichiers [EXTRACTED 1.00]
- **Included use cases of the transfer request module** — assets_demande_transfert_use_case_confirmer_la_preparation_produit_lot, assets_demande_transfert_use_case_selectionner_un_produit_catalogue, assets_demande_transfert_use_case_selectionner_un_depot_source_destination, assets_demande_transfert_use_case_confirmer_la_suppression_d_une_demande, assets_demande_transfert_use_case_confirmer_la_suppression_d_un_produit [EXTRACTED 1.00]
- **Extending use cases of the transfer request module** — assets_demande_transfert_use_case_rechercher_une_demande, assets_demande_transfert_use_case_gerer_les_lots_d_un_produit, assets_demande_transfert_use_case_ajouter_un_produit [EXTRACTED 1.00]
- **Actors of the transfer request module** — assets_demande_transfert_use_case_responsable_de_stock, assets_demande_transfert_use_case_magasinier, assets_demande_transfert_use_case_adv_agent_des_ventes, assets_demande_transfert_use_case_module_demande_de_transfert [INFERRED 0.85]
- **Drawer Navigation Menu Items** — assets_drawer_menu_voyages, assets_drawer_menu_retours, assets_drawer_menu_rapports_qualite, assets_drawer_menu_rotation_chauffeur, assets_drawer_menu_demande_de_transfert [EXTRACTED 1.00]
- **Expanded Transport Card Field Panel** — assets_dt_card_expanded_transport_card, assets_dt_card_expanded_detail_row, assets_dt_card_expanded_depot_reference, assets_dt_card_expanded_observation_field, assets_dt_card_expanded_audit_metadata [INFERRED 0.85]
- **Transfer Request Form Fields** — assets_dt_create_depot_source, assets_dt_create_depot_destination, assets_dt_create_dum, assets_dt_create_transporteur, assets_dt_create_matricule, assets_dt_create_observation [EXTRACTED 1.00]
- **Transfer Request Deletion Flow** — assets_dt_delete_delete_action_supprimer, assets_dt_delete_delete_confirmation_sheet, assets_dt_delete_cancel_action_annuler, assets_dt_delete_transfer_request_dt2026004 [INFERRED 0.85]
- **Demande header data fields** — assets_dt_details_demande_dt2026004, assets_dt_details_depot_source, assets_dt_details_depot_destination, assets_dt_details_transporteur, assets_dt_details_matricule, assets_dt_details_dum [INFERRED 0.85]
- **Product lot preparation status flow** — assets_dt_details_produit_hetre_italy_50, assets_dt_details_lots_section, assets_dt_details_lot_2025_13513, assets_dt_details_lot_2025_14673, assets_dt_details_lot_2025_15143, assets_dt_details_statut_prepare [INFERRED 0.85]
- **Transfer Request List UI Composition** — assets_dt_list_transfer_request_list, assets_dt_list_transfer_request_item, assets_dt_list_transfer_icon, assets_dt_list_status_brouillon, assets_dt_list_status_recue [INFERRED 0.85]
- **Lot Management Flow** — assets_dt_manage_lots_gerer_les_lots, assets_dt_manage_lots_lot_selection_list, assets_dt_manage_lots_lot_card, assets_dt_manage_lots_enregistrer_action [INFERRED 0.85]
- **Lot Row Visual Language** — assets_dt_manage_lots_lot_card, assets_dt_manage_lots_actuel_badge, assets_dt_manage_lots_lot_selection [INFERRED 0.75]
- **Lot Preparation Flow** — assets_dt_preparer_lot, assets_dt_preparer_lot_lot, assets_dt_preparer_lot_statut_prepare [INFERRED 0.85]
- **Lots of Product Marked as Prepared** — assets_dt_preparer_produit_lot_2025_13513, assets_dt_preparer_produit_lot_2025_14673, assets_dt_preparer_produit_lot_2025_15143, assets_dt_preparer_produit_status_prepare [EXTRACTED 1.00]
- **Prepare Product Confirmation Flow** — assets_dt_preparer_produit_action_preparer_produit, assets_dt_preparer_produit_status_non_prepare, assets_dt_preparer_produit_status_prepare, assets_dt_preparer_produit_preparer_produit_sheet [INFERRED 0.85]
- **Expo Logo Composition (Symbol + Wordmark)** — assets_expo_logo, assets_expo_logo_symbol, assets_expo_logo_wordmark, assets_expo_logo_brand [INFERRED 0.85]
- **Expo Router Navigation Structure** — assets_frontend_tree_app, assets_frontend_tree_app_group, assets_frontend_tree_app_layout, assets_frontend_tree_sign_in [INFERRED 0.85]
- **pnpm Monorepo Workspace Configuration** — assets_frontend_tree_package_json, assets_frontend_tree_pnpm_workspace, assets_frontend_tree_pnpm_lock [INFERRED 0.85]
- **Lignes de vie du diagramme de séquence** — assets_gerer_lots_demande_transfert_utilisateur, assets_gerer_lots_demande_transfert_application_mobile, assets_gerer_lots_demande_transfert_serveur, assets_gerer_lots_demande_transfert_base_de_donnees [EXTRACTED 1.00]
- **Phases du flux de gestion des lots** — assets_gerer_lots_demande_transfert_declenchement, assets_gerer_lots_demande_transfert_modification_lots, assets_gerer_lots_demande_transfert_envoi_modifications, assets_gerer_lots_demande_transfert_traitement_modifications [EXTRACTED 1.00]
- **Chargement des modifications de lots** — assets_gerer_lots_demande_transfert_lots_update, assets_gerer_lots_demande_transfert_lots_insert, assets_gerer_lots_demande_transfert_lots_delete, assets_gerer_lots_demande_transfert_token_authentification [EXTRACTED 1.00]
- **Git Logo Visual Composition** — assets_git_logo, red_diamond_rotated_square_icon, white_node_line_branch_motif [INFERRED 0.85]
- **Git Branching Semantics** — git_version_control_system, branch_commit_graph_model, white_node_line_branch_motif [INFERRED 0.75]
- **Livraison Repository Contributors** — assets_github_repo_anubus298, assets_github_repo_badreddinesaadi, assets_github_repo_livraison [EXTRACTED 1.00]
- **Home Screen Module Navigation Tiles** — assets_home_screen_module_voyages, assets_home_screen_module_retours, assets_home_screen_module_rapports_qualite, assets_home_screen_module_rotation_chauffeur, assets_home_screen_module_demande_transfert [INFERRED 0.85]
- **Home Screen Header Bar (Branding and Profile Access)** — assets_home_screen_sdk_wood_brand_logo, assets_home_screen_profile_avatar, assets_home_screen_user_greeting [INFERRED 0.85]
- **Android Adaptive Icon Design Guides** — assets_images_android_icon_background_keyline_grid, assets_images_android_icon_background_safe_zone, assets_images_android_icon_background_adaptive_icon_layers [INFERRED 0.85]
- **Icon Mark and Construction Geometry** — assets_images_icon_chevron_mark, assets_images_icon_construction_guides, assets_images_icon_anchor_point [INFERRED 0.85]
- **SDK WOOD Logo Composition** — assets_images_logo_flame_mark, assets_images_logo_wordmark, assets_images_logo_sdk_wood_logo [INFERRED 0.85]
- **Light Splash Brand Identity** — assets_images_splash_icon_light, assets_images_splash_icon_light_flame_petal_mark, assets_images_splash_icon_light_splash_screen_icon [INFERRED 0.75]
- **Splash Icon Visual Identity** — assets_images_splash_icon_app_icon, assets_images_splash_icon_concentric_circles_motif, assets_images_splash_icon_minimal_line_art_style [INFERRED 0.75]
- **Expanded Lieux Card UI Composition** — assets_lieux_card_expanded_card_header, assets_lieux_card_expanded_detail_fields, assets_lieux_card_expanded_images_section, assets_lieux_card_expanded_action_bar [INFERRED 0.85]
- **Creer un lieu Form Fields** — assets_lieux_create_type_de_projet, assets_lieux_create_contact_field, assets_lieux_create_telephone_field, assets_lieux_create_commentaire_field [EXTRACTED 1.00]
- **Lieux List Screen UI Components** — assets_lieux_list_lieux_list_screen, assets_lieux_list_search_bar, assets_lieux_list_add_place_button, assets_lieux_list_location_count_header, assets_lieux_list_location_card [EXTRACTED 1.00]
- **Location Card Anatomy** — assets_lieux_list_location_card, assets_lieux_list_depot_category, assets_lieux_list_chantier_category, assets_lieux_list_image_thumbnail_count, assets_lieux_list_expand_chevron [INFERRED 0.85]
- **Acteurs du Module Lieux de projets** — assets_lieux_projets_use_case_responsable_de_flotte, assets_lieux_projets_use_case_utilisateur_tout_role, assets_lieux_projets_use_case_directeur_adjoint, assets_lieux_projets_use_case_directeur_general, assets_lieux_projets_use_case_directeur_commercial [EXTRACTED 1.00]
- **Gestion CRUD des lieux de projet** — assets_lieux_projets_use_case_supprimer_un_lieu_de_projet, assets_lieux_projets_use_case_modifier_un_lieu_de_projet, assets_lieux_projets_use_case_creer_un_lieu_de_projet, assets_lieux_projets_use_case_lister_les_lieux_de_projets, assets_lieux_projets_use_case_consulter_les_details_d_un_lieu [INFERRED 0.85]
- **Capture média et géolocalisation pour la création d'un lieu** — assets_lieux_projets_use_case_creer_un_lieu_de_projet, assets_lieux_projets_use_case_capturer_la_position_gps, assets_lieux_projets_use_case_prendre_des_photos, assets_lieux_projets_use_case_selectionner_des_fichiers [INFERRED 0.75]
- **Flux de listage des lieux de projets (accès → vérification → filtres → comptage → récupération → enrichissement)** — assets_lister_lieux_projets_acces_a_la_liste, assets_lister_lieux_projets_verification, assets_lister_lieux_projets_filtres, assets_lister_lieux_projets_comptage, assets_lister_lieux_projets_recuperation, assets_lister_lieux_projets_enrichissement [EXTRACTED 1.00]
- **Participants du diagramme de séquence (utilisateur, application mobile, serveur, base de données)** — assets_lister_lieux_projets_utilisateur, assets_lister_lieux_projets_application_mobile, assets_lister_lieux_projets_serveur_projet_php, assets_lister_lieux_projets_base_de_donnees [EXTRACTED 1.00]
- **Flux de listing des rapports qualite** — assets_lister_rapports_qualite_utilisateur, assets_lister_rapports_qualite_application_mobile, assets_lister_rapports_qualite_serveur_rapport_qualite_php, assets_lister_rapports_qualite_base_de_donnees [EXTRACTED 1.00]
- **Phases de traitement cote serveur** — assets_lister_rapports_qualite_verification, assets_lister_rapports_qualite_filtres, assets_lister_rapports_qualite_comptage, assets_lister_rapports_qualite_recuperation, assets_lister_rapports_qualite_enrichissement [EXTRACTED 1.00]
- **Flux de consultation des rotations** — assets_lister_rotations_acces_liste, assets_lister_rotations_verification, assets_lister_rotations_filtres, assets_lister_rotations_comptage, assets_lister_rotations_recuperation [EXTRACTED 1.00]
- **Participants du diagramme de séquence** — assets_lister_rotations_utilisateur, assets_lister_rotations_application_mobile, assets_lister_rotations_serveur_rotation_chauffeur, assets_lister_rotations_base_de_donnees [EXTRACTED 1.00]
- **Login Form Authentication Flow** — assets_login_fail_email_field, assets_login_fail_password_field, assets_login_fail_se_connecter, assets_login_fail_erreur_lors_de_la_requete, assets_login_fail_authentication_flow [INFERRED 0.85]
- **SDK Wood Authentication Form** — assets_login_screen_email_field, assets_login_screen_password_field, assets_login_screen_login_button [INFERRED 0.85]
- **Entités d'upload d'images (nom_fichier / chemin_fichier / date_upload)** — assets_mcd_voyage_bl_image, assets_mcd_retour_chauffeur_image, assets_mcd_rapport_qualite_image, assets_mcd_projet_image [INFERRED 0.85]
- **Flux d'authentification et permissions** — assets_mcd_utilisateur, assets_mcd_permissions, assets_mcd_utilisateur_token, assets_mcd_menus [EXTRACTED 1.00]
- **Flux de demande de transfert et produits** — assets_mcd_demandetransfert, assets_mcd_demandetransfert_details, assets_mcd_transfert_lots, assets_mcd_vue_produits [EXTRACTED 0.95]
- **Image Attachment Pattern** — assets_mld_projet_image, assets_mld_rapport_qualite_image, assets_mld_retour_chauffeur_image, assets_mld_voyage_bl_image [INFERRED 0.85]
- **SQL Views over Base Tables** — assets_mld_vue_depots, assets_mld_vue_produits, assets_mld_vue_vehicule [EXTRACTED 1.00]
- **User Audit FK Pattern (idCreate/idModif)** — assets_mld_demandetransfert, assets_mld_rapport_qualite, assets_mld_retour_chauffeur, assets_mld_voyage [EXTRACTED 1.00]
- **MySQL Brand Identity** — assets_mysql_logo_mysql_logo, assets_mysql_logo_sakila_dolphin, assets_mysql_logo_mysql_wordmark, assets_mysql_logo_mysql [INFERRED 0.85]
- **PHP Brand Identity** — assets_php_logo_php_logo, assets_php_logo_elephpant_mascot, assets_php_logo_php_language [INFERRED 0.95]
- **phpMyAdmin Logo Composition** — assets_phpmyadmin_logo, assets_phpmyadmin_logo_sailboat_motif, assets_phpmyadmin_logo_wordmark, assets_phpmyadmin_logo_two_tone_color_scheme [INFERRED 0.85]
- **Postman Logo Visual Identity** — assets_postman_logo_astronaut_mark, assets_postman_logo_orange_logomark, assets_postman_logo_postman_brand [EXTRACTED 1.00]
- **Flux de preparation d'un produit ou d'un lot** — assets_preparer_produit_lot_demande_transfert_utilisateur, assets_preparer_produit_lot_demande_transfert_application_mobile, assets_preparer_produit_lot_demande_transfert_serveur_validation_transfert_php, assets_preparer_produit_lot_demande_transfert_base_de_donnees [EXTRACTED 1.00]
- **Etapes du marquage comme prepare** — assets_preparer_produit_lot_demande_transfert_verification_des_permissions, assets_preparer_produit_lot_demande_transfert_marquage_comme_prepare, assets_preparer_produit_lot_demande_transfert_preparation_dun_lot, assets_preparer_produit_lot_demande_transfert_preparation_dun_produit, assets_preparer_produit_lot_demande_transfert_transition_automatique [EXTRACTED 1.00]
- **Detail Fields Group** — assets_rapport_qualite_card_expanded_dum_field, assets_rapport_qualite_card_expanded_dossier_field, assets_rapport_qualite_card_expanded_commentaire_field, assets_rapport_qualite_card_expanded_date_field [EXTRACTED 1.00]
- **Card Action Controls** — assets_rapport_qualite_card_expanded_details_action, assets_rapport_qualite_card_expanded_delete_action, assets_rapport_qualite_card_expanded_expand_toggle [EXTRACTED 1.00]
- **Report Creation Form Inputs** — assets_rapport_qualite_create_dum_field, assets_rapport_qualite_create_dossier_field, assets_rapport_qualite_create_commentaire_field, assets_rapport_qualite_create_camera_capture_area [EXTRACTED 1.00]
- **Create Report Screen Layout** — assets_rapport_qualite_create_report_info_section, assets_rapport_qualite_create_report_files_section, assets_rapport_qualite_create_create_report_button [EXTRACTED 1.00]
- **Report Deletion Confirmation Flow** — assets_rapport_qualite_delete_confirm_report_item_rq11, assets_rapport_qualite_delete_confirm_delete_confirmation_sheet, assets_rapport_qualite_delete_confirm_delete_action, assets_rapport_qualite_delete_confirm_cancel_action [INFERRED 0.85]
- **Attachment Action Buttons (Aperçu, Télécharger, Partager)** — assets_rapport_qualite_details_apercu_button, assets_rapport_qualite_details_telecharger_button, assets_rapport_qualite_details_partager_button [EXTRACTED 1.00]
- **Quality Report Metadata Fields** — assets_rapport_qualite_details_dum_field, assets_rapport_qualite_details_dossier_field, assets_rapport_qualite_details_commentaire_field, assets_rapport_qualite_details_date_fields [INFERRED 0.85]
- **Report Browsing and Creation Flow** — assets_rapport_qualite_list_rapport_list_screen, assets_rapport_qualite_list_report_list_item, assets_rapport_qualite_list_search_bar, assets_rapport_qualite_list_add_button [INFERRED 0.85]
- **Project Sprints Plan (Sprint 1–5)** — assets_rapport_gantt_sprint_1_fondations, assets_rapport_gantt_sprint_2_authentification_voyages, assets_rapport_gantt_sprint_3_retours_rapports_qualite, assets_rapport_gantt_sprint_4_rotation_chauffeur_lieux_de_projets, assets_rapport_gantt_sprint_5_demande_de_transfert_finalisation [EXTRACTED 1.00]
- **Sprint 1 Foundation Workstreams** — assets_rapport_gantt_environnement_et_acces, assets_rapport_gantt_formation_metier, assets_rapport_gantt_collaboration_initiale, assets_rapport_gantt_automatisation_technique, assets_rapport_gantt_initialisation_boilerplate, assets_rapport_gantt_design_system_et_architecture [EXTRACTED 1.00]
- **Finalisation and Delivery Flow** — assets_rapport_gantt_tests_et_validation, assets_rapport_gantt_generation_apk, assets_rapport_gantt_redaction_rapport_ppt [EXTRACTED 1.00]
- **Timber Import Storage Flow** — assets_rapport_import_distribue_1_stacked_lumber, assets_rapport_import_distribue_1_distribution_warehouse, assets_rapport_import_distribue_1_steel_canopy, assets_rapport_import_distribue_1_protective_wrapping [INFERRED 0.85]
- **Wood Import & Distribution Flow** — assets_rapport_import_distribue_2_sdk_wood_workers, assets_rapport_import_distribue_2_panel_stack, assets_rapport_import_distribue_2_forklift_handling [INFERRED 0.85]
- **Onfleet Brand Identity System** — assets_rapport_onfleet_logo_infinity_mark, assets_rapport_onfleet_logo_wordmark, assets_rapport_onfleet_logo_brand_gradient [INFERRED 0.85]
- **Samsara Logo Brand Elements** — assets_rapport_samsara_logo_samsara_wordmark, assets_rapport_samsara_logo_ram_emblem, assets_rapport_samsara_logo_dot_motif, assets_rapport_samsara_logo_shield_badge [INFERRED 0.85]
- **Scrum Roles** — assets_rapport_scrum_product_owner, assets_rapport_scrum_scrum_master, assets_rapport_scrum_team [EXTRACTED 1.00]
- **Scrum Ceremonies (Sprint Events)** — assets_rapport_scrum_sprint_planning_meeting, assets_rapport_scrum_daily_stand_up, assets_rapport_scrum_sprint_review, assets_rapport_scrum_sprint_retrospective [EXTRACTED 1.00]
- **Scrum Artifacts** — assets_rapport_scrum_product_backlog, assets_rapport_scrum_sprint_backlog, assets_rapport_scrum_finished_work [EXTRACTED 1.00]
- **SDK WOOD Logo Composition** — assets_rapport_sdk_wood_logo_leaf_mark, assets_rapport_sdk_wood_logo_wordmark, assets_rapport_sdk_wood_logo_brandmark [INFERRED 0.85]
- **Plan de projet en 5 sprints** — assets_rapport_svg_gantt_sprint_1_fondations, assets_rapport_svg_gantt_sprint_2_authentification_voyages, assets_rapport_svg_gantt_sprint_3_retours_rapports_qualite, assets_rapport_svg_gantt_sprint_4_rotation_chauffeur_lieux_de_projets, assets_rapport_svg_gantt_sprint_5_demande_de_transfert_finalisation [EXTRACTED 1.00]
- **Activites de fondation du Sprint 1** — assets_rapport_svg_gantt_environnement_et_acces, assets_rapport_svg_gantt_formation_metier, assets_rapport_svg_gantt_collaboration_initiale, assets_rapport_svg_gantt_autoformation_technique, assets_rapport_svg_gantt_initialisation_boilerplate, assets_rapport_svg_gantt_design_system_et_architecture [EXTRACTED 1.00]
- **Create quality report include flow** — assets_rapports_qualite_use_case_creer_un_rapport_qualite, assets_rapports_qualite_use_case_prendre_des_photos, assets_rapports_qualite_use_case_selectionner_des_fichiers [EXTRACTED 1.00]
- **Consult report details include/extend flow** — assets_rapports_qualite_use_case_consulter_les_details_d_un_rapport, assets_rapports_qualite_use_case_previsualiser_une_image, assets_rapports_qualite_use_case_apercevoir_un_fichier, assets_rapports_qualite_use_case_partager_un_fichier, assets_rapports_qualite_use_case_telecharger_un_fichier [EXTRACTED 1.00]
- **List quality reports extend flow** — assets_rapports_qualite_use_case_lister_les_rapports_qualite, assets_rapports_qualite_use_case_rechercher_un_rapport [EXTRACTED 1.00]
- **React Native Visual Identity** — assets_react_native_logo_react_native_logo, assets_react_native_logo_atom_orbit_motif, assets_react_native_logo_gradient_blue_branding, assets_react_native_logo_wordmark [EXTRACTED 1.00]
- **Retour Card Detail Fields** — assets_retour_card_expanded_client_field, assets_retour_card_expanded_motif_field, assets_retour_card_expanded_retour_mse_field, assets_retour_card_expanded_bl_cachete_field, assets_retour_card_expanded_reglement_field [INFERRED 0.85]
- **Return File Attachment Flow** — assets_retour_create_fichiers_section, assets_retour_create_prendre_photo, assets_retour_create_choisir_fichiers, assets_retour_create_photo_thumbnail [EXTRACTED 1.00]
- **Return Deletion Confirmation Flow** — assets_retour_delete_confirm_dialog, assets_retour_delete_confirm_annuler_button, assets_retour_delete_confirm_supprimer_button, assets_retour_delete_confirm_delete_return_action [INFERRED 0.85]
- **Return Record Detail Fields** — assets_retour_details_client_fekih_safi, assets_retour_details_return_reason_prix_incorrect, assets_retour_details_return_status_envoye, assets_retour_details_return_mse_flag, assets_retour_details_bl_cache_flag, assets_retour_details_reglement_flag [EXTRACTED 1.00]
- **Return Attachment View and Actions Flow** — assets_retour_details_attachment_return_image, assets_retour_details_file_actions, assets_retour_details_return_record_r101_260416 [INFERRED 0.85]
- **Returns Filter Controls** — assets_retour_filter_chauffeur, assets_retour_filter_client, assets_retour_filter_reinitialiser_les_filtres [EXTRACTED 1.00]
- **Returns List Item Anatomy** — assets_retour_filter_retour_item, assets_retour_filter_en_cours, assets_retour_filter_retour_reference [EXTRACTED 1.00]
- **Return List Item Composite UI** — assets_retour_list_return_list_item, assets_retour_list_return_reference, assets_retour_list_technician_name, assets_retour_list_en_cours_status, assets_retour_list_image_count_badge, assets_retour_list_status_clock_icon [EXTRACTED 1.00]
- **Retour List Screen Controls** — assets_retour_list_search_bar, assets_retour_list_filter_control, assets_retour_list_add_return_button, assets_retour_list_refresh_control [INFERRED 0.85]
- **Return Validation Decision Actions** — assets_retour_validation_accept_action, assets_retour_validation_refuse_action, assets_retour_validation_cancel_action [EXTRACTED 1.00]
- **Confirm Return Validation Dialog Composition** — assets_retour_validation_confirm_return_validation_dialog, assets_retour_validation_return_reference_88, assets_retour_validation_comment_input_field, assets_retour_validation_return_validation_flow [INFERRED 0.85]
- **Consulter les détails d'un retour <<include>> file operations** — assets_retours_use_case_consulter_les_details_d_un_retour, assets_retours_use_case_joindre_des_fichiers, assets_retours_use_case_telecharger_un_fichier, assets_retours_use_case_previsualiser_une_image, assets_retours_use_case_partager_un_fichier [EXTRACTED 1.00]
- **Lister les retours <<extend>> filter/search options** — assets_retours_use_case_lister_les_retours, assets_retours_use_case_filtrer_par_chauffeur, assets_retours_use_case_rechercher_un_retour, assets_retours_use_case_filtrer_par_client [EXTRACTED 1.00]
- **Return lifecycle use cases (create/modify/delete/validate/refuse)** — assets_retours_use_case_creer_un_retour, assets_retours_use_case_modifier_un_retour, assets_retours_use_case_supprimer_un_retour, assets_retours_use_case_valider_un_retour, assets_retours_use_case_refuser_un_retour [INFERRED 0.85]
- **Filtrage de la liste des rotations** — assets_rotation_chauffeur_use_case_consulter_la_liste_des_rotations, assets_rotation_chauffeur_use_case_filtrer_par_intervalle_de_dates, assets_rotation_chauffeur_use_case_filtrer_par_disponibilite, assets_rotation_chauffeur_use_case_filtrer_par_vehicule, assets_rotation_chauffeur_use_case_filtrer_par_chauffeur [INFERRED 0.85]
- **Module Rotation chauffeur (cas d'utilisation)** — assets_rotation_chauffeur_use_case_responsable_de_flotte, assets_rotation_chauffeur_use_case_module_rotation_chauffeur, assets_rotation_chauffeur_use_case_reinitialiser_les_filtres, assets_rotation_chauffeur_use_case_consulter_la_liste_des_rotations [INFERRED 0.85]
- **Rotation Filter Criteria Group** — assets_rotation_filter_chauffeur_filter, assets_rotation_filter_vehicule_filter, assets_rotation_filter_disponibilite_filter [EXTRACTED 1.00]
- **Rotation Card Field Group** — assets_rotation_list_rotation_card, assets_rotation_list_status_badge, assets_rotation_list_distance_badge, assets_rotation_list_driver_info, assets_rotation_list_availability_indicator [EXTRACTED 1.00]
- **Displayed Rotations** — assets_rotation_list_renault_25943t1, assets_rotation_list_alfa_72_023924, assets_rotation_list_dacia_logan_13630t1, assets_rotation_list_total_benne_3989_03 [EXTRACTED 1.00]
- **Flux de sequence - validation d'un retour** — assets_valider_retour_declenchement, assets_valider_retour_saisie_commentaire, assets_valider_retour_choix_action, assets_valider_retour_confirmation, assets_valider_retour_envoi, assets_valider_retour_verifications, assets_valider_retour_mise_a_jour [EXTRACTED 1.00]
- **Participants du systeme de retour chauffeur** — assets_valider_retour_validateur, assets_valider_retour_application_mobile, assets_valider_retour_serveur, assets_valider_retour_base_de_donnees [EXTRACTED 1.00]
- **Chemin de controle d'acces et transaction** — assets_valider_retour_controle_permission, assets_valider_retour_erreur_acces_refuse, assets_valider_retour_verifications, assets_valider_retour_mise_a_jour [INFERRED 0.85]
- **Trip Completion Confirmation Form** — assets_voyage_achever_kmactuel, assets_voyage_achever_dateretour, assets_voyage_achever_confirmbutton, assets_voyage_achever_cancelbutton [INFERRED 0.85]
- **Voyage Action Selection Flow** — assets_voyage_bottom_sheet_action_selection, assets_voyage_bottom_sheet_voyage_44, assets_voyage_bottom_sheet_modifier_action, assets_voyage_bottom_sheet_voir_les_details_action [INFERRED 0.85]
- **Expanded Voyage Card Layout Composition** — assets_voyage_card_expanded_voyage_card, assets_voyage_card_expanded_card_status_badge, assets_voyage_card_expanded_detail_field_grid, assets_voyage_card_expanded_record_thumbnail [INFERRED 0.85]
- **Card Interaction Affordances** — assets_voyage_card_expanded_details_button, assets_voyage_card_expanded_overflow_menu_button, assets_voyage_card_expanded_expand_collapse_chevron [INFERRED 0.75]
- **Delivery Proof Capture Flow** — assets_voyage_cloturer_photo_prendre_une_photo, assets_voyage_cloturer_photo_thumbnail_remove, assets_voyage_cloturer_photo_marquer_comme_livre [INFERRED 0.85]
- **BL Action Selection Flow** — assets_voyage_cloturer_sheet_bl_action_sheet, assets_voyage_cloturer_sheet_bl_selection_card, assets_voyage_cloturer_sheet_bl_document [INFERRED 0.85]
- **Trip Creation Form Fields (Step 1)** — assets_voyage_create_step1_chauffeur_selector, assets_voyage_create_step1_vehicule_selector, assets_voyage_create_step1_depot_depart_selector, assets_voyage_create_step1_ville_selector, assets_voyage_create_step1_km_depart_input, assets_voyage_create_step1_date_heure_depart_input, assets_voyage_create_step1_suivant_button [INFERRED 0.85]
- **BLS Selection Interaction Flow** — assets_voyage_create_step2_search_by_bl_number, assets_voyage_create_step2_bulk_deselect_all, assets_voyage_create_step2_bl_list_item, assets_voyage_create_step2_next_button [INFERRED 0.85]
- **Create Voyage Step 2 Screen Elements** — assets_voyage_create_step2_create_voyage_screen, assets_voyage_create_step2_bls_selection, assets_voyage_create_step2_refresh_action, assets_voyage_create_step2_next_button [INFERRED 0.75]
- **Trip Creation Step 3 Field Group** — assets_voyage_create_step3_driver_field, assets_voyage_create_step3_vehicle_field, assets_voyage_create_step3_depot_field, assets_voyage_create_step3_ville_field, assets_voyage_create_step3_km_depart_field [EXTRACTED 1.00]
- **Voyage Deletion Confirmation Dialog Actions** — assets_voyage_delete_confirm_delete_dialog, assets_voyage_delete_confirm_cancel_button, assets_voyage_delete_confirm_delete_button [EXTRACTED 1.00]
- **Voyage #46 Header Fields** — assets_voyage_details_chauffeur, assets_voyage_details_ville, assets_voyage_details_depart, assets_voyage_details_vehicule, assets_voyage_details_km_depart [EXTRACTED 1.00]
- **BDC Delivery Status Flow** — assets_voyage_details_bdc2300047, assets_voyage_details_bdc2300048, assets_voyage_details_statut_livre, assets_voyage_details_statut_en_cours [INFERRED 0.75]
- **Flux de clôture d'un BL livré** — assets_voyages_cloturer_bl_prise_de_photo, assets_voyages_cloturer_bl_envoi, assets_voyages_cloturer_bl_verification_autorisation, assets_voyages_cloturer_bl_sauvegarde_de_la_photo, assets_voyages_cloturer_bl_enregistrement_de_la_position, assets_voyages_cloturer_bl_mise_a_jour_du_bl [EXTRACTED 1.00]
- **Participants du diagramme de séquence** — assets_voyages_cloturer_bl_chauffeur, assets_voyages_cloturer_bl_application_mobile, assets_voyages_cloturer_bl_serveur, assets_voyages_cloturer_bl_base_de_donnees [EXTRACTED 1.00]
- **Création de voyage — acteurs du flux** — assets_voyages_create_voyage_utilisateur, assets_voyages_create_voyage_application_mobile, assets_voyages_create_voyage_serveur_voyage_php, assets_voyages_create_voyage_base_de_donnees [EXTRACTED 1.00]
- **Vérifications préalables du voyage** — assets_voyages_create_voyage_verifications_prealables, assets_voyages_create_voyage_token_auth_validation, assets_voyages_create_voyage_champs_obligatoires, assets_voyages_create_voyage_serveur_voyage_php [EXTRACTED 1.00]
- **Enregistrement atomique du voyage et des BLs** — assets_voyages_create_voyage_enregistrement_du_voyage, assets_voyages_create_voyage_transaction, assets_voyages_create_voyage_association_des_bls, assets_voyages_create_voyage_voyage_entity, assets_voyages_create_voyage_bl_entity [EXTRACTED 1.00]

## Communities (171 total, 30 thin omitted)

### Community 0 - "Demande Transfert API"
Cohesion: 0.06
Nodes (56): AddProductToDTRequest, changeDTStatut(), ChangeDTStatutRequest, createDemandeTransfert(), CreateDemandeTransfertRequest, deleteDemandeTransfert(), DeleteDTRequest, deleteProductFromDT() (+48 more)

### Community 1 - "Auth & App Shell"
Cohesion: 0.06
Nodes (43): getCurrentUser(), signInWithEmailAndPassword(), Screen(), Screen(), InnerLayout(), Screen(), SplashScreenController(), ApiClient (+35 more)

### Community 2 - "RVT Reference Data"
Cohesion: 0.05
Nodes (48): CreateVisitState, initialState, ActionDateOption, ActiviteIndustrielleRef, ActiviteObserveeCode, ActiviteObserveeV2, ActivityLevel, ActivityType (+40 more)

### Community 3 - "App Routing & Drawer"
Cohesion: 0.08
Nodes (42): Layout(), Index(), Index(), AppDrawerContent(), DRAWER_ITEMS, DrawerIconName, DrawerMenuItem, DrawerRoute (+34 more)

### Community 4 - "Stack Layouts"
Cohesion: 0.06
Nodes (39): CREATE_STEP_ORDER, headerTitles, StackLayout(), styles, MultiSelectBottomSheetContent(), MultiSelectBottomSheetContentProps, MultiSelectItem, MultiSelectRowItem (+31 more)

### Community 5 - "Projet Location API"
Cohesion: 0.08
Nodes (39): createProjetLocation(), CreateProjetLocationRequest, deleteProjetLocation(), getProjetLocationById(), getReturnById, Image, listProjetLocation(), Projet (+31 more)

### Community 6 - "Return API"
Cohesion: 0.09
Nodes (39): createReturn(), CreateReturnRequest, deleteReturn(), getReturnById(), Image, listReturn(), OUINon, Reclamation (+31 more)

### Community 7 - "Expo Dependencies"
Cohesion: 0.05
Nodes (44): dependencies, date-fns, expo, expo-build-properties, expo-camera, expo-constants, expo-document-picker, expo-file-system (+36 more)

### Community 8 - "Reference Data & Clients"
Cohesion: 0.17
Nodes (29): getReferenceData(), CreateClient(), CreateMarche(), CreateOpportunite(), CreateProfil(), RvtChipRow(), RvtFooterButton(), RvtPresenceLevels() (+21 more)

### Community 9 - "Quality Report API"
Cohesion: 0.11
Nodes (30): CreateQualityReportRequest, getQualityReportById(), QualityReport, QualityReportImage, UploadQualityReportFile, QualityReportDetails(), buildFileUrl(), DetailText() (+22 more)

### Community 10 - "UML Data Model"
Cohesion: 0.12
Nodes (34): DEMANDETRANSFERT, DEMANDETRANSFERT_DETAILS, DOCUMENT, DOCUMENT_ITEMS, Table externe (ERP legacy), MARQUE_VEHICULE, MENUS, Module 1: Auth & Permissions (+26 more)

### Community 11 - "Expo App Config"
Cohesion: 0.06
Nodes (32): backgroundColor, foregroundImage, monochromeImage, adaptiveIcon, package, permissions, predictiveBackGestureEnabled, projectId (+24 more)

### Community 12 - "Product & Lots API"
Cohesion: 0.11
Nodes (22): addProductToDT(), DemandeTransfertLot, updateProductLots(), getProductLots(), listProduits(), Produit, ProduitLot, headerTitles (+14 more)

### Community 13 - "Visit Details & Photos"
Cohesion: 0.11
Nodes (26): getVisitById(), VisitDetails(), RvtPicturePreview(), RvtPicturePreviewProps, styles, expo-image, DetailRow(), equipmentLabel() (+18 more)

### Community 14 - "Conceptual Data Model"
Cohesion: 0.14
Nodes (31): Modèle Conceptuel de Données — Application SDK WOOD Mobile, DEMANDETRANSFERT, DEMANDETRANSFERT_DETAILS, DOCUMENT, DOCUMENT_ITEMS, Légende couleurs (Établie / À propager / Table externe ERP legacy), MARQUE_VEHICULE, MENUS (+23 more)

### Community 15 - "Backend Architecture Diagram"
Cohesion: 0.10
Nodes (16): Backend File Tree (screenshot), alt [BL non trouvé ou non autorisé], Application mobile, Base de données, Chauffeur, Coordonnées GPS, Enregistrement de la position, Envoi (+8 more)

### Community 16 - "Reusable Card Components"
Cohesion: 0.14
Nodes (19): ReturnActionConfirmBottomSheetContentProps, formatKm(), formatStatusDate(), RotationChauffeurCard(), styles, DetailRow(), RvtRoundCard(), styles (+11 more)

### Community 17 - "Nested Stack Layouts"
Cohesion: 0.14
Nodes (21): headerTitles, StackLayout(), headerTitles, StackLayout(), headerTitles, StackLayout(), CloseBLBottomSheetContent(), ReturnActionConfirmBottomSheetContent() (+13 more)

### Community 18 - "Voyage Postman Requests"
Cohesion: 0.09
Nodes (27): List BLs Request, List Rotations des Chauffeur Request, List Transfert Request, List Validation Transfert Request, Modify Lots of Product in DT Request, Voyage Collection Definition, List Voyages Example (200 OK), Close BL Request (+19 more)

### Community 19 - "Package Manifest"
Cohesion: 0.07
Nodes (26): main, name, packageManager, private, version, expo, expo-build-properties, expo-constants (+18 more)

### Community 20 - "RVT Module Docs"
Cohesion: 0.08
Nodes (26): Dictee vocale de la note, Formulaire en 5 etapes, Geolocalisation (hors API), Module Rapport de visite terrain, Tournee (session commerciale), Visite / Rapport de visite, API SDKWOOD - Rapport de visite terrain, auth_token header authentication (+18 more)

### Community 21 - "RVT Analytics"
Cohesion: 0.12
Nodes (22): createRound(), listRounds(), getAnalytics(), Index(), KPI_TILES, KpiKey, KpiTile(), MiniBar() (+14 more)

### Community 22 - "Project Structure Docs"
Cohesion: 0.11
Nodes (24): api/ (API client layer), app/ (Expo Router routes directory), (app) Route Group, app.json (Expo app configuration), _layout.tsx (Root Layout), assets/, backend/, components/ (shared UI components) (+16 more)

### Community 23 - "Gantt Project Timeline"
Cohesion: 0.12
Nodes (22): Gantt Project Timeline (Mar–Jun 2025), Authentification et autorisation, Automatisation technique, Collaboration initiale, Design system et architecture, Environnement et accès, Formation métier, Génération APK (+14 more)

### Community 24 - "Sprint Planning Timeline"
Cohesion: 0.09
Nodes (22): Authentification et autorisation, Autoformation technique, Collaboration initiale, Design system et architecture, Environnement et acces, Formation metier, Generation APK, Initialisation boilerplate (+14 more)

### Community 25 - "Close BL Store"
Cohesion: 0.09
Nodes (20): zustand, CloseBLMode, CloseBLState, ConfirmedVoyageAction, MoreActionHandler, MoreActionType, ReturnActionHandler, ReturnActionPayload (+12 more)

### Community 26 - "Transfer Request Use Cases"
Cohesion: 0.13
Nodes (21): ADV (Agent des ventes), Ajouter un produit, Changer le statut d'une demande, Confirmer la préparation (produit / lot), Confirmer la suppression d'un produit, Confirmer la suppression d'une demande, Consulter les détails d'une demande, Créer une demande de transfert (+13 more)

### Community 27 - "BL & Chauffeur Samples"
Cohesion: 0.11
Nodes (21): AIT BOUHOU RACHID, AN PROMO, BDC2300047, BDC2300048, BLs (Delivery Notes) Section, BRAHIM BENNASSER, Casa-Sidi Harazem, Chauffeur (Driver) (+13 more)

### Community 28 - "Lieux de Projets Use Cases"
Cohesion: 0.13
Nodes (20): Appeler le contact, Capturer la position GPS, Consulter les détails d'un lieu, Créer un lieu de projet, Module Lieux de projets - Diagramme de cas d'utilisation, Directeur adjoint (acteur), Directeur commercial (acteur), Directeur général (acteur) (+12 more)

### Community 29 - "Quality Report Sequence"
Cohesion: 0.20
Nodes (19): Créer un rapport qualité — Diagramme de séquence, Application mobile, Base de données, Commentaire, Enregistrement du rapport, Erreur : champ obligatoire manquant, Erreur : fichiers manquants, Prise de photo / fichiers (+11 more)

### Community 30 - "Transfer Request Workflow"
Cohesion: 0.14
Nodes (18): Demande DT2026004, Demande Preparation Workflow, Dépôt destination, Dépôt source, Demande Details Screen (Détails de la demande), DUM (Document Unique de Marchandises), Lot 2025-13513, Lot 2025-14673 (+10 more)

### Community 31 - "Project Locations Sequence"
Cohesion: 0.19
Nodes (18): Lister les lieux de projets — Diagramme de séquence, Accès à la liste, Application mobile (client), Base de données, Comptage, Données renvoyées (type, GPS, contacts, créateur, images), Enrichissement, Images et fichiers joints au lieu (+10 more)

### Community 32 - "Edit & Create Screens"
Cohesion: 0.19
Nodes (11): updateDemandeTransfert(), createQualityReport(), EditDemandeTransfert(), CreateQualityReport(), Button(), @tanstack/react-query, CreateQualityReportScreen(), styles (+3 more)

### Community 33 - "Visits API"
Cohesion: 0.25
Nodes (14): createVisit(), deletePanneauChantierPhoto(), deleteVisitPhotos(), generateIdempotencyKey(), updateVisit(), uploadPanneauChantierPhoto(), UploadVisitFile, uploadVisitPhoto() (+6 more)

### Community 34 - "Rounds API"
Cohesion: 0.27
Nodes (13): closeRound(), deleteRound(), getRoundById(), reopenRound(), updateRound(), deleteVisit(), listVisits(), TourDetails() (+5 more)

### Community 35 - "Product Lots Workflow"
Cohesion: 0.17
Nodes (16): Application mobile, Base de données, Déclenchement, Envoi des modifications, Gérer les lots d'un produit, Lot (produit), lots_delete (lots supprimés), lots_insert (nouveaux lots) (+8 more)

### Community 36 - "Rotation Sequence"
Cohesion: 0.17
Nodes (16): Accès à la liste (phase), Application mobile, Base de données, Comptage du nombre total de véhicules, Consulter la liste des rotations — Diagramme de séquence, Informations du dernier voyage effectué, Calcul de la disponibilité (Disponible/Réservé), Écran "Rotation chauffeur" (+8 more)

### Community 37 - "Returns Use Cases"
Cohesion: 0.14
Nodes (16): Agent de caisse (Cashier Agent), Chauffeur (Driver), Consulter les détails d'un retour, Créer un retour, Filtrer par chauffeur, Filtrer par client, Joindre des fichiers (photo / document), Lister les retours (+8 more)

### Community 38 - "Voyage API"
Cohesion: 0.24
Nodes (11): BLItem, changeVoyageStatus(), CreateVoyageRequest, deleteVoyage(), Image, listVoyage(), VoyageListItem, Index() (+3 more)

### Community 39 - "Transfer Request Sequence"
Cohesion: 0.23
Nodes (15): Application mobile, Base de données, Demande de transfert, Créer une demande de transfert — Diagramme de séquence, Enregistrement de la demande, Génération de la référence, Référence de transfert (DT…), Saisie du formulaire (+7 more)

### Community 40 - "Rotation List UI"
Cohesion: 0.18
Nodes (15): AIT BOUHOU RACHID, ALFA - 72-023924, Disponible depuis Indicator, DACIA LOGAN - 13630T1, Distance Badge, Chauffeur non renseigne Placeholder, Filter Action, Refresh Action (+7 more)

### Community 41 - "BL Selection & API"
Cohesion: 0.23
Nodes (9): BLResponse, closeBL(), listBLSEnCours(), Index(), BLCard(), CreateVoyageScreen(), styles, BlsState (+1 more)

### Community 42 - "Quality Reports Sequence"
Cohesion: 0.20
Nodes (14): Acces a la liste, Application mobile, Base de donnees, Comptage du nombre total, Lister les rapports qualite - Diagramme de sequence, Enrichissement (images et fichiers joints), Filtres par identifiant precis et par createur, Filtres (+6 more)

### Community 43 - "Return Card UI"
Cohesion: 0.18
Nodes (14): Retour Card (Expanded), BL Cachete Field, Oui/Non Boolean Badge, Client Field, Label/Value Detail Row, Details Action Button, Card Header (Dossier R36-260327), Leading Icon Detail Pattern (+6 more)

### Community 44 - "Voyage Creation Sequence"
Cohesion: 0.21
Nodes (14): Application mobile (Mobile Client), Association des BLs (BL Association Loop), Base de données (Database), BL (Bon de Livraison), Champs obligatoires (Required Fields), Créer un voyage — Diagramme de séquence, Enregistrement du voyage (Trip Persistence), Saisie du formulaire (Form Entry) (+6 more)

### Community 45 - "Voyage Use Cases"
Cohesion: 0.20
Nodes (14): Achever un voyage, Agent de livraison, Chauffeur, Clôturer un BL, Consulter les détails d'un voyage, Consulter les images d'un BL, Créer un voyage, Filtrer les voyages (+6 more)

### Community 46 - "API Module Overview"
Cohesion: 0.18
Nodes (14): Demande de Transfert API, Demande Transfert frontend/backend gaps, Demande de Transfert statut workflow, Lieux de Projets API, Rapports Qualite API, Retours Chauffeur API, Rotation Chauffeur API, Voyages API (+6 more)

### Community 47 - "Rotation Chauffeur API"
Cohesion: 0.27
Nodes (10): ListRotations(), Rotation, ListChauffeurs(), ListVehicles(), Index(), Pagination, formatDateForApi(), formatDateLabel() (+2 more)

### Community 48 - "Auth & Delete Sheets"
Cohesion: 0.22
Nodes (9): headerTitles, StackLayout(), Screen(), QualityReportDeleteConfirmBottomSheetContent(), QualityReportDeleteConfirmBottomSheetContentProps, react-native-safe-area-context, LoginScreen(), styles (+1 more)

### Community 49 - "Camera Screen"
Cohesion: 0.21
Nodes (10): Camera(), expo-camera, expo-document-picker, RvtCameraScreen(), styles, ThumbItem, PendingVisitPhoto, CameraPickerConfig (+2 more)

### Community 50 - "Return Capture Sequence"
Cohesion: 0.21
Nodes (13): Application mobile, Base de données, Capture automatique des coordonnées GPS, Enregistrement du retour (transaction), Motif de réclamation (Retour MSE), Prise de photo / fichiers, Saisie du formulaire, Sauvegarde des fichiers (loop) (+5 more)

### Community 51 - "Return Validation Flow"
Cohesion: 0.22
Nodes (13): Application mobile, Base de donnees, Choix de l'action - Appui sur Accepter, Confirmation - Vous allez accepter le retour #X, ValidationRetourChauffeur (droit de valider les retours), Declenchement - Traiter le retour en statut Envoye, Envoi des informations avec token d'authentification, Erreur Acces refuse - permission manquante (+5 more)

### Community 52 - "Layouts & Offline Notice"
Cohesion: 0.20
Nodes (8): headerTitles, StackLayout(), styles, ProjetLocationDeleteConfirmBottomSheetContent(), ProjetLocationDeleteConfirmBottomSheetContentProps, Colors, expo-network, react-native-gesture-handler

### Community 53 - "Home Screen UI"
Cohesion: 0.29
Nodes (12): SDK Wood App Home Screen, Material Rounded Card Layout Pattern, Demande de Transfert Module Tile, Rapports Qualite Module Tile, Retours Module Tile, Rotation Chauffeur Module Tile, Module Selector Grid, Voyages Module Tile (+4 more)

### Community 54 - "Lot Preparation Permission"
Cohesion: 0.20
Nodes (12): Application mobile, Base de donnees, Confirmation, Declenchement, Marquage comme prepare, Permission can_update, Preparation d'un lot (action=preparerLot), Preparation d'un produit (action=preparerItem) (+4 more)

### Community 55 - "Scrum Process"
Cohesion: 0.24
Nodes (12): Daily Stand Up (24H), Finished Work, Product Backlog, Product Owner, Scrum Master, Scrum Process, Sprint (1-4 Weeks), Sprint Backlog (+4 more)

### Community 56 - "Quality Report Use Cases"
Cohesion: 0.18
Nodes (12): Apercevoir un fichier (apercu externe), Consulter les details d'un rapport, Controle de gestion (Actor), Creer un rapport qualite, Lister les rapports qualite, Partager un fichier, Prendre des photos, Previsualiser une image (en plein ecran) (+4 more)

### Community 57 - "Returns List UI"
Cohesion: 0.21
Nodes (12): Add Return Button (FAB +), Status: En cours, Filter Control, Attached Image Count (1 image), List des retours Screen, Refresh Control, Return Count Indicator (10 retours), Return List Item Card (+4 more)

### Community 58 - "Button Component"
Cohesion: 0.17
Nodes (11): ButtonAccessoryProps, ButtonProps, Presets, $pressedTextPresets, $pressedViewPresets, Size, $sizeTextPresets, $sizeViewPresets (+3 more)

### Community 59 - "RVT Tournee Collection"
Cohesion: 0.24
Nodes (12): Rapport de visite terrain Collection, RVT Analytics, List RVT, RVT Reference Data, Tournee Collection, List Tournee Example, Close Tournee, Create Tournee (+4 more)

### Community 60 - "Quality/Return Endpoints"
Cohesion: 0.29
Nodes (11): GET /api/homescreen/rapport_qualite.php, GET/POST/DELETE /api/homescreen/retour_chauffeur.php, Rapport Quality - List Return Example, Create Rapport Quality, Delete Rapport Quality, List Rapport Quality, List Return Example (1), List Return Example (+3 more)

### Community 61 - "Create Location Sequence"
Cohesion: 0.22
Nodes (11): Capture de la position, Enregistrement du lieu, Lieu créé avec succès, Position GPS obligatoire, Prise de photo (optionnelle), Saisie du formulaire, Sauvegarde des fichiers, Soumission (+3 more)

### Community 62 - "Transfer Request Actions"
Cohesion: 0.22
Nodes (11): Add Product Action (Ajouter), Cancel Action (Annuler), Delete Action (Supprimer), Delete Confirmation Bottom Sheet (Supprimer la demande), Draft Status (Brouillon), Edit Action (Modifier), Lots Section (Lots), Product Prepared Status (Préparé) (+3 more)

### Community 63 - "Quality Report Card UI"
Cohesion: 0.20
Nodes (11): Attachment Thumbnail (Wood Flooring Photo), Rapport Qualité Card (Expanded), Commentaire Field, Date Field, Delete (Trash) Action Button, Détails Action Button, Dossier Field, DUM Field (DUM-010) (+3 more)

### Community 64 - "Return Details Card UI"
Cohesion: 0.24
Nodes (11): Aperçu Button, Attachment Image Thumbnail (1776330973_9729_...jpeg), Commentaire Field, Date / Créé le / Modifié le Fields, Dossier Field (dum test 10), DUM Field (DUM-010), Partager Button, Pièces jointes Section (+3 more)

### Community 65 - "Create Voyage Form"
Cohesion: 0.22
Nodes (11): Chauffeur Selector (RACHID AIT BOUHOU), Créer un voyage Screen, Date et heure de départ Input, Depot de depart Selector (CASA — CASABLANCA), Driver Selection Required for Trip, Km départ Input (min 125000 km), Minimum Km Validation Rule, Suivant (Next) Button (+3 more)

### Community 66 - "Voyage Confirmation Step"
Cohesion: 0.25
Nodes (11): Confirmer le voyage Button, Confirm-Before-Commit Review Pattern, Dépôt Field (CASA — CASABLANCA), Chauffeur / Driver Field (RACHID AIT BOUHOU), Inline Edit (Pencil) Action, KM Départ Field (125001 km), Retour (Back) Action, Créer un voyage — Step 3 Confirmation Screen (+3 more)

### Community 67 - "RVT Sheet Store"
Cohesion: 0.18
Nodes (10): MultiSelectConfig, RoundDeleteConfig, RoundEditConfig, RoundFiltersConfig, RoundFiltersStatus, RoundToggleConfig, RvtSheetState, SelectConfig (+2 more)

### Community 68 - "Product Preparation UI"
Cohesion: 0.31
Nodes (10): Prepare Product Action, Demande Details Screen, Lot 2025-13513, Lot 2025-14673, Lot 2025-15143, Prepare Product Confirmation Sheet, Product HETRE ITALY 50 AV KD AB ISKRALEGNO, Product HETRE ITALY 52 AV KD C ISKRALEGNO (+2 more)

### Community 69 - "Locations List UI"
Cohesion: 0.24
Nodes (10): Add Place FAB (+), Chantier Location Category, Depot Location Category, Expand Row Chevron, Image Count Indicator, Liste des lieux Screen, Location List Card, Location Count Header (10 lieux) (+2 more)

### Community 70 - "Return Details Screen"
Cohesion: 0.22
Nodes (10): Attached Return Photo (1776349792_6038_return-1776349811391.jpg), BL caché: Oui, Client FEKIH SAFI, File Actions: Aperçu / Télécharger / Partager, Règlement: Oui, Détails du retour (Return Details Screen), Retour MSE: Oui, Return Reason: Prix incorrect (+2 more)

### Community 71 - "Returns Filter Sheet"
Cohesion: 0.31
Nodes (10): Chauffeur Filter (Driver), Client Filter, En cours (In-Progress Status Badge), Returns Filtering by Driver and Client, Filtrer les retours (Filter Bottom Sheet), List des retours (Returns List Screen), Rechercher un retour (Search Field), Réinitialiser les filtres (Reset Filters) (+2 more)

### Community 72 - "NPM Scripts"
Cohesion: 0.20
Nodes (10): scripts, android, ios, lint, prebuild:clean, start, typecheck, upgrade-deps (+2 more)

### Community 73 - "PDF Download Utilities"
Cohesion: 0.36
Nodes (9): expo-intent-launcher, buildUniqueFileName(), downloadPdf(), getAuthFileHeaders(), getDisplayNameWithoutExtension(), getOpenUriCandidates(), isNameConflictError(), openSavedFile() (+1 more)

### Community 74 - "Reference Data APIs"
Cohesion: 0.39
Nodes (5): client, Chauffeur, Client, Depot, Vehicle

### Community 75 - "Quality Reports List"
Cohesion: 0.39
Nodes (6): deleteQualityReport(), listQualityReports(), Index(), Loader(), styles, QualityReportsScreen()

### Community 76 - "Voyage Details Screen"
Cohesion: 0.42
Nodes (7): getVoyageById(), VoyageDetails(), DetailRow(), buildImageUrl(), formatDate(), formatUploadDate(), VoyageDetailsScreen()

### Community 77 - "Transport Card UI"
Cohesion: 0.33
Nodes (9): Audit Metadata (Créé par / Date), Dépôt Source/Destination Reference, Icon Label-Value Detail Row, Détails Action Button, Expand/Collapse Chevron, Observation Field, Status Badge (Reçu), Expanded Transport Card (DT2026005) (+1 more)

### Community 78 - "New Transfer Request Form"
Cohesion: 0.22
Nodes (9): Creer la demande, Demande de transfert, Depot destination, Depot source, DUM, Matricule, Observation, Nouvelle Demande Screen (Transfer Request Form) (+1 more)

### Community 79 - "Manage Lots Sheet"
Cohesion: 0.31
Nodes (9): Actuel Badge, Demande (request), Détails de la demande Screen (background), Enregistrer Action, Gérer les lots Bottom Sheet, Lot Card, Lot (batch), Lot Selection Mechanism (+1 more)

### Community 80 - "Lieux Card UI"
Cohesion: 0.28
Nodes (9): Lieux Card (Expanded) UI Component, Action Bar (Open Map, Call, More), Card Header (Depot #22, Tdts, Date, Image Count, Collapse Chevron), Collapsible Card Pattern (Header Toggles Expanded Detail), Coordonnées (X/Y Geo Coordinates Field), Detail Field List (Contact, Telephone, Créé par, Date, Coordonnées, Commentaire), Icon + Label + Value Row Layout Pattern, Images Section with Thumbnail Gallery (+1 more)

### Community 81 - "Create Lieu Form"
Cohesion: 0.28
Nodes (9): Camera masquee Placeholder, Commentaire Field, Contact Field, Fichiers du lieu Section, Informations du lieu Section, Creer un lieu Screen, Creer le lieu Button, Telephone Field (+1 more)

### Community 82 - "Create Report Form"
Cohesion: 0.28
Nodes (9): Caméra masquée Capture Area, Commentaire (optionnel) Textarea, Créer le rapport Button, Créer un rapport Screen, Dossier Input Field, DUM Input Field, DUM or Dossier Required Validation Rule, Fichiers du rapport Section (+1 more)

### Community 83 - "Rotations Filter Sheet"
Cohesion: 0.39
Nodes (9): Disponible Badge (Availability Status), Chauffeur Filter (Driver), Disponibilite Filter (Availability), Filtrer les rotations (Filter Bottom Sheet), Refresh Rotations Action, Reinitialiser les filtres (Reset Filters), Rotation Card (RENAULT - 25943T1), Liste des rotations (Rotations List Screen) (+1 more)

### Community 84 - "Return Summary Card"
Cohesion: 0.28
Nodes (9): Card Status Badge (En cours), Detail Field Grid (Client / Motif / Retour MSE / BL cachete / Reglement), Details Primary Action Button, Expand/Collapse Chevron, Mobile Summary Card Layout Pattern, Overflow Menu Button, Progressive Disclosure Pattern, Record Icon and Image Counter (+1 more)

### Community 85 - "BL Selection Step"
Cohesion: 0.33
Nodes (9): BL List Item Card, BL Record (BDC number, timestamp, client), BLS Selection for Voyage, Tout désélectionner (Bulk Toggle), Create Voyage Screen (Step 2), Suivant (N) Button, Refresh Action Icon, Search by BL Number (+1 more)

### Community 86 - "Ville & Chauffeur Selection"
Cohesion: 0.39
Nodes (5): ListVilles(), Ville, Index(), SelectChauffeurScreen(), styles

### Community 87 - "Voyage Summary Screen"
Cohesion: 0.43
Nodes (6): createVoyage(), updateVoyage(), Index(), styles, VoyageSummaryScreen(), useCreateVoyageStore

### Community 88 - "OAuth Authorization Model"
Cohesion: 0.39
Nodes (8): Authorization Server, Client, Password Credential, Protected Resource, Resource Server, Access Token, Token Based Authentication, User

### Community 89 - "Drawer Menu UI"
Cohesion: 0.29
Nodes (8): Demande de transfert, Drawer Menu Screen, Rapports qualite, Retours, Rotation chauffeur, Se deconnecter (Logout), User Profile Header (BADR EDDINE SAADI, Admin), Voyages

### Community 90 - "Transfer Request List UI"
Cohesion: 0.32
Nodes (8): Add New Transfer Request Button, Demande de transfert Screen, Rechercher Search Bar, Brouillon Status Badge, Recue Status Badge, Bidirectional Transfer Icon, Transfer Request List Item (DT2026005), Transfer Request List (10 demandes)

### Community 91 - "Login Failure Screen"
Cohesion: 0.29
Nodes (8): Authentication Flow, Email Input Field, Erreur lors de la requete (Request Error Banner), Mot de passe incorrect (Incorrect Password Error), Password Input Field, SDK Wood Brand Logo, SDK Wood Login Screen (Failure State), Se connecter (Login Button)

### Community 92 - "Login Screen UI"
Cohesion: 0.36
Nodes (8): Email/Password Authentication Flow, SDK Wood Branding Logo, Email Input Field, Se connecter Login Button, SDK Wood Login Screen, Password Input Field, Password Visibility Toggle, Single-Column Minimal Form Layout

### Community 93 - "Report Delete Confirmation"
Cohesion: 0.32
Nodes (8): Annuler (Cancel Action), Supprimer (Destructive Delete Action), Confirmer la suppression du rapport (Delete Confirmation Bottom Sheet), Destructive Action Confirmation Pattern, Rapport Qualité Delete Confirmation Screenshot, Expanded Report Item RQ-11 (RQ case detail), Liste des rapports (Reports List Screen), Rechercher un rapport (Search Reports Field)

### Community 94 - "Reports List Offline"
Cohesion: 0.32
Nodes (8): Add Report Button, Offline Status Banner, Offline-First Sync Pattern, Rapport (Quality Report), Liste des rapports Screen, Report Count Indicator, Report List Item (RQ-xx), Report Search Bar

### Community 95 - "Rotation Use Cases"
Cohesion: 0.29
Nodes (8): Consulter la liste des rotations, Filtrer par chauffeur, Filtrer par disponibilité, Filtrer par intervalle de dates, Filtrer par véhicule, Module Rotation chauffeur, Réinitialiser les filtres, Responsable de flotte

### Community 96 - "Trip Completion Modal"
Cohesion: 0.39
Nodes (8): Annuler Button, Confirmer Button, Confirm Trip Completion Modal, Date et heure retour Picker, Km actuel du véhicule Input, Km départ Display, Trip Completion Flow, Unfulfilled BL Warning

### Community 97 - "Delivery Proof Capture"
Cohesion: 0.25
Nodes (8): Action sur le BL Screen, BL BDC2300047 (Delivery Note), Delivery Proof Capture Flow, Marquer comme livre (Primary CTA), Photo de livraison (Delivery Photo Capture), Prendre une photo (1) Button, Photo Thumbnail with Remove Control, Voyage #44 (Trip Context)

### Community 98 - "TypeScript Config"
Cohesion: 0.25
Nodes (7): expo/tsconfig.base, compilerOptions, jsx, paths, strict, extends, include

### Community 99 - "Create Return Form"
Cohesion: 0.48
Nodes (7): Choose Files Button (Choisir des fichiers), Return Files Section (Fichiers du retour), Uploaded Photo Thumbnail with Remove Control, Take Photo Button (Prendre une photo), Réclamation Field (claim selector, value Aucune), Create Return Screen (Créer un retour), Create Return Button (Créer le retour)

### Community 100 - "Return Validation Dialog"
Cohesion: 0.48
Nodes (7): Accepter (Accept) Button, Annuler (Cancel) Button, Comment Textarea (Saisir un commentaire), Confirm Return Validation Dialog, Refuser (Refuse) Button, Retour #88 Reference, Return Validation Decision Flow

### Community 101 - "ESLint Config"
Cohesion: 0.29
Nodes (6): { defineConfig }, expoConfig, reactNative, eslint, eslint-config-expo, eslint-plugin-react-native

### Community 102 - "Android Studio Logo"
Cohesion: 0.47
Nodes (6): Android Studio Logo, Android Robot Mascot, Android Studio, Android Developer Tooling, Drafting Compass, IntelliJ Platform

### Community 103 - "Lumber Yard Photo"
Cohesion: 0.60
Nodes (6): Open-Sided Distribution Warehouse, Imported Material Logistics Evidence, Distributed Import Lumber Yard Photo, Protective Plastic Wrapping on Timber Bundles, Stacks of Dimensional Lumber, Steel Canopy Shelter Structure

### Community 104 - "Forklift Logistics Photo"
Cohesion: 0.47
Nodes (6): Forklift Material Handling, Import & Distribution Scene (SDK Wood), Import & Distribution Logistics Operation, Stacked Wood Panels / Sheets, SDK Wood Brand Logo, SDK Wood Uniformed Workers

### Community 105 - "Samsara Logo"
Cohesion: 0.40
Nodes (6): Samsara Logo, Dot Pattern Motif, Monochrome Black and White Palette, Ram Horn Emblem, Samsara Wordmark, Shield Badge Shape

### Community 106 - "Voyage Bottom Sheet"
Cohesion: 0.53
Nodes (6): Voyage Bottom Sheet Screenshot, Action Bottom Sheet Pattern, Sélectionner une action (Action Selection Header), Modifier (Edit Action Button), Voir les détails (View Details Action Button), Voyage #44 (Trip Entity)

### Community 107 - "Dev Dependencies"
Cohesion: 0.33
Nodes (6): devDependencies, eslint, eslint-config-expo, eslint-plugin-react-native, @types/react, typescript

### Community 108 - "Project Locations Postman"
Cohesion: 0.53
Nodes (6): Project locations Collection, List Project Locations Example, Create Project Location, Delete Project Location, List Project Locations, Update Project Location

### Community 109 - "Transfer Request Endpoints"
Cohesion: 0.60
Nodes (5): GET/POST /api/homescreen/demande_transfert.php, Create Transport Example, List Transfert Example, List Validation Transfert Example, Create Transport

### Community 110 - "Apache Logo"
Cohesion: 0.50
Nodes (5): Apache Software Foundation Feather Logo, Apache Feather, Apache Software Foundation, Trademark (TM) Mark, Warm-to-Cool Gradient Palette

### Community 111 - "Project Location Server Sequence"
Cohesion: 0.70
Nodes (5): Application mobile, Base de données, Créer un lieu de projet — Diagramme de séquence, Serveur (projet.php), Utilisateur

### Community 112 - "Prepare Lot Confirmation"
Cohesion: 0.60
Nodes (5): Préparer le lot Confirmation Bottom Sheet, Détails de la demande Screen, Lot, Produit (Product), Préparé / Non préparé Status Badge

### Community 113 - "Git Logo"
Cohesion: 0.70
Nodes (5): Git Logo, Branch and Commit Graph Model, Git Version Control System, Red Rotated-Square (Diamond) Icon Composition, White Node-and-Line Branch Motif

### Community 114 - "GitHub Repository"
Cohesion: 0.50
Nodes (5): anubus298 (El arari Safouane), Badreddinesaadi (Badreddine saadi), Livraison GitHub Repository, chore: add rest of the 'realisation' (46be065), Repository Source Tree (api, app, backend, components, screens, stores)

### Community 115 - "phpMyAdmin Logo"
Cohesion: 0.70
Nodes (5): phpMyAdmin Logo, phpMyAdmin Brand, Sailboat Motif, Two-Tone Color Scheme, phpMyAdmin Wordmark

### Community 116 - "React Native Logo"
Cohesion: 0.60
Nodes (5): Atomic Orbit Motif, Light Blue Branding Palette, React Native Framework, React Native Logo, React Native Wordmark

### Community 117 - "Return Delete Dialog"
Cohesion: 0.60
Nodes (5): Annuler (Cancel) Button, Permanently Delete Return Action, Destructive Action Confirmation Pattern, Confirm Return Deletion Dialog, Supprimer (Delete) Button

### Community 118 - "Voyage Delete Dialog"
Cohesion: 0.60
Nodes (5): Annuler (Cancel) Button, Supprimer (Delete) Button, Voyage Deletion Confirmation Dialog, Destructive Delete Warning Message, Confirmer la suppression du voyage

### Community 119 - "Transfer Detail Endpoints"
Cohesion: 0.50
Nodes (4): GET/POST/DELETE /api/homescreen/details_demande_transfert.php, Create Product in Demande Transfert, Delete Product from Demande Transfert, Details Demande Transfert

### Community 120 - "Product Lots Endpoints"
Cohesion: 0.50
Nodes (4): GET /api/produit/lots_produits.php, GET /api/produit/produits.php, List Produits, Get Lots of Product

### Community 121 - "Expo Logo"
Cohesion: 0.83
Nodes (4): Expo Logo, Expo Brand Identity, Expo Chevron Symbol, Expo Wordmark

### Community 122 - "Adaptive Icon Template"
Cohesion: 0.83
Nodes (4): Android Adaptive Icon Background Template, Adaptive Icon Layer System, Adaptive Icon Keyline Grid, Adaptive Icon Safe Zone

### Community 123 - "App Icon Asset"
Cohesion: 0.83
Nodes (4): App Icon (Blue A-Mark), Center Anchor Point Marker, Blue Gradient Chevron/A Mark, Geometric Construction Guides

### Community 124 - "SDK WOOD Logo"
Cohesion: 0.67
Nodes (4): Orange Swirling Flame/Leaf Mark, SDK WOOD Brand Identity, SDK WOOD Logo, SDK WOOD Wordmark

### Community 125 - "Splash Icon Light"
Cohesion: 0.67
Nodes (3): Flame Petal Mark, Light Theme Splash Variant, Splash Screen Icon

### Community 126 - "MySQL Logo"
Cohesion: 0.83
Nodes (4): MySQL Database, MySQL Logo, MySQL Wordmark, Sakila Dolphin Mascot

### Community 127 - "Postman Logo"
Cohesion: 0.83
Nodes (4): Postman Astronaut Mark, Postman Logo, Orange Circular Logomark, Postman (Brand/Product)

### Community 128 - "Onfleet Logo"
Cohesion: 0.67
Nodes (4): Onfleet Brand Gradient, Onfleet Infinity Mark, Onfleet Logo, Onfleet Wordmark

### Community 129 - "SDK WOOD Brand Logo"
Cohesion: 0.83
Nodes (4): SDK WOOD Brand Identity, SDK WOOD Brand Logo, Orange Leaf Abstract Mark, SDK WOOD Wordmark

### Community 130 - "BL Action Bottom Sheet"
Cohesion: 0.83
Nodes (4): Sélectionner une action BL Bottom Sheet, Bon de Livraison (BL), BL Selection Option Card, Client Voyage Summary Header

### Community 131 - "VS Code Logo"
Cohesion: 0.50
Nodes (4): VS Code Logo Asset (vscode-logo.png), Blue Angular Fold Logo Motif, Visual Studio Code, Visual Studio Code Brand Mark

### Community 133 - "Metro Config"
Cohesion: 0.50
Nodes (3): config, { getSentryExpoConfig }, @sentry/react-native

### Community 134 - "Auth Postman Requests"
Cohesion: 0.50
Nodes (4): Login Example, Get Current User, Login Chauffeur, Login

### Community 135 - "Visit Photo Utilities"
Cohesion: 0.67
Nodes (3): deleteVisitPhoto, uploadVisitPhoto, VisitPhoto schema

### Community 136 - "Clients Endpoints"
Cohesion: 1.00
Nodes (3): ErpClient schema, listClients, List clients example

### Community 137 - "Android Foreground Icon"
Cohesion: 1.00
Nodes (3): Android Icon Foreground, Android Adaptive Icon Foreground Layer, Blue Chevron Mark

### Community 138 - "React Logo Variants"
Cohesion: 1.00
Nodes (3): Atomic Orbit Motif, React, React Logo (@2x)

### Community 139 - "SDKWood Adaptive Icon"
Cohesion: 1.00
Nodes (3): Android Adaptive Launcher Icon, SDKWood Adaptive Icon, Orange Wood-Grain Gradient Logo Mark

### Community 140 - "Splash Icon Motif"
Cohesion: 1.00
Nodes (3): Splash Icon, Concentric Circles Motif, Minimal Monochrome Line-Art Style

### Community 141 - "PHP Logo"
Cohesion: 1.00
Nodes (3): elePHPant Mascot, PHP Programming Language, PHP Logo (elePHPant)

## Knowledge Gaps
- **660 isolated node(s):** `BLResponse`, `DemandeTransfertDetails`, `DeleteProductFromDTRequest`, `LotInsertItem`, `LotUpdateItem` (+655 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 697 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `Product & Lots API` to `Demande Transfert API`, `Auth & App Shell`, `App Routing & Drawer`, `Stack Layouts`, `Projet Location API`, `Return API`, `Reference Data & Clients`, `Quality Report API`, `Visit Details & Photos`, `Icon Symbol`, `Reusable Card Components`, `Nested Stack Layouts`, `Package Manifest`, `RVT Analytics`, `Edit & Create Screens`, `Visits API`, `Rounds API`, `Voyage API`, `BL Selection & API`, `Rotation Chauffeur API`, `Auth & Delete Sheets`, `Camera Screen`, `Layouts & Offline Notice`, `Button Component`, `PDF Download Utilities`, `Quality Reports List`, `Voyage Details Screen`, `Ville & Chauffeur Selection`, `Voyage Summary Screen`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Expo Dependencies` to `Package Manifest`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `useSession()` connect `Reference Data & Clients` to `Demande Transfert API`, `Auth & App Shell`, `App Routing & Drawer`, `Projet Location API`, `Return API`, `Quality Report API`, `Visit Details & Photos`, `Reusable Card Components`, `Nested Stack Layouts`, `RVT Analytics`, `Edit & Create Screens`, `Visits API`, `Rounds API`, `Voyage API`, `BL Selection & API`, `Rotation Chauffeur API`, `Auth & Delete Sheets`, `Quality Reports List`, `Voyage Details Screen`, `Ville & Chauffeur Selection`, `Voyage Summary Screen`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `BLResponse`, `DemandeTransfertDetails`, `DeleteProductFromDTRequest` to the rest of the system?**
  _660 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Demande Transfert API` be split into smaller, more focused modules?**
  _Cohesion score 0.055288461538461536 - nodes in this community are weakly interconnected._
- **Should `Auth & App Shell` be split into smaller, more focused modules?**
  _Cohesion score 0.06041986687147977 - nodes in this community are weakly interconnected._
- **Should `RVT Reference Data` be split into smaller, more focused modules?**
  _Cohesion score 0.050980392156862744 - nodes in this community are weakly interconnected._