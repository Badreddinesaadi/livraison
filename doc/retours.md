# Retours — API Documentation

**Base path:** `/sdkboard/api/homescreen/retour_chauffeur.php`

**Authentication:** All requests require a valid `auth_token` header.

---

## Endpoints

### 1. List Returns

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **Path** | `/sdkboard/api/homescreen/retour_chauffeur.php` |
| **Auth** | Required |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | int | No | Page number (default: 1) |
| `perPage` | int | No | Items per page (default: 10) |
| `chauffeur_id` | int | No | Filter by driver ID |
| `client_id` | int | No | Filter by client ID |
| `id` | int | No | Get a single return by ID |

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
      "Bl_cachetet": "non",
      "reglement": "non",
      "retour_Mse": "oui",
      "reclamation": "Retard de livraison",
      "statut": "envoyer",
      "client_id": 5,
      "chauffeur_id": 3,
      "date": "2024-01-15 10:00:00",
      "commentaire": null,
      "client": "Client SARL",
      "nomChauffeur": "Dupont Jean",
      "images": [
        {
          "id": "1",
          "nom_fichier": "1234567_photo.jpg",
          "chemin_fichier": "data/retour_chauffeur/1/1234567_photo.jpg",
          "date_upload": "2024-01-15 10:30:00"
        }
      ]
    }
  ]
}
```

> **Ordering:** Results with `statut = "envoyer"` appear first, then ordered by `date DESC`.

---

### 2. Create Return

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **Path** | `/sdkboard/api/homescreen/retour_chauffeur.php` |
| **Content-Type** | `multipart/form-data` |
| **Auth** | Required |

> The authenticated user's ID is stored as `chauffeur_id` automatically.

#### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Bl_cachetet` | string | Yes | Stamped BL? (`oui` / `non`) |
| `reglement` | string | Yes | Settlement received? (`oui` / `non`) |
| `retour_Mse` | string | Yes | Return to MSE? (`oui` / `non`) |
| `client_id` | int | Yes | Client ID |
| `reclamation` | string | No | Complaint type (see values below) |

#### File Upload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `images[]` | files | Yes* | Uploaded files (at least 1 image required) |
| `images_base64` | array | Yes* | Alternative: Base64-encoded image strings |

> *One of `images` or `images_base64` must be provided.

#### Reclamation Values

| Value | Description |
|-------|-------------|
| `Retard de livraison` | Late delivery |
| `Prix incorrect` | Incorrect price |
| `Qte incorrecte` | Incorrect quantity |
| `Mauvaise qualité` | Poor quality |

#### Response

```json
{
  "status": true,
  "message": "Retour chauffeur créé avec succès",
  "data": {
    "retour_id": 15,
    "client": "Client SARL"
  }
}
```

---

### 3. Validate / Update Return

| Field | Value |
|-------|-------|
| **Method** | `PUT` |
| **Path** | `/sdkboard/api/homescreen/retour_chauffeur.php` |
| **Content-Type** | `application/json` |
| **Auth** | Required |

> **Authorization gate:** Only users with `ValidationRetourChauffeur = 'Oui'` in the `utilisateur` table can modify `statut` and `commentaire`.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | int | Yes | Return ID |
| `Bl_cachetet` | string | No | Stamped BL (`oui` / `non`) |
| `reglement` | string | No | Settlement (`oui` / `non`) |
| `retour_Mse` | string | No | Return to MSE (`oui` / `non`) |
| `reclamation` | string | No | Complaint type |
| `statut` | string | No* | Status (`terminer` / `refuser`) — only if user has validation permission |
| `commentaire` | string | No* | Comment — only if user has validation permission |

#### Response

```json
{ "status": true, "message": "Retour chauffeur mis à jour" }
```

---

### 4. Delete Return

| Field | Value |
|-------|-------|
| **Method** | `DELETE` |
| **Path** | `/sdkboard/api/homescreen/retour_chauffeur.php` |
| **Auth** | Required |

#### Request

The `id` can be provided via:
- Query parameter: `?id=15`
- JSON body: `{ "id": 15 }`

#### Behavior

Deletes associated images first (`retour_chauffeur_image`), then the return record. Verifies the ID exists before deleting.

#### Response

```json
{ "status": true, "message": "Retour chauffeur supprimé avec succès" }
```

---

## Statut Values

| Value | Label | Description |
|-------|-------|-------------|
| `envoyer` | Envoyé | Initial status after creation |
| `terminer` | Terminé | Accepted / validated |
| `refuser` | Refusé | Rejected |

---

## Frontend ↔ Backend Differences

| Frontend Call | Backend Exists? | Notes |
|---------------|----------------|-------|
| `ValidateReturn` (PUT with `id`, `statut`, `commentaire`) | Yes | Backend uses same PUT endpoint with `ValidationRetourChauffeur` permission gate |
| `deleteReturn` (DELETE with body `{id}`) | Yes | Backend also supports `?id=` query param |
| `getReturnById` (GET with `?id=`) | Yes | Filter by `id` query parameter |
| Client-side search filtering | No backend search | Frontend filters locally; no `searchquery` param on this endpoint |

---

## Error Responses

```json
{ "status": false, "message": "Error description" }
```

Missing token:

```json
{ "status": false, "message": "Token manquant" }
```

Invalid token (HTTP 401):

```json
{ "status": false, "message": "<error code>" }
```