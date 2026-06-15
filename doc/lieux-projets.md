# Lieux de Projets — API Documentation

**Base path:** `/sdkboard/api/homescreen/projet.php`

**Authentication:** All requests require a valid `auth_token` header.

---

## Endpoints

### 1. List Project Locations

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **Path** | `/sdkboard/api/homescreen/projet.php` |
| **Auth** | Required |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | int | No | Page number (default: 1) |
| `limit` | int | No | Items per page (default: 10) |
| `id` | int | No | Get a single project location by ID |
| `idCreate` | int | No | Filter by creator user ID |

> **Note:** The frontend does NOT use `idCreate` despite the backend supporting it. There is also no server-side search; the frontend filters locally.

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
      "projet": "chantier",
      "localisation": "{\"x\":-6.8498,\"y\":33.9716}",
      "commentaire": "Construction site downtown",
      "contact_nom": "Ahmed Benali",
      "contact_telephone": "+212600000000",
      "idCreate": 3,
      "createur": "Dupont Jean",
      "images": [
        {
          "id": "1",
          "idProjet": "1",
          "nom_fichier": "1234567_photo.jpg",
          "chemin_fichier": "data/projet/1/1234567_photo.jpg"
        }
      ]
    }
  ]
}
```

---

### 2. Create Project Location

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **Path** | `/sdkboard/api/homescreen/projet.php` |
| **Content-Type** | `multipart/form-data` |
| **Auth** | Required |

> The authenticated user's ID is stored as `idCreate` (unless overridden via `idCreate` field).

#### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `projet` | string | Yes | Project type (`chantier` or `depot`) |
| `localisation` | string | Yes | JSON string with GPS coordinates `{"x": longitude, "y": latitude}` |
| `commentaire` | string | No | Comment text |
| `contact_nom` | string | No | Contact name |
| `contact_telephone` | string | No | Contact phone number |
| `idCreate` | int | No | Override creator ID (defaults to authenticated user) |

#### File Upload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `images[]` | files | No* | Uploaded files |
| `images_base64` | array | No* | Alternative: Base64-encoded strings |

> *Neither is required by the backend (unlike other modules). Images are optional.

#### Response

```json
{
  "status": true,
  "message": "Projet créé avec succès",
  "data": {
    "id": 8,
    "idCreate": 3,
    "images": ["data/projet/8/1234567_photo.jpg"]
  }
}
```

---

### 3. Update Project Location

| Field | Value |
|-------|-------|
| **Method** | `PUT` |
| **Path** | `/sdkboard/api/homescreen/projet.php` |
| **Content-Type** | `application/json` |
| **Auth** | Required |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | int | Yes | Project location ID |
| `projet` | string | No | Project type (`chantier` / `depot`) |
| `localisation` | string | No | JSON GPS coordinates |
| `commentaire` | string | No | Comment text |
| `contact_nom` | string | No | Contact name |
| `contact_telephone` | string | No | Contact phone |

> **Note:** The update endpoint does NOT support file upload. Existing images cannot be modified, replaced, or added through this endpoint.

#### Response

```json
{ "status": true, "message": "Projet modifié" }
```

---

### 4. Delete Project Location

| Field | Value |
|-------|-------|
| **Method** | `DELETE` |
| **Path** | `/sdkboard/api/homescreen/projet.php` |
| **Auth** | Required |

#### Request

The `id` can be provided via:
- Query parameter: `?id=8`
- JSON body: `{ "id": 8 }`

#### Behavior

Deletes associated images first (`projet_image`), then the project record. Uses a transaction.

#### Response

```json
{ "status": true, "message": "Projet supprimé" }
```

---

## Projet Types

| Value | Label | Description |
|-------|-------|-------------|
| `chantier` | Chantier | Construction site |
| `depot` | Dépôt | Warehouse / depot |

---

## Frontend ↔ Backend Differences

| Frontend Call | Backend Exists? | Notes |
|---------------|----------------|-------|
| `listProjetLocation` (GET) | Yes | Frontend sends `page` but not `idCreate` |
| `getProjetLocationById` (GET with `?id=`) | Yes | Returns single record with images |
| `createProjetLocation` (POST multipart) | Yes | Matches |
| `updateProjetLocation` (PUT JSON) | Yes | No file upload support on PUT |
| `deleteProjetLocation` (DELETE) | Yes | Matches |
| Frontend search (local filtering) | N/A | No server-side search parameter exists |
| Frontend type filter (chantier/depot) | N/A | No backend filter parameter exists; done client-side |

---

## Error Responses

```json
{ "status": false, "message": "Error description" }
```

Authentication errors:

```json
{ "status": false, "message": "Token manquant" }
```