# Module « Rapport de visite terrain » — Documentation fonctionnelle

## 1. Présentation du module

Le module **« Rapport de visite terrain »** est l'application mobile du réseau
commercial **SDK WOOD** (négoce de bois et panneaux au Maroc). Il permet à un
commercial de :

- enregistrer une **visite client** sur le terrain en quelques minutes
  (objectif : moins de 5 minutes par visite) ;
- qualifier le client et comprendre son activité ;
- relever les produits et marques présents chez le client ;
- analyser la concurrence et détecter des opportunités ;
- conclure la visite (commande, devis, prochaine action…) ;
- consulter l'**historique** et un **tableau de bord** de ses visites ;

L'application fonctionne principalement hors ligne à la saisie (le formulaire
est toujours utilisable) et s'appuie sur une API serveur qui est la source de
vérité des données (clients, catalogue, tournées, visites, photos, analyses).

---

## 2. Organisation générale de l'écran

L'application est organisée en deux grandes vues accessibles depuis le haut de
l'écran :

| Vue                 | Rôle                                                        |
| ------------------- | ----------------------------------------------------------- |
| **AJOUTER RAPPORT** | Saisie d'une nouvelle visite via un formulaire en 5 étapes. |
| **RAPPORTS**        | Historique des visites, tableau de bord, recherche .        |

La barre d'en-tête affiche en permanence :

- le nom du client sélectionné (ou l'activité par défaut) ;
- un **chronomètre** qui mesure le temps de remplissage ;
- le nombre de rapports enregistrés ;
- des boutons d'action (historique, vue smartphone/plein écran, réinitialiser).

Une **barre de progression** (5 étapes : Client → Profil → Marché → Opportunité
→ Action) permet de naviguer dans le formulaire. Les étapes se débloquent au
fur et à mesure.

---

## 3. Les écrans du formulaire

### Étape 1 — Qualification : le client

Ce premier écran prépare la visite.

**Ce que l'utilisateur voit et fait :**

- une **carte de localisation** avec le statut GPS (validé / refusé / non
  disponible / délai dépassé), la latitude/longitude et la précision ; un
  bouton « Réessayer » relance la capture ;
- un **champ de recherche de client** (par nom, code, ville ou catégorie) avec
  la liste des correspondances et le détail du client retenu (code, ville,
  commercial affecté, catégorie) ;
- le **rôle du contact rencontré** (Gérant, Acheteur, Commercial, Responsable
  production, Responsable chantier, Autre) ;
- le **niveau d'activité** observé (Faible / Moyen / Fort).

**Fonctionnalités mobilisées :**

- géolocalisation du téléphone ;
- recherche dans le référentiel clients.

**Points d'entrée API associés :**
| Fonction | Endpoint |
| --- | --- |
| Identifier le commercial connecté | `GET /me` |
| Récupérer la liste des clients ERP | `GET /sdkboard/api/users/clients.php` |

---

### Étape 2 — Profil terrain

Cet écran décrit l'activité et l'équipement du site visité.

**Ce que l'utilisateur voit et fait :**

- choix de **l'activité observée** : Menuisier, Revendeur, Chantier ou
  Industriel (un seul choix, le reste du formulaire s'adapte) ;
- pour un **revendeur** : présence d'un service de découpe (Oui / Non) ;
- pour un **chantier** : type de chantier, phase d'avancement et photo
  facultative du panneau de chantier ;
- pour un **industriel** : spécialités industrielles (multi-sélection) et
  précision libre si « Autre » ;
- une liste d'**équipements** adaptée au profil (machines de menuiserie,
  services du revendeur, matériel BTP, machines d'usine) avec **quantités
  observées** ;
- la **taille / importance du site** (Petite / Moyenne / Grande).

**Fonctionnalités mobilisées :**

- caméra (photo du panneau de chantier, compressée automatiquement) ;
- listes de choix pilotées par le serveur.

**Points d'entrée API associés :**
| Fonction | Endpoint |
| --- | --- |
| Charger les options et le catalogue | `GET /sdkboard/api/homescreen/rapport_terrain.php` |

---

### Étape 3 — Marché : produits et marques

Cet écran réalise le relevé terrain du stock présent chez le client.

**Ce que l'utilisateur voit et fait :**

- une **arborescence produits** par famille (Bois, Bois dur, Panneaux, BTP,
  Accessoires) ;
- sélection des **produits observés** et possibilité d'ajouter plusieurs
  **déclinaisons** du même produit ;
- pour chaque produit, le détail affiché dépend de la famille : qualité/choix,
  essence, décor, finition, épaisseur, section, dimension/longueur, quantité,
  prix — ainsi que le **niveau de présence** (Faible / Moyen / Important) ;
- un champ « Autre produit » libre ;
- les **marques observées** par famille avec niveau de présence ;
- un compteur récapitulatif (nombre de produits et de marques).

**Fonctionnalités mobilisées :**

- catalogue produits dynamique (les options de détail s'adaptent au produit et
  à son sous-type).

**Points d'entrée API associés :**
| Fonction | Endpoint |
| --- | --- |
| Charger le catalogue et les marques | `GET /sdkboard/api/homescreen/rapport_terrain.php` |
| Consulter un produit et ses options | `GET /products/{productId}` |

---

### Étape 4 — Opportunité : concurrence

Cet écran analyse la position de SDK WOOD et les opportunités.

**Ce que l'utilisateur voit et fait :**

- la **position SDK WOOD** chez ce client (Absent → Dominant) ;
- la **présence des concurrents** (multi-sélection) avec niveau de présence ;
- la détection d'une **opportunité** (Oui / Non) ; si oui :
  - le **produit/famille** concerné ;
  - le **potentiel** (Petit → Très important) ;
  - l'**horizon** (Immédiat → plus de 3 mois) ;
  - le **montant estimé** en DH (facultatif) ;
  - le **concurrent principal** (facultatif).

**Points d'entrée API associés :**
| Fonction | Endpoint |
| --- | --- |
| Charger concurrents et options | `GET /sdkboard/api/homescreen/rapport_terrain.php` |

---

### Étape 5 — Action : conclusion et suivi

Cet écran conclut la visite et définit le suivi.

**Ce que l'utilisateur voit et fait :**

- les **résultats de la visite** (Commande, Devis, Échantillon, Tarif,
  Relance, Prospection, Réclamation, RAS) — choix multiple ;
- si **Commande** : quantités commandées **Solo** et **Semi-combiné** ;
- la **prochaine action** (Appeler, Envoyer prix, Envoyer devis, Envoyer
  échantillon, Faire offre, Revisiter, Aucune) avec **échéance** (délais
  rapides ou date choisie) ;
- une **note de visite** libre, saisie au clavier ou par **dictée vocale** ;
- des **photos** de la visite (facultatives, maximum 5, compressées
  automatiquement) ;
- le bouton **VALIDER LA VISITE** (ou _Enregistrer les modifications_ en mode
  édition).

**Fonctionnalités mobilisées :**

- dictée vocale (reconnaissance vocale du navigateur) ;
- caméra (photos de la visite) ;
- envoi du rapport au serveur.

**Points d'entrée API associés :**
| Fonction | Endpoint |
| --- | --- |
| Soumettre le rapport de visite | `POST /sdkboard/api/rounds/visits.php?idempotencyKey=...` (roundId dans le corps) |
| Envoyer et traiter une photo | `POST /sdkboard/api/rounds/visits.php?action=addPhoto&id={visitId}` |
| Retirer une photo | `DELETE /sdkboard/api/rounds/visits.php?action=deletePhoto&id={visitId}&photoId={photoId}` |

---

## 4. Après validation : la confirmation

Une fois la visite validée, une **fenêtre de confirmation** s'affiche avec le
résumé (client, durée, tournée) et l'état de la synchronisation ERP.

**Actions proposées :**

- **CLIENT SUIVANT** : enchaîner sur une nouvelle visite dans la même tournée ;
- **NOUVELLE VISITE** : recommencer un formulaire vide ;
- **VOIR RAPPORT** : ouvrir le rapport complet dans la vue RAPPORTS.

---

## 5. La vue RAPPORTS

Cette vue regroupe le tableau de bord, l'historique.

### 5.1 Tableau de bord

- nombre de rapports, de clients distincts, de commandes et d'opportunités ;
- quantités commandées (Solo / Semi-combiné) ;
- taux de commande et taux d'opportunité, durée moyenne des visites ;
- classements : résultats, position SDK, produits les plus observés,
  concurrents les plus présents, villes visitées, profils clients ;
- indicateur de rapports en attente de synchronisation ERP.

### 5.2 Historique

- **recherche** dans les rapports (client, code, ville, identifiant de
  visite) ;
- **liste des visites** avec client, ville, date, statut GPS et état de
  synchronisation ;
- pour chaque rapport :
  - **Rapport** : ouverture du détail complet ;
  - **Modifier** : rechargement du formulaire pour mise à jour ;
  - **WhatsApp** : partage du texte du rapport.

### 5.3 Actions globales

**Points d'entrée API associés :**
| Fonction | Endpoint |
| --- | --- |
| Rechercher / paginer les visites | `GET /sdkboard/api/rounds/visits.php?roundId=...` |
| Consulter un rapport | `GET /sdkboard/api/rounds/visits.php?id={visitId}` |
| Mettre à jour un rapport | `PATCH /sdkboard/api/rounds/visits.php?id={visitId}` |
| Obtenir les indicateurs du tableau de bord | `GET /sdkboard/api/rounds/analytics.php` |

---

## 6. La tournée (session commerciale)

Une **tournée** regroupe plusieurs visites réalisées au cours d'une même
session.

**Ce que l'utilisateur voit et fait :**

- une bandeau « Tournée en cours · N clients enregistrés » s'affiche dès la
  première visite ;
- le bouton **Terminer tournée** ouvre le récapitulatif de session :
  - liste des visites de la tournée ;
  - partage du résumé par **e-mail** ou **WhatsApp** ;
  - **CLIENT SUIVANT** pour poursuivre ;
  - **CLÔTURER LA TOURNÉE** pour terminer la session.

**Points d'entrée API associés :**
| Fonction | Endpoint |
| --- | --- |
| Récupérer/ouvrir la tournée du commercial | `GET /sdkboard/api/rounds/rounds.php` / `POST /sdkboard/api/rounds/rounds.php?idempotencyKey=...` |
| Consulter une tournée | `GET /sdkboard/api/rounds/rounds.php?id={roundId}` |
| Lister les tournées | `GET /sdkboard/api/rounds/rounds.php` |
| Clôturer la tournée | `POST /sdkboard/api/rounds/rounds.php?action=close&id={roundId}` |
| Lister les visites de la tournée | `GET /sdkboard/api/rounds/visits.php?roundId={roundId}` |

---

## 7. Vue détaillée d'un rapport

La consultation d'un rapport affiche l'ensemble des données saisies :

- client et visite (code, ville, commercial, contact, statut GPS) ;
- profil terrain (activité, niveau, service de découpe, équipements, taille) ;
- chantier (type, phase, photo du panneau) ;
- activités industrielles ;
- produits observés (détails et présence) ;
- marché et concurrence (marques, concurrents, position SDK) ;
- opportunité (produit, potentiel, horizon, montant, concurrent principal) ;
- conclusion et suivi (résultats, quantités commandées, prochaine action,
  échéance, note) ;
- photos de la visite.

**Actions disponibles :** modifier le rapport.

---

## 8. Récapitulatif : fonctionnalité → endpoint

| Fonctionnalité                           | Écran / zone    | Endpoint                                                          | Méthode    |
| ---------------------------------------- | --------------- | ----------------------------------------------------------------- | ---------- |
| Récupération de la liste des clients     | Étape 1         | `/sdkboard/api/users/clients.php`                                 | GET        |
| Catalogue, marques, concurrents, options | Étapes 2, 3, 4  | `/sdkboard/api/homescreen/rapport_terrain.php`                    | GET        |
| Tournée en cours                         | Bandeau tournée | `/sdkboard/api/rounds/rounds.php`                                 | GET / POST |
| Détail d'une tournée                     | Tournée         | `/sdkboard/api/rounds/rounds.php?id=`                             | GET        |
| Clôture de la tournée                    | Tournée         | `/sdkboard/api/rounds/rounds.php?action=close&id=`                | POST       |
| Validation d'une visite                  | Étape 5         | `/sdkboard/api/rounds/visits.php`                                 | POST       |
| Photos de la visite                      | Étape 5         | `/sdkboard/api/rounds/visits.php?action=addPhoto&id=`             | POST       |
| Suppression d'une photo                  | Étape 5         | `/sdkboard/api/rounds/visits.php?action=deletePhoto&id=&photoId=` | DELETE     |
| Historique et recherche                  | Vue RAPPORTS    | `/sdkboard/api/rounds/visits.php?roundId=`                        | GET        |
| Détail d'un rapport                      | Vue RAPPORTS    | `/sdkboard/api/rounds/visits.php?id=`                             | GET        |
| Modification d'un rapport                | Vue RAPPORTS    | `/sdkboard/api/rounds/visits.php?id=`                             | PATCH      |
| Tableau de bord                          | Vue RAPPORTS    | `/sdkboard/api/rounds/analytics.php`                              | GET        |

---

## 9. Fonctionnalités 100 % côté appareil (sans API)

Ces fonctions restent locales au téléphone et n'appellent aucun endpoint :

- **Géolocalisation** (capture de la position au moment de la visite) ;
- **Caméra et compression** des photos ;
- **Dictée vocale** de la note ;
- **Vibrations et sons** de retour tactile ;
- **Partage WhatsApp / e-mail** des rapports et tournées ;
- **Chronomètre** de remplissage.

---

## 10. Résumé du cycle de vie d'une visite

1. Le commercial ouvre le module → sa **tournée** est récupérée ou créée.
2. Il sélectionne un **client** (recherche ERP) et sa localisation est capturée.
3. Il renseigne les étapes **Profil**, **Marché**, **Opportunité**.
4. Il conclut avec le **résultat** et la **prochaine action**, ajoute une note
   et des photos.
5. La **visite** est validée et envoyée au serveur ; la **tournée** est
   incrémentée.
6. Il peut **consulter**, **modifier**, **partager** ses
   rapports, puis **clôturer** sa tournée.
