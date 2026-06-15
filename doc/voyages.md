# Voyages — API Documentation

**Base path:** `/sdkboard/api/homescreen/voyage.php`

**Authentication:** All requests require a valid `auth_token` header.

---

## Endpoints

### 1. List Voyages

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **Path** | `/sdkboard/api/homescreen/voyage.php` |
| **Auth** | Required |
| **Role filter** | Chauffeur role: only own voyages |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | int | No | Page number (default: 1) |
| `codeQuery` | string | No | Search across driver name, vehicle, brand, client, BL code, depot name |
| `idChauffeur` | int | No | Filter by driver ID |
| `idVehicule` | int | No | Filter by vehicle ID |
| `idDepot` | int | No | Filter by departure depot ID |
| `idVille` | int | No | Filter by city ID |
| `idClient` | int | No | Filter by client ID |
| `id` | int | No | Get a single voyage by ID |

#### Response

```json
{
  "status": true,
  "pagination": {
    "page": 1,
    "perPage": 10,
    "total": 50,
    "totalPages": 5
  },
  "data": [
    {
      "id": 1,
      "date_depart": "2024-01-15 08:00:00",
      "idChauffeur": 3,
      "nomChauffeur": "Dupont Jean",
      "idVehicule": 2,
      "km_depart": 12000,
      "statut": "encours",
      "depot_depart": 1,
      "depot_nom": "Dépôt Casablanca",
      "vehicule_nom": "Renault",
      "vehicule_immatriculation": "AB-123-CD",
      "idVille": 5,
      "ville_nom": "Tanger",
      "km_retour": null,
      "date_retour": null,
      "bl_list": [
        {
          "idVoyageBL": 10,
          "id": 1,
          "code": "BL-2024-001",
          "nomClient": "Client SARL",
          "datetime_document": "2024-01-15",
          "statut": "Encours",
          "images": [
            {
              "id": 1,
              "nom_fichier": "1234567_photo.jpg",
              "chemin_fichier": "data/voyage/1/1234567_photo.jpg",
              "date_upload": "2024-01-15 10:30:00"
            }
          ]
        }
      ]
    }
  ]
}
```

---

### 2. Create Voyage

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **Path** | `/sdkboard/api/homescreen/voyage.php` |
| **Content-Type** | `application/json` |
| **Auth** | Required |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date_depart` | string | Yes | Departure date/time |
| `idChauffeur` | int | Yes | Driver ID |
| `idVehicule` | int | Yes | Vehicle ID |
| `km_depart` | int | Yes | Starting km |
| `depot_depart` | int | Yes | Departure depot ID |
| `idVille` | int | Yes | Destination city ID |
| `bl_list` | array | No | Array of `{id: number}` representing BL IDs to link |

#### Response

```json
{
  "status": true,
  "message": "Voyage crée avec succés",
  "data": { "voyage_id": 42 }
}
```

---

### 3. Update Voyage

| Field | Value |
|-------|-------|
| **Method** | `PUT` |
| **Path** | `/sdkboard/api/homescreen/voyage.php` |
| **Content-Type** | `application/json` |
| **Auth** | Required |
| **Role filter** | Chauffeur role: can only update own voyages |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | int | Yes | Voyage ID to update |
| `statut` | string | No | Status (`encours`, `terminer`) |
| `idVehicule` | int | No | Vehicle ID |
| `depot_depart` | int | No | Departure depot ID |
| `date_depart` | string | No | Departure date/time |
| `km_depart` | int | No | Starting km |
| `km_retour` | int | No | Return km |
| `date_retour` | string | No | Return date/time |
| `idVille` | int | No | Destination city ID |
| `bl_list` | array | No | Replaces all BL links: `[{id: number}]` |

> **Note:** If `bl_list` is provided, all existing BL links are deleted and replaced with the new list.

> **Note for Chauffeur role:** When a chauffeur updates a voyage, the query includes `WHERE id=? AND idChauffeur=?` for authorization.

#### Response (Update fields only)

```json
{ "status": true, "message": "Voyage mis à jour avec BL" }
```

#### Response (Achever/Terminate — using `changeVoyageStatus`)

```json
{ "status": true, "message": "Voyage mis à jour avec BL" }
```

> The frontend uses the same PUT endpoint for both field updates and status changes (including `km_retour` + `date_retour` when completing a voyage).

---

### 4. Delete Voyage

| Field | Value |
|-------|-------|
| **Method** | `DELETE` |
| **Path** | `/sdkboard/api/homescreen/voyage.php` |
| **Content-Type** | `application/json` |
| **Auth** | Required |
| **Role filter** | Chauffeur role: can only delete own voyages |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | int | Yes | Voyage ID to delete |

#### Behavior

Deletes the voyage's BL links first (`voyage_bl`), then the voyage record. Uses a transaction.

#### Response

```json
{ "status": true, "message": "Voyage supprimé" }
```

---

## Supporting Endpoints

### BL List (for voyage creation)

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **Path** | `/sdkboard/api/homescreen/bl_voyage_list.php` |
| **Auth** | Required |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | int | No | Page number (default: 1) |
| `perPage` | int | No | Items per page (default: 30) |
| `codeQuery` | string | No | Search BL code |

Returns available BLs (not yet assigned to any voyage), with client info and images.

---

### Voyage Chauffeur (mobile driver endpoint)

| Field | Value |
|-------|-------|
| **Path** | `/sdkboard/api/homescreen/voyage_chauffeur.php` |

This is a **separate endpoint** for the mobile chauffeur app. It only returns voyages belonging to the authenticated chauffeur.

#### GET — List own voyages

Same pagination as main voyage endpoint. BL images and coordinates are included.

#### POST — Upload BL photo + update BL statut

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `idBL` | int | Yes | BL ID |
| `idVoyage` | int | Yes | Voyage ID |
| `statut` | string | No | BL status (default: `Livré`) |
| `images` | files | Yes | Photo files (or `images_base64` array) |
| `coordinates` | string | No | JSON coordinates |

#### PUT — Update BL or close all BLs

- With `idBL`: update a single BL statut + optionally upload photos
- With `idVoyage`: close all BLs of the voyage at once

---

## Statut Values

| Value | Label | Description |
|-------|-------|-------------|
| `encours` | En cours | Voyage is in progress |
| `terminer` | Terminé | Voyage is completed |

---

## Frontend ↔ Backend Differences

| Frontend Call | Backend Exists? | Notes |
|---------------|----------------|-------|
| `updateVoyage` (PUT with fields including `statut`, `km_retour`, `date_retour`) | Yes | Same endpoint, different payload shapes depending on update type |
| `changeVoyageStatus` (PUT with `statut`, `km_retour`, `date_retour`) | Yes | Uses the same PUT endpoint |
| `listVoyage` with `idClient` filter | Partially | Backend supports `idClient` filter via `idClient` query param but it filters through BL join |
| `getVoyageById` (GET with `?id=`) | Yes | Achieved by passing `id` as a query parameter to the list endpoint |

---

## Error Responses

All endpoints return:

```json
{ "status": false, "message": "Error description" }
```

Authentication errors return HTTP 401:

```json
{ "status": false, "message": "Token manquant" }
```