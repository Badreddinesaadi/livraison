# Module « Détails demande de transfert » — Documentation d'implémentation

Document destiné au propriétaire de `backend/details_demande_transfert.php`.

Contrat machine : [`DEMANDE_TRANSFERT.openapi.yaml`](./DEMANDE_TRANSFERT.openapi.yaml).

## 1. Périmètre

Toutes les actions passent par un seul point d'entrée :

```
/api/homescreen/details_demande_transfert.php
```

Authentification : en-tête `auth_token`. L'utilisateur du jeton est disponible
dans `$userId`.

Actions **déjà implémentées** :

| Méthode  | `type`              | Rôle                                              |
| -------- | ------------------- | ------------------------------------------------- |
| `GET`    | —                   | Lire les produits et lots d'une demande           |
| `POST`   | `detail`            | Créer une ligne produit                           |
| `POST`   | `detail_lots`       | Ajouter des lots à une ligne existante            |
| `POST`   | `preparer_produit`  | Préparer une ligne produit                        |
| `POST`   | `preparer_lot`      | Préparer un lot                                   |
| `POST`   | `recevoir_produit`  | Marquer une ligne reçue (statut `Reçue`)           |
| `PUT`    | `update_lot`        | Mise à jour de lots par tableaux (héritée)        |
| `DELETE` | `detail`            | Supprimer une ligne produit et ses lots           |

Actions **à ajouter** :

| Méthode | `type`        | Rôle                                             |
| ------- | ------------- | ------------------------------------------------ |
| `PUT`   | `ajouter_lot` | Ajouter un lot à une demande `Brouillon`         |
| `PUT`   | `modifier_lot`| Remplacer un lot en conservant sa quantité      |

Les lectures d'éligibilité sont déjà disponibles dans
`backend/lots_produits.php` :

```
GET /api/produit/lots_produits.php?idProduit=&idDT=&ajoutable=1
GET /api/produit/lots_produits.php?idProduit=&idLot=&idDT=&remplacable=1
```

Elles appliquent déjà : bon produit, couleur/longueur (sauf remplacement en
`Brouillon`), stock, lot absent de la demande, statut `Reçue` refusé, lot
courant non préparé.

> **Écart à aligner :** `ajoutable=1` ne refuse aujourd'hui que `Reçue`, alors
> que l'action cible `ajouter_lot` est limitée à `Brouillon`. Soit filtrer aussi
> les statuts dans `lots_produits.php`, soit assumer que la liste peut être plus
> large que ce que l'écriture accepte.

---

## 2. Modèle de données

### `demandetransfert_details`

Une ligne par produit. Champs utiles : `id` (= `idItem`), `idDT`, `idProduit`,
`Qte`, `nbrFDX`, `unite`, `preparer`, `recu`.

### `transfer_lots`

```sql
CREATE TABLE transfer_lots (
  idItem     int(11) NOT NULL,
  idProduit  int(11) NOT NULL,
  Lot        varchar(50) NOT NULL,
  preparer   enum('Non','Oui') DEFAULT 'Non',
  qte        double DEFAULT NULL,
  qte_uv     double NOT NULL,
  idModif    int(11) NOT NULL,
  old_lot    varchar(50) NOT NULL,
  PRIMARY KEY (idItem, idProduit, Lot)
);
```

Contraintes à respecter pour toute insertion :

- `qte_uv`, `idModif` et `old_lot` sont **NOT NULL sans valeur par défaut** ;
- la clé primaire est `(idItem, idProduit, Lot)` ;
- un remplacement ne doit pas insérer une ligne déjà présente.

---

## 3. Convention de réponse

Le backend actuel retourne **HTTP 200** pour les erreurs métier :

```json
{
  "status": false,
  "code": "CRITERES_NON_RESPECTES",
  "message": "…"
}
```

Les erreurs HTTP sont réservées à l'authentification (`401`) et aux erreurs
serveur (`500`). Conserver cette convention pour ne pas casser le client.

---

## 4. Action à ajouter : `ajouter_lot`

### 4.1 Requête

```json
{
  "type": "ajouter_lot",
  "idDT": 15,
  "idItem": 1,
  "idProduit": 1816,
  "lot": "561440"
}
```

Tous les champs sont obligatoires. `idItem` est `demandetransfert_details.id`.

### 4.2 Règles

1. Retrouver la ligne produit et sa demande :
   `demandetransfert_details.id = idItem`, `idDT = idDT`, `idProduit = idProduit`.
   Sinon `NOT_FOUND`.
2. Statut de la demande **strictement `Brouillon`** (`statutDemandeDeLigne` +
   `enBrouillon`). Sinon `DT_NON_MODIFIABLE`.
3. Produit non préparé (`demandetransfert_details.preparer <> 'Oui'`).
   Sinon `PRODUIT_PREPARE`.
4. Lot existant en stock (`caracteristiquesLot($con, $lot, $idProduit, false)`).
   Sinon `NOT_FOUND`.
5. Mêmes critères que `lots_produits.php?ajoutable=1` :
   produit, couleur/longueur du produit lorsqu'elles sont définies,
   `solde > 0`.
6. Lot absent de la demande (`transfer_lots` via `idDT` + `idProduit`).
   Sinon `LOT_DEJA_UTILISE`.

### 4.3 Écriture

Dans une transaction :

```sql
INSERT INTO transfer_lots
  (idItem, idProduit, Lot, preparer, qte, qte_uv, idModif, old_lot)
VALUES
  (?, ?, ?, 'Non', ?, ?, ?, '');
```

Valeurs :

- `qte = caracteristiquesLot(...).solde` ;
- `qte_uv = caracteristiquesLot(...).qte_uv` ;
- `idModif = $userId` (utilisateur du jeton, pas un champ client).

Puis recalculer la ligne (même requête que
`backend/preparation_transfert.php` autour du recalcul de `modifier_lot`) :

```sql
UPDATE demandetransfert_details d
JOIN (
  SELECT idItem, COUNT(*) AS nbr, SUM(qte) AS qte
  FROM transfer_lots
  WHERE idItem = ?
  GROUP BY idItem
) x ON x.idItem = d.id
SET d.Qte = x.qte,
    d.nbrFDX = x.nbr
WHERE d.id = ?;
```

### 4.4 Réponse

```json
{ "status": true, "message": "Lot ajouté" }
```

### 4.5 Codes métier

| `code`               | Cas                                                    |
| -------------------- | ------------------------------------------------------ |
| `VALIDATION_ERROR`   | Champ manquant ou vide                                 |
| `NOT_FOUND`          | Demande, ligne, produit ou lot introuvable             |
| `DT_NON_MODIFIABLE`  | Statut différent de `Brouillon`                        |
| `PRODUIT_PREPARE`    | Ligne produit déjà préparée                            |
| `CRITERES_NON_RESPECTES` | Couleur/longueur incompatibles                    |
| `LOT_SANS_STOCK`     | `solde <= 0`                                           |
| `LOT_DEJA_UTILISE`   | Lot déjà présent dans la demande                       |

---

## 5. Action à ajouter : `modifier_lot`

### 5.1 Requête

```json
{
  "type": "modifier_lot",
  "idDT": 15,
  "idItem": 1,
  "idProduit": 1816,
  "oldLot": "561440",
  "newLot": "563872"
}
```

Tous les champs sont obligatoires.

### 5.2 Règles

1. Vérifier la ligne produit (`idItem` + `idDT` + `idProduit`) et récupérer le
   statut via `statutDemandeDeLigne`.
2. Refuser `Reçue` : `DT_NON_MODIFIABLE`.
3. Vérifier que `oldLot` existe sur `(idItem, idProduit)`.
   Sinon `NOT_FOUND`.
4. Refuser si `transfer_lots.preparer = 'Oui'` : `LOT_PREPARE`.
5. Récupérer la ligne courante (`qte` conservée).
6. Vérifier le nouveau lot :
   - produit identique ;
   - couleur et longueur identiques **sauf statut `Brouillon`** ;
   - `solde > 0` ;
   - `solde >= qte` courante, sinon `LOT_STOCK_INSUFFISANT` ;
   - absent de toute la demande (`idDT`), pas seulement de la ligne.
7. Mettre à jour la ligne :

```sql
UPDATE transfer_lots
SET old_lot = ?,
    Lot = ?,
    qte_uv = ?,
    idModif = ?
WHERE idItem = ?
  AND idProduit = ?
  AND Lot = ?;
```

- `old_lot` = `oldLot` (lot courant) ;
- `Lot` = `newLot` ;
- `qte` n'est **pas modifiée** ;
- `qte_uv` = `qte_uv` du nouveau lot ;
- `idModif` = `$userId`.

8. Recalculer `Qte` / `nbrFDX` avec la requête du §4.3.

### 5.3 Réponse

```json
{ "status": true, "message": "Lot remplacé" }
```

### 5.4 Codes métier

| `code`                  | Cas                                              |
| ----------------------- | ------------------------------------------------ |
| `VALIDATION_ERROR`      | Champ manquant                                   |
| `NOT_FOUND`             | Demande, ligne, lot courant ou nouveau lot introuvable |
| `DT_NON_MODIFIABLE`     | Statut `Reçue`                                   |
| `LOT_PREPARE`           | Lot courant déjà préparé                         |
| `CRITERES_NON_RESPECTES`| Couleur/longueur incompatibles                   |
| `LOT_SANS_STOCK`        | Nouveau lot sans stock                           |
| `LOT_STOCK_INSUFFISANT` | `solde < qte` courante                           |
| `LOT_DEJA_UTILISE`      | Nouveau lot déjà présent dans la demande         |

---

## 6. Corrections à prévoir sur les actions existantes

### 6.1 `detail_lots` est incomplet

L'insertion actuelle omet `qte_uv`, `idModif` et `old_lot`, qui sont NOT NULL.
Avec le schéma fourni, l'insertion échoue. Corriger l'insertion comme au §4.3,
et recalculer `Qte` / `nbrFDX` après l'ajout.

### 6.2 `update_lot` ne suit pas les nouvelles règles

L'action héritée :

- ne refuse ni `Reçue`, ni un lot préparé ;
- écrase `qte` avec la valeur du client ;
- ne vérifie pas `solde >= qte` ;
- ne recalcule pas `Qte` / `nbrFDX` ;
- utilise `userId` fourni par le client, pas `$userId`.

La conserver pour compatibilité, mais `modifier_lot` doit être la voie utilisée
par l'application.

### 6.3 `detail` reste l'action de création produit

Le frontend doit envoyer `type: "detail"` avec `idDT`, `idProduit`, `qte`,
`nbrFDX`, `unite`. `detail_lots` ne crée pas de ligne produit.

---

## 7. Critères d'acceptation

1. `ajouter_lot` sur une demande `Brouillon` ajoute une ligne avec
   `qte = solde`, `old_lot = ""`, `idModif = userId`, met à jour `Qte` et
   `nbrFDX`, et le lot disparaît de `lots_produits.php?ajoutable=1`.
2. `ajouter_lot` sur `Encours`/`Envoye`/`Reçue` retourne `DT_NON_MODIFIABLE`.
3. `modifier_lot` sur `Brouillon`, `Encours` ou `Envoye` conserve `qte`, met
   `old_lot`, rejette `solde < qte`, et le nouveau lot disparaît de
   `lots_produits.php?remplacable=1`.
4. `modifier_lot` sur `Reçue` ou un lot préparé est refusé.
5. Aucune action ne peut insérer un lot déjà présent dans la même demande.
6. `detail_lots` insère correctement une ligne `transfer_lots` complète.

---

## 8. Fichiers concernés

| Fichier | Rôle |
| --- | --- |
| `backend/details_demande_transfert.php` | Actions à ajouter / corriger |
| `backend/lots_produits.php` | Lectures d'éligibilité déjà implémentées |
| `sql/script.sql` | Schéma `transfer_lots` |
| `doc/demande-transfert.md` | Documentation fonctionnelle du module |
| `api/docs/DEMANDE_TRANSFERT.openapi.yaml` | Contrat HTTP |
