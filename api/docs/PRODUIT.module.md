# Module « Produits » — Documentation fonctionnelle

## 1. Présentation du module

Le module **« Produits »** expose les lots de stock d'un produit. Il est
consommé par la préparation de devis pour choisir le lot à sortir et, le cas
échéant, remplacer un lot par un autre lot équivalent.

L'API serveur est la source de vérité. Les lots proviennent de la vue
`vue_lots_solde` et portent le produit, la couleur, la longueur, la quantité en
unité de vente, le dépôt et la date d'entrée. L'API attend un jeton pré-émis
dans l'en-tête `auth_token`.

> **Portée du contrat actuel** : lecture des lots d'un produit et lecture des
> lots éligibles au remplacement d'un lot de devis.

---

## 2. Enveloppe des réponses

Une réponse réussie utilise l'enveloppe commune :

- `status` : booléen (`true` si l'opération a réussi) ;
- `data` : tableau des lots retournés.

```json
{
  "status": true,
  "data": [{ "num_lot": "561440", "...": "..." }]
}
```

Une erreur retourne `status: false` et un `message` lisible.

---

## 3. Lister les lots d'un produit

`GET /api/produit/lots_produits.php?idProduit=<id>`

Retourne tous les lots du produit, triés par date d'entrée décroissante.
`idProduit` est facultatif ; sans lui, tous les lots sont retournés.

| Champ         | Type    | Description                             |
| ------------- | ------- | --------------------------------------- |
| `id_depot`    | entier  | Identifiant du dépôt                    |
| `product_id`  | entier  | Identifiant du produit                  |
| `color_id`    | entier  | Identifiant de la couleur               |
| `couleur`     | chaîne  | Libellé de la couleur                   |
| `colorCode`   | chaîne  | Code couleur                            |
| `num_lot`     | chaîne  | Code du lot                             |
| `longueur`    | chaîne  | Longueur du lot                         |
| `nbrePiece`   | chaîne  | Nombre de pièces                        |
| `observation` | chaîne  | Observation libre                       |
| `date`        | date    | Date d'entrée (ISO 8601)                |
| `nbreJrs`     | entier  | Nombre de jours depuis l'entrée         |
| `solde`       | chaîne  | Solde de stock (à caster avant comparaison) |
| `qte_uv`      | nombre  | Quantité en unité de vente              |
| `depot`       | chaîne  | Libellé du dépôt                        |
| `unite_v`     | chaîne  | Unité de vente                          |
| `tarif`       | chaîne  | Tarif du lot                            |

---

## 4. Lister les lots remplaçables d'un lot de devis

`GET /api/produit/lots_produits.php?idProduit=<id>&idLot=<code>&idDevis=<id>&remplacable=1`

Le drapeau `remplacable=1` restreint la réponse aux lots **éligibles au
remplacement** du lot `idLot`, dans le devis `idDevis`, pour le produit
`idProduit`. La réponse a la même forme que ci-dessus.

### Paramètres

| Paramètre    | Requis                  | Description                                     |
| ------------ | ----------------------- | ----------------------------------------------- |
| `idProduit`  | oui si `remplacable=1`  | Produit du lot à remplacer                      |
| `idLot`      | oui si `remplacable=1`  | Code du lot courant à remplacer                 |
| `idDevis`    | oui si `remplacable=1`  | Devis contenant le lot courant                  |
| `remplacable`| non (défaut `0`)        | `1` active le filtrage des lots remplaçables    |

L'absence de `idProduit`, `idLot` ou `idDevis` lorsque `remplacable=1` retourne
`400`.

### Règles d'éligibilité

Un lot est retourné s'il respecte **les mêmes règles que le remplacement**
(`PUT /api/homescreen/preparation_devis_produits.php`,
`type=remplacer_lot`) :

- même produit (`product_id`, donc même section) ;
- même couleur (`color_id`) ;
- même longueur (`longueur`) ;
- stock disponible (`solde > 0`) ;
- différent du lot courant (`num_lot <> idLot`) ;
- ne figure pas déjà sur la ligne du devis (`idDevis` + `idProduit`).

Le lot courant doit également être ni préparé ni livré ; cette règle reste
vérifiée par le point d'entrée de remplacement.

### Exemple

```
GET /api/produit/lots_produits.php?idProduit=1816&idLot=561440&idDevis=62164&remplacable=1
```

```json
{
  "status": true,
  "data": [
    {
      "id_depot": 12,
      "product_id": 1816,
      "color_id": 45,
      "couleur": "Blanc",
      "colorCode": "#FFFFFF",
      "num_lot": "563872",
      "longueur": "2400",
      "nbrePiece": "12",
      "observation": "",
      "date": "2026-05-02T00:00:00",
      "nbreJrs": 18,
      "solde": "42.500",
      "qte_uv": 42.5,
      "depot": "Dépôt central",
      "unite_v": "M2",
      "tarif": "125.00"
    }
  ]
}
```

---

## 5. Récapitulatif : fonctionnalité → endpoint

| Fonctionnalité                        | Endpoint                                                              | Méthode |
| ------------------------------------- | --------------------------------------------------------------------- | ------- |
| Lots d'un produit                     | `/api/produit/lots_produits.php?idProduit=`                           | GET     |
| Lots remplaçables d'un lot de devis   | `/api/produit/lots_produits.php?idProduit=&idLot=&idDevis=&remplacable=1` | GET     |

---

## 6. Codes d'erreur

| Code  | Cas                                                                 |
| ----- | ------------------------------------------------------------------- |
| `400` | Paramètres manquants ou invalides (`remplacable=1` sans contexte)   |
| `401` | Jeton `auth_token` manquant ou invalide                             |
| `404` | Lot courant introuvable (mode `remplacable=1`)                      |
| `405` | Méthode HTTP non autorisée (seul `GET` est accepté)                 |
| `500` | Erreur SQL ou interne                                               |
