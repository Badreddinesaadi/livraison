# Module « Préparation devis » — Documentation fonctionnelle

## 1. Présentation du module

Le module **« Préparation devis »** permet de suivre et d'exécuter la
préparation des devis validés : identifier les devis à préparer, puis, devis
par devis, retrouver les produits à préparer avec leurs lots.

Il s'adresse aux utilisateurs en charge de la préparation (magasin / dépôt) et
donne une vue unique de :

- la **liste des devis à préparer** (document, date, client, ville, mode de
  livraison, commercial, statut, nombre de lignes) ;
- le **détail d'un devis** : produits concernés (stock, quantités réservées et
  commandées, reste à livrer, unité) et **lots** à sortir (code, quantité,
  nombre de pièces, longueur, observation, date d'entrée, dépôt).

L'API serveur est la source de vérité. L'intégration ERP reste interne au
serveur et n'est pas exposée par ce contrat. L'API attend un jeton pré-émis
dans l'en-tête `auth_token`.

> **Portée du contrat actuel** : les deux points d'entrée de lecture (liste et
> détail) et l'écriture de préparation (marquer un produit ou un lot préparé)
> sont documentés.

---

## 2. Organisation générale

Le module s'organise en deux vues :

| Vue                        | Rôle                                                              |
| -------------------------- | ----------------------------------------------------------------- |
| **DEVIS À PRÉPARER**       | Liste paginée, filtrable et recherchable des devis.               |
| **PRÉPARATION D'UN DEVIS** | Détail des produits et de leurs lots, avec l'état de préparation. |

Une réponse réussie utilise une enveloppe commune :

- `status` : booléen ;
- `data` : données retournées (objet, tableau ou `null`) ;
- `pagination` : présent uniquement pour les listes paginées (`page`,
  `perPage`, `total`, `totalPages`).

---

## 3. Vue « Devis à préparer »

Liste paginée des devis préparables. Chaque ligne expose :

| Champ           | Type         | Description                          |
| --------------- | ------------ | ------------------------------------ |
| `id`            | entier       | Identifiant du devis                 |
| `document`      | chaîne       | Code document du devis               |
| `date`          | date         | Date du devis                        |
| `client`        | `{id, name}` | Client du devis                      |
| `ville`         | `{id, name}` | Ville de livraison                   |
| `modeLivraison` | chaîne       | Mode de livraison (ex. `REMORQUE`)   |
| `commercial`    | `{id, name}` | Commercial affecté                   |
| `statut`        | chaîne       | Code du statut (ex. `valider`)       |
| `statutLabel`   | chaîne       | Libellé lisible du statut            |
| `createdby`     | `{id, name}` | Utilisateur créateur                 |
| `nbLignes`      | entier       | Nombre de lignes (produits) du devis |

**Recherche et filtres** (combinables, facultatifs) :

- recherche par **code document** (`document`) ;
- filtre par **client** (`clientId`) ;
- filtre par **statut** (`statut`) ;
- filtre par **ville** (`villeId`) ;
- filtre par **commercial** (`commercialId`) ;
- plage de **dates** : `dateFrom` / `dateTo` (bornes incluses).

**Pagination** : `page` (défaut 1) et `perPage` (défaut 50, maximum 100).

**Point d'entrée associé :**
| Fonction | Endpoint |
| --- | --- |
| Lister / rechercher les devis à préparer | `GET /api/homescreen/prepaption_devis.php` |

---

## 4. Vue « Préparation d'un devis »

Pour un devis identifié par son identifiant, la vue expose les produits et, pour
chaque produit, ses lots.

### 4.1 Produit

| Champ         | Type    | Description                                  |
| ------------- | ------- | -------------------------------------------- |
| `preparation` | booléen | `true` si le produit est entièrement préparé |
| `id`          | entier  | Identifiant du produit                       |
| `name`        | chaîne  | Nom du produit                               |
| `stock`       | décimal | Stock disponible                             |
| `qteResa`     | décimal | Quantité réservée pour ce devis              |
| `qtecmde`     | décimal | Quantité commandée sur ce devis              |
| `unite`       | chaîne  | Unité de mesure du produit                   |
| `restealivre` | décimal | Quantité restant à livrer                    |
| `lots`        | tableau | Lots du produit (voir 4.2)                   |

### 4.2 Lot

| Champ         | Type         | Description                                                      |
| ------------- | ------------ | ---------------------------------------------------------------- |
| `preparation` | booléen      | `true` si le lot est préparé                                     |
| `id`          | chaîne       | Identifiant du lot = **code du lot** (texte, identique à `code`) |
| `code`        | chaîne       | Code du lot                                                      |
| `qte`         | décimal      | Quantité du lot                                                  |
| `nbrePce`     | entier       | Nombre de pièces (non décimal)                                   |
| `long`        | chaîne       | Longueur                                                         |
| `observ`      | chaîne       | Observation                                                      |
| `dateEntree`  | date-time    | Date d'entrée (ISO 8601)                                         |
| `depot`       | `{id, name}` | Dépôt du lot                                                     |
| `createdby`   | `{id, name}` | Utilisateur créateur du lot                                      |

**Point d'entrée associé :**
| Fonction | Endpoint |
| --- | --- |
| Consulter les produits et lots d'un devis | `GET /api/homescreen/preparation_devis_produits.php?idDevis={idDevis}` |

---

## 5. Préparation : états et écriture

### 5.1 États

- L'état de préparation est porté **au niveau produit** (`preparation`) et **au
  niveau lot** (chaque lot a son propre `preparation`).
- Un produit est préparé lorsque l'ensemble de ses lots l'est.
- L'identifiant d'un lot est **son code** (chaîne de caractères, pas
  nécessairement numérique : ex. `561440`, `1607-19`).
- Les codes `statut` et `modeLivraison` sont exposés en tant que **chaînes de
  caractères** : leurs valeurs possibles ne sont pas figées par ce contrat à ce
  stade.

### 5.2 Préparer un produit ou un lot

L'écriture se fait via **un seul point d'entrée**, discriminé par le champ
`type` du corps JSON :

- **Préparer un produit** :
  `{ "type": "preparer_produit", "idDevis": <id>, "idProduit": <id> }` — la
  préparation **se propage à tous les lots** du produit ;
- **Préparer un lot** :
  `{ "type": "preparer_lot", "idDevis": <id>, "idProduit": <id>, "idLot": "<code du lot>" }`.

Règles :

- l'opération est **idempotente** : préparer un élément déjà préparé réussit
  sans effet supplémentaire ;
- elle est à **sens unique** : il n'existe pas d'action de dé-préparation
  (retour à `false`) ;
- **effet de bord** : lorsque tous les produits d'un devis sont préparés, le
  `statut` du devis est mis à jour automatiquement.

La réponse retourne le **produit mis à jour** (`data` au format `DevisProduit`),
ce qui permet de rafraîchir l'écran sans nouvel appel.

**Point d'entrée associé :**
| Fonction | Endpoint |
| --- | --- |
| Préparer un produit ou un lot | `POST /api/homescreen/preparation_devis_produits.php` |

### 5.3 Remplacer un lot

Il est possible de remplacer un lot par un autre, par exemple lorsque le lot
prévu n'est pas le bon sur le terrain. Le remplacement se fait via un `PUT`
(`PATCH` est également accepté) :

```
{
  "type": "remplacer_lot",
  "idDevis": <id>,
  "idProduit": <id>,
  "idLot": "<code du lot actuel>",
  "idNouveauLot": "<code du lot de remplacement>"
}
```

Contraintes : le nouveau lot doit avoir le **même produit, la même couleur, la
même longueur et la même section** que le lot remplacé, disposer de **stock**,
et ne pas déjà figurer sur la ligne. Le lot actuel ne doit être **ni préparé ni
livré**. Le produit remplace son lot, le devis repasse en préparation, et la
réponse retourne le produit mis à jour.

**Point d'entrée associé :**
| Fonction | Endpoint |
| --- | --- |
| Remplacer un lot d'un produit | `PUT /api/homescreen/preparation_devis_produits.php` |

---

## 6. Récapitulatif : fonctionnalité → endpoint

| Fonctionnalité                         | Vue               | Endpoint                                                  | Méthode |
| -------------------------------------- | ----------------- | --------------------------------------------------------- | ------- |
| Liste / recherche des devis à préparer | Devis à préparer  | `/api/homescreen/prepaption_devis.php`                    | GET     |
| Produits et lots d'un devis            | Préparation devis | `/api/homescreen/preparation_devis_produits.php?idDevis=` | GET     |
| Préparer un produit ou un lot          | Préparation devis | `/api/homescreen/preparation_devis_produits.php`          | POST    |
| Remplacer un lot d'un produit          | Préparation devis | `/api/homescreen/preparation_devis_produits.php`          | PUT     |

---

## 7. Cycle de vie d'une préparation

1. L'utilisateur ouvre la vue **Devis à préparer** et filtre/recherche les
   devis concernés.
2. Il ouvre un devis pour voir ses **produits** et leurs **lots** et l'état de
   préparation de chacun.
3. Si un lot ne convient pas, il le **remplace** par un lot équivalent (même
   produit, couleur, longueur et section, avec stock).
4. Il prépare physiquement les lots et les produits.
5. Il marque chaque produit ou lot comme préparé ; préparer un produit prépare
   automatiquement tous ses lots.
6. Lorsque tous les produits du devis sont préparés, le `statut` du devis est
   mis à jour automatiquement.

---

## 8. Référence au contrat

Le contrat OpenAPI complet se trouve dans `api/docs/PREPARATION_DEVIS.openapi.yaml`.
