# Demande de Transfert — API Documentation

**Base paths:**

- Header/CRUD: `/api/homescreen/demande_transfert.php`
- Details/Products/Lots: `/api/homescreen/details_demande_transfert.php`
- Preparation: `/api/homescreen/preparation_transfert.php`
- Validation: `/api/homescreen/validation_transfert.php`

**Authentication:** All endpoints require a valid `auth_token` header.

**Backend contract (owner-facing):**

- Implementation guide: [`api/docs/DEMANDE_TRANSFERT.module.md`](../api/docs/DEMANDE_TRANSFERT.module.md)
- OpenAPI 3.1: [`api/docs/DEMANDE_TRANSFERT.openapi.yaml`](../api/docs/DEMANDE_TRANSFERT.openapi.yaml)

**Status labels:** “implemented” describes the current PHP backend; “target”
describes the contract the frontend expects but the backend does not implement
yet.

---

## 1. Header Endpoint — `demande_transfert.php`

### 1.1 List Demande de Transferts

| Field      | Value    |
| ---------- | -------- |
| **Method** | `GET`    |
| **Auth**   | Required |

#### Query Parameters

| Parameter          | Type   | Required | Description                                                                                                  |
| ------------------ | ------ | -------- | ------------------------------------------------------------------------------------------------------------ |
| `page`             | int    | No       | Page number (default: 1, perPage: 10)                                                                        |
| `searchquery`      | string | No       | Global search across reference, observation, DUM, matricule, transporteur, statut, depot names, creator name |
| `reference`        | string | No       | Filter by reference (LIKE)                                                                                   |
| `date`             | string | No       | Filter by date (exact match `DATE(dt.date)`)                                                                 |
| `observation`      | string | No       | Filter by observation (LIKE)                                                                                 |
| `demandeur`        | string | No       | Filter by creator name (LIKE on nom, prenom, or concatenated)                                                |
| `depotSource`      | string | No       | Filter by source depot name (LIKE)                                                                           |
| `depotDestination` | string | No       | Filter by destination depot name (LIKE)                                                                      |
| `dum`              | string | No       | Filter by DUM (LIKE)                                                                                         |
| `matricule`        | string | No       | Filter by matricule (LIKE)                                                                                   |
| `transporteur`     | string | No       | Filter by transporteur (LIKE)                                                                                |
| `statut`           | string | No       | Filter by status (exact match)                                                                               |

#### Response

```json
{
  "status": true,
  "pagination": {
    "page": 1,
    "perPage": 10,
    "total": 25,
    "totalPages": 3
  },
  "data": [
    {
      "id": 1,
      "reference": "DT250001",
      "date": "2024-01-15 10:00:00",
      "idDepotSource": 2,
      "idDepotDestination": 5,
      "dum": "DUM-2024-001",
      "transporteur": "Transport SARL",
      "matricule": "AB-123-CD",
      "observation": "Urgent delivery",
      "idCreate": 3,
      "statut": "Brouillon",
      "depot_source": "Dépôt Casablanca",
      "depot_destination": "Dépôt Tanger",
      "createur": "Dupont Jean"
    }
  ]
}
```

---

### 1.2 Create Demande de Transfert

| Field            | Value              |
| ---------------- | ------------------ |
| **Method**       | `POST`             |
| **Content-Type** | `application/json` |
| **Auth**         | Required           |

#### Request Body

| Field                | Type   | Required | Description          |
| -------------------- | ------ | -------- | -------------------- |
| `idDepotSource`      | int    | Yes      | Source depot ID      |
| `idDepotDestination` | int    | Yes      | Destination depot ID |
| `dum`                | string | No       | DUM reference        |
| `transporteur`       | string | No       | Transporter name     |
| `matricule`          | string | No       | Vehicle registration |
| `observation`        | string | No       | Observation text     |

> **Reference generation:** The backend auto-generates the reference as `DT` + sequential number (e.g., `DT2500001`). The `statut` is always set to `Brouillon` on creation. The `idCreate` is set to the authenticated user's ID.

#### Response

```json
{
  "status": true,
  "message": "Demande créée",
  "data": {
    "id": 15,
    "reference": "DT2500001"
  }
}
```

---

### 1.3 Update / Change Statut

| Field            | Value              |
| ---------------- | ------------------ |
| **Method**       | `PUT`              |
| **Content-Type** | `application/json` |
| **Auth**         | Required           |

This endpoint handles **statut transitions** based on the current status and user role:

| Current Statut | Condition                      | New Statut | Fields Updated                                                     |
| -------------- | ------------------------------ | ---------- | ------------------------------------------------------------------ |
| `Brouillon`    | `idCreate == userId` (creator) | `Envoye`   | `idSigneDemamdeur`, `dateSingeDemandeur`, `idEnvoie`, `dateEnvoie` |
| `Encours`      | `userRole == 'admin'`          | `Envoye`   | `idEnvoie`, `dateEnvoie`                                           |
| `Envoye`       | `userRole == 'admin'`          | `Reçue`    | `idRecu`, `dateRecu`                                               |

> **Note:** The frontend `updateDemandeTransfert` call (which sends `transporteur`, `matricule`, `observation`, `statut`) hits the same PUT endpoint, but the backend **only processes statut changes**, not field updates. **There is no backend endpoint for updating DT header fields.**

#### Request Body

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `id`  | int  | Yes      | DT ID       |

> If no statut transition applies, the response returns `"Aucune action"`.

#### Response

```json
{ "status": true, "message": "Demande envoyée" }
```

---

### 1.4 Delete Demande de Transfert

| Field            | Value              |
| ---------------- | ------------------ |
| **Method**       | `DELETE`           |
| **Content-Type** | `application/json` |
| **Auth**         | Required           |

#### Request Body

| Field | Type | Required | Description     |
| ----- | ---- | -------- | --------------- |
| `id`  | int  | Yes      | DT ID to delete |

#### Behavior

Cascading delete: removes associated `transfer_lots`, then `demandetransfert_details`, then `demandetransfert`.

#### Response

```json
{ "status": true, "message": "Supprimé" }
```

---

## 2. Details Endpoint — `details_demande_transfert.php`

### 2.1 Get DT Details (Products + Lots)

| Field      | Value    |
| ---------- | -------- |
| **Method** | `GET`    |
| **Auth**   | Required |

#### Query Parameters

| Parameter | Type   | Required | Description             |
| --------- | ------ | -------- | ----------------------- |
| `idDT`    | int    | Yes      | Demande de transfert ID |
| `details` | string | Yes      | Must be `"1"`           |

#### Response

```json
{
  "status": true,
  "idDT": 15,
  "data": {
    "details": [
      {
        "id": 1,
        "idDT": 15,
        "idProduit": 42,
        "nbrFDX": 5,
        "Qte": 100,
        "unite": "pcs",
        "preparer": "Non",
        "produit": "Product Name",
        "unite_v": "pcs",
        "lots": [
          {
            "idItem": 1,
            "idProduit": 42,
            "Lot": "LOT-001",
            "preparer": "Non",
            "qte": 50,
            "old_lot": "LOT-001",
            "depotId": 2,
            "depotName": "Dépôt Casablanca"
          }
        ]
      }
    ]
  }
}
```

---

### 2.2 Add Product

**Backend status:** implemented (`POST`, `type: "detail"`).

| Field            | Value              |
| ---------------- | ------------------ |
| **Method**       | `POST`             |
| **Content-Type** | `application/json` |
| **Auth**         | Required           |

> **Règle métier :** l'ajout d'un produit n'est autorisé que lorsque la demande
> est au statut `Brouillon`.

#### Request Body

| Field       | Type   | Required | Description           |
| ----------- | ------ | -------- | --------------------- |
| `type`      | string | Yes      | Must be `"detail"`    |
| `idDT`      | int    | Yes      | DT ID                 |
| `idProduit` | int    | Yes      | Product ID            |
| `qte`       | number | Yes      | Quantity              |
| `nbrFDX`    | int    | Yes      | Number of FDX         |
| `unite`     | string | Yes      | Unit (`pcs` or `fdx`) |

This action only creates the `demandetransfert_details` row. Lots are attached
with `type: "detail_lots"` (§2.3) or the lot actions in §2.4/§2.5.

#### Response

```json
{
  "status": true,
  "idItem": 25,
  "message": "Produit ajouté"
}
```

---

### 2.3 Add Initial Lots to a Product

**Backend status:** implemented (`POST`, `type: "detail_lots"`).

Adds lots to an existing product detail. This action does **not** create the
product detail: `idItem` must reference a row that already exists.

| Field            | Value              |
| ---------------- | ------------------ |
| **Method**       | `POST`             |
| **Content-Type** | `application/json` |
| **Auth**         | Required           |

#### Request Body

| Field       | Type   | Required | Description                                    |
| ----------- | ------ | -------- | ---------------------------------------------- |
| `type`      | string | Yes      | Must be `"detail_lots"`                        |
| `idItem`    | int    | Yes      | Existing product detail ID                     |
| `idProduit` | int    | Yes      | Product ID                                     |
| `lots`      | array  | No       | Lots: `[{Lot: string, qte: number}]` (default `[]`) |

#### Behavior

- Inserts the supplied rows into `transfer_lots`.
- Does not validate stock, product, color, length, DT status, or duplicate lots.
- Does not recalculate `Qte` / `nbrFDX` on the product detail.
- With `lots: []`, the endpoint returns success without inserting anything.

#### Response

```json
{
  "status": true,
  "message": "Lots ajoutés"
}
```

---

### 2.4 Add a Lot

**Backend status:** target contract — **not implemented yet**. The current
backend has no `ajouter_lot` action.

> **Règle métier :** l’ajout d’un lot n’est autorisé qu’au statut `Brouillon`,
> sur un produit non préparé. Le lot doit appartenir au produit, respecter sa
> couleur et sa longueur, avoir du stock et ne pas déjà figurer dans la demande.

| Field            | Value              |
| ---------------- | ------------------ |
| **Method**       | `PUT`              |
| **Content-Type** | `application/json` |
| **Auth**         | Required           |

#### Request Body

| Field       | Type   | Required | Description                 |
| ----------- | ------ | -------- | --------------------------- |
| `type`      | string | Yes      | Must be `"ajouter_lot"`      |
| `idDT`      | int    | Yes      | DT ID                       |
| `idItem`    | int    | Yes      | Product detail ID           |
| `idProduit` | int    | Yes      | Product ID                  |
| `lot`       | string | Yes      | Lot number to add           |

#### Behavior (target)

- Inserts `transfer_lots` with `preparer = "Non"`, `qte = lot.solde`,
  `qte_uv = lot.qte_uv`, `idModif = user ID`, and `old_lot = ""`.
- Recalculates `Qte` and `nbrFDX` on `demandetransfert_details`.
- Business errors keep the existing convention: HTTP 200 with `status: false`
  and a `code` (`VALIDATION_ERROR`, `NOT_FOUND`, `DT_NON_MODIFIABLE`,
  `PRODUIT_PREPARE`, `CRITERES_NON_RESPECTES`, `LOT_SANS_STOCK`,
  `LOT_DEJA_UTILISE`). Exact rules: module guide §4.5.

---

### 2.5 Replace a Lot

**Backend status:** target contract — **not implemented yet**. The current
backend has no `modifier_lot` action; it only exposes the legacy bulk
`update_lot` action described in §2.7.

> **Règle métier :** le remplacement d’un lot est autorisé aux statuts
> `Brouillon`, `Encours`, et `Envoye`. Il est refusé au statut `Reçue` et sur un
> lot déjà préparé. La quantité du lot courant est conservée.

| Field            | Value              |
| ---------------- | ------------------ |
| **Method**       | `PUT`              |
| **Content-Type** | `application/json` |
| **Auth**         | Required           |

#### Request Body

| Field       | Type   | Required | Description                 |
| ----------- | ------ | -------- | --------------------------- |
| `type`      | string | Yes      | Must be `"modifier_lot"`    |
| `idDT`      | int    | Yes      | DT ID                       |
| `idItem`    | int    | Yes      | Product detail ID           |
| `idProduit` | int    | Yes      | Product ID                  |
| `oldLot`    | string | Yes      | Current lot number          |
| `newLot`    | string | Yes      | Replacement lot number      |

#### Behavior (target)

- Requires the current `transfer_lots` row and `preparer <> "Oui"`.
- Requires the replacement lot to use the same product, color, and length, have
  stock, differ from the current lot, and not already appear in the DT.
- Preserves the current lot `qte`; rejects the replacement with
  `LOT_STOCK_INSUFFISANT` when `solde < qte`.
- Sets `old_lot = oldLot`, `Lot = newLot`, `qte_uv = newLot.qte_uv`, and
  `idModif = user ID`, then recalculates detail `Qte` and `nbrFDX`.
- Business errors keep the existing convention: HTTP 200 with `status: false`
  and a `code` (`DT_NON_MODIFIABLE` for `Reçue`, `LOT_PREPARE` for a prepared
  lot, plus the same eligibility codes as adding a lot). Exact rules: module
  guide §5.4.

---

### 2.6 Delete Product Detail

| Field            | Value              |
| ---------------- | ------------------ |
| **Method**       | `DELETE`           |
| **Content-Type** | `application/json` |
| **Auth**         | Required           |

#### Request Body

| Field  | Type   | Required | Description                     |
| ------ | ------ | -------- | ------------------------------- |
| `type` | string | Yes      | `"detail"` for product deletion |
| `id`   | int    | Yes      | Product detail ID               |

Also supports `type: "transfert"` to delete an entire DT (same as the main endpoint DELETE).

---

### 2.7 Bulk Update Lots (Legacy, Implemented)

**Backend status:** implemented (`PUT`, `type: "update_lot"`). This is the only
lot-write action currently implemented on `details_demande_transfert.php`; the
frontend no longer calls it.

| Field            | Value              |
| ---------------- | ------------------ |
| **Method**       | `PUT`              |
| **Content-Type** | `application/json` |
| **Auth**         | Required           |

#### Request Body

| Field         | Type  | Required | Description                                              |
| ------------- | ----- | -------- | -------------------------------------------------------- |
| `type`        | string | Yes     | Must be `"update_lot"`                                   |
| `userId`      | int   | No       | Value written to `idModif` (defaults to `0`)             |
| `lots_update` | array | No       | `[{idItem, idProduit, old_lot, new_lot, qte}]`           |
| `lots_insert` | array | No       | `[{idItem, idProduit, Lot, qte}]`                        |
| `lots_delete` | array | No       | `[{idItem, idProduit, Lot}]`                             |

#### Actual Behavior

- All replacements are validated before any write; an invalid item rolls back
  the transaction.
- `Brouillon`: no product, color, or length criterion is enforced.
- Other statuses: the replacement lot must belong to the same product, have the
  same color and length, and have `solde > 0`.
- The replacement lot must not already exist on the same `idItem`.
- **`Reçue` is not rejected**, prepared lots are not rejected, and the supplied
  `qte` overwrites the current quantity.
- Detail `Qte` / `nbrFDX` are **not recalculated**.
- Error codes from validation include `NOT_FOUND`, `LOT_DEJA_AFFECTE`,
  `CRITERES_NON_RESPECTES`, and `LOT_SANS_STOCK`.

#### Response

```json
{
  "status": true,
  "message": "Lots update OK"
}
```

---

## 3. Preparation Endpoint — `preparation_transfert.php`

> **Règle métier :** la préparation d'un produit ou d'un lot n'est autorisée que
> lorsque le statut de la demande de transfert est `Encours` ou `Envoye`. Pour
> tout autre statut (`Brouillon`, `Reçue`), l'action est refusée.

### 3.1 Get Detail + Lots by idItem

| Field      | Value    |
| ---------- | -------- |
| **Method** | `GET`    |
| **Auth**   | Required |

#### Query Parameters

| Parameter | Type | Required | Description       |
| --------- | ---- | -------- | ----------------- |
| `idItem`  | int  | Yes      | Product detail ID |

#### Response

```json
{
  "status": true,
  "detail": { "id": 1, "idDT": 15, "idProduit": 42, ... },
  "lots": [ { "idItem": 1, "idProduit": 42, "Lot": "LOT-001", ... } ]
}
```

---

### 3.2 Save Lots (replace all)

| Field            | Value              |
| ---------------- | ------------------ |
| **Method**       | `POST`             |
| **Content-Type** | `application/json` |
| **Auth**         | Required           |

Deletes all existing lots for the idItem/idProduit pair, then re-inserts the provided lots and recalculates `Qte` and `nbrFDX` on the detail.

#### Request Body

| Field       | Type  | Required | Description                              |
| ----------- | ----- | -------- | ---------------------------------------- |
| `idItem`    | int   | Yes      | Product detail ID                        |
| `idProduit` | int   | Yes      | Product ID                               |
| `lots`      | array | No       | New lots: `[{lot: string, qte: number}]` |

---

### 3.3 Prepare a Lot

| Field            | Value              |
| ---------------- | ------------------ |
| **Method**       | `PUT`              |
| **Content-Type** | `application/json` |
| **Auth**         | Required           |

#### Request Body (action = `preparer_lot`)

| Field    | Type   | Required | Description           |
| -------- | ------ | -------- | --------------------- |
| `action` | string | Yes      | `"preparer_lot"`      |
| `idItem` | int    | Yes      | Product detail ID     |
| `lot`    | string | Yes      | Lot number to prepare |

Sets `preparer = 'Oui'` and `idModif` on the matching `transfer_lots` row.

---

### 3.4 Modify a Lot (Legacy)

> **Legacy :** this action predates the target `details_demande_transfert.php`
> `type: "modifier_lot"`. The frontend uses the contract documented in
> §2.5. This action has no statut or eligibility validation and requires the
> caller to pass `qte`.

| Field      | Value    |
| ---------- | -------- |
| **Method** | `PUT`    |
| **Auth**   | Required |

#### Request Body (action = `modifier_lot`)

| Field       | Type   | Required | Description        |
| ----------- | ------ | -------- | ------------------ |
| `action`    | string | Yes      | `"modifier_lot"`   |
| `idItem`    | int    | Yes      | Product detail ID  |
| `idProduit` | int    | Yes      | Product ID         |
| `oldLot`    | string | Yes      | Current lot number |
| `newLot`    | string | Yes      | New lot number     |
| `qte`       | number | Yes      | New quantity       |

Updates the lot and recalculates `Qte`/`nbrFDX` on the detail.

---

### 3.5 Delete Product + Lots (by idItem)

| Field      | Value    |
| ---------- | -------- |
| **Method** | `DELETE` |
| **Auth**   | Required |

#### Request Body

| Field    | Type | Required | Description       |
| -------- | ---- | -------- | ----------------- |
| `idItem` | int  | Yes      | Product detail ID |

Deletes all `transfer_lots` for this idItem, then the `demandetransfert_details` row.

---

## 4. Validation Endpoint — `validation_transfert.php`

This endpoint handles server-side permission checks and statut transitions.

### 4.1 List DTs (with permission filter)

| Field          | Value               |
| -------------- | ------------------- |
| **Method**     | `GET`               |
| **Auth**       | Required            |
| **Permission** | `can_view` required |

#### Query Parameters

| Parameter | Type   | Required | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| `page`    | int    | No       | Page number                  |
| `perPage` | int    | No       | Items per page (default: 10) |
| `id`      | int    | No       | Filter by DT ID              |
| `statut`  | string | No       | Filter by statut             |

> **Note:** This is a separate listing endpoint that checks `can_view` permission from the `permissions` table. It is **not used by the frontend**.

---

### 4.2 Prepare a Product Item

| Field          | Value                 |
| -------------- | --------------------- |
| **Method**     | `POST`                |
| **Auth**       | Required              |
| **Permission** | `can_update` required |

#### Request Body (action = `preparerItem`)

| Field         | Type   | Required | Description       |
| ------------- | ------ | -------- | ----------------- |
| `action`      | string | Yes      | `"preparerItem"`  |
| `id_item`     | int    | Yes      | Product detail ID |
| `id_document` | int    | Yes      | DT ID             |

Sets `preparer = 'Oui'` on the detail. If all items in the DT are prepared, auto-sets `statut = 'Envoye'` and `dateEnvoie = NOW()`.

---

### 4.3 Prepare a Lot

| Field          | Value                 |
| -------------- | --------------------- |
| **Method**     | `POST`                |
| **Auth**       | Required              |
| **Permission** | `can_update` required |

#### Request Body (action = `preparerLot`)

| Field     | Type   | Required | Description                                                             |
| --------- | ------ | -------- | ----------------------------------------------------------------------- |
| `action`  | string | Yes      | `"preparerLot"`                                                         |
| `id_item` | int    | Yes      | Product detail ID                                                       |
| `id_lot`  | int    | Yes      | Lot ID (note: different from `lot` string in preparation_transfert.php) |

---

### 4.4 Cancel Preparation

| Field          | Value                 |
| -------------- | --------------------- |
| **Method**     | `POST`                |
| **Auth**       | Required              |
| **Permission** | `can_update` required |

#### Request Body (action = `annulerPreparation`)

| Field         | Type   | Required | Description            |
| ------------- | ------ | -------- | ---------------------- |
| `action`      | string | Yes      | `"annulerPreparation"` |
| `id_item`     | int    | Yes      | Product detail ID      |
| `id_document` | int    | Yes      | DT ID                  |

Sets `preparer = 'Non'` on the item and `statut = 'Encours'` on the DT.

> **Note:** This action is defined in the backend but **NOT implemented in the frontend**.

---

### 4.5 Final Validation

| Field          | Value                  |
| -------------- | ---------------------- |
| **Method**     | `POST`                 |
| **Auth**       | Required               |
| **Permission** | `can_achever` required |

#### Request Body (action = `validation`)

| Field    | Type   | Required | Description    |
| -------- | ------ | -------- | -------------- |
| `action` | string | Yes      | `"validation"` |
| `id`     | int    | Yes      | DT ID          |

Sets `statut = 'Reçue'`, `idRecu = userId`, `dateRecu = NOW()`.

> **Note:** This action is defined in the backend but **NOT implemented in the frontend**. The frontend uses a simpler PUT on `demande_transfert.php` for statut changes.

---

## Statut Values

| Value       | Label                  | Description                                  |
| ----------- | ---------------------- | -------------------------------------------- |
| `Brouillon` | Brouillon (Draft)      | Initial status on creation                   |
| `Encours`   | En cours (In Progress) | Processing                                   |
| `Envoye`    | Envoyé (Sent)          | Sent/signed by creator or validated by admin |
| `Reçue`     | Reçue (Received)       | Final validated status                       |

### Statut Transition Flow

```
Brouillon --[creator signs]--> Envoye
Encours   --[admin approves]--> Envoye
Envoye    --[admin validates]--> Reçue
```

---

## Frontend ↔ Backend Differences

| Frontend Call                                                            | Backend Exists? | Notes                                                                                                                                                |
| ------------------------------------------------------------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `updateDemandeTransfert` (PUT with transporteur, matricule, observation) | **NO**          | The backend PUT only handles statut transitions, NOT field updates. Updating transporteur/matricule/observation is **not supported** by the backend. |
| `changeDTStatut` (PUT with `id` and `statut`)                            | Partial         | The backend determines the new statut based on current statut and user role, NOT from a `statut` field in the request                                |
| `addProductToDT` (POST with `type: "detail_lots"`)                       | **NO**          | Payload mismatch: `detail_lots` requires `idItem` and only inserts lots. Product creation requires `type: "detail"` (§2.2); use `detail_lots` only for initial lots (§2.3) |
| `getAddableTransferLots` / `getReplaceableTransferLots` (GET lots with `idDT`) | Yes     | `lots_produits.php` implements `ajoutable=1` and `remplacable=1` with `idDT` (§Produits)                                                              |
| `ajouterDemandeTransfertLot` (PUT with `type: "ajouter_lot"`)           | **NO**          | Target contract documented in §2.4; the server must implement it                                                                                    |
| `remplacerDemandeTransfertLot` (PUT with `type: "modifier_lot"`)        | **NO**          | Target contract documented in §2.5; the server currently exposes only legacy `update_lot` (§2.7)                                                    |
| `listDemandeTransfert` search                                            | Yes             | `searchquery` matches `searchquery` backend param                                                                                                    |
| `deleteProductFromDT` (DELETE with `type: "detail"`)                     | Yes             | Matches `details_demande_transfert.php` DELETE with `type: "detail"`                                                                                 |
| `preparerDemandeTransfert` (POST for product/lot)                        | Yes             | Backend uses `validation_transfert.php` with `action: "preparerItem"` or `"preparerLot"`                                                             |
| `validation_transfert.php` GET listing                                   | **NOT USED**    | Frontend lists DTs via `demande_transfert.php` GET                                                                                                   |
| `validation_transfert.php` POST `annulerPreparation`                     | **NOT USED**    | No cancel preparation UI in frontend                                                                                                                 |
| `validation_transfert.php` POST `validation`                             | **NOT USED**    | Frontend uses PUT on `demande_transfert.php` for statut changes                                                                                      |

---

## Critical Backend Gaps (Frontend Cannot Work Without Workarounds)

1. **No PATCH/PUT for DT field updates:** The backend PUT endpoint only handles statut transitions. Updating `transporteur`, `matricule`, or `observation` after creation is **not supported**.

2. **New lot write actions are not implemented server-side:** the frontend calls `ajouter_lot` and `modifier_lot` on `details_demande_transfert.php`. The current backend only exposes the legacy bulk `update_lot` action (§2.7). The read side (`ajoutable=1` and `remplacable=1` with `idDT` on `lots_produits.php`) **is** implemented.

3. **Statut change is role-based, not free-form:** The frontend's `StatutSelectorBottomSheetContent` allows selecting any statut, but the backend only allows specific transitions based on current statut + user role.

4. **Add-product frontend call targets the wrong action:** `addProductToDT` sends `type: "detail_lots"`, but product creation requires `type: "detail"` (§2.2). As written, the backend creates no product row and returns success because `lots` is empty.

---

## Error Responses

All endpoints return:

```json
{ "status": false, "message": "Error description" }
```

Authentication errors (HTTP 401):

```json
{ "status": false, "message": "Token manquant" }
```
