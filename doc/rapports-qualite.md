# Rapports Qualité — API Documentation

**Base path:** `/sdkboard/api/homescreen/rapport_qualite.php`

**Authentication:** All requests require a valid `auth_token` header.

---

## Endpoints

### 1. List Quality Reports

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **Path** | `/sdkboard/api/homescreen/rapport_qualite.php` |
| **Auth** | Required |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | int | No | Page number (default: 1) |
| `perPage` | int | No | Items per page (default: 10) |
| `id` | int | No | Get a single report by ID |
| `user_id` | int | No | Filter by creator user ID |
| `search` | string | No | Search across `dum`, `dossier`, and `commentaire` fields |

#### Response

```json
{
  "status": true,
  "pagination": {
    "page": 1,
    "perPage": 10,
    "total": 15,
    "totalPages": 2
  },
  "data": [
    {
      "id": 1,
      "dum": "DUM-2024-001",
      "dossier": "DOS-001",
      "commentaire": "Quality issue reported",
      "user_id": 3,
      "idCreate": 3,
      "dateCreate": "2024-01-15 10:00:00",
      "idModif": null,
      "dateModif": null,
      "images": [
        {
          "id": "1",
          "idRapportQualite": "1",
          "nom_fichier": "1234567_photo.jpg",
          "chemin_fichier": "data/rapport_qualite/1/1234567_photo.jpg",
          "date_upload": "2024-01-15 10:30:00",
          "idCreate": "3"
        }
      ]
    }
  ]
}
```

---

### 2. Create Quality Report

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **Path** | `/sdkboard/api/homescreen/rapport_qualite.php` |
| **Content-Type** | `multipart/form-data` |
| **Auth** | Required |

> The authenticated user's ID is stored as both `user_id` and `idCreate`.

#### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dum` | string | Yes | DUM reference |
| `dossier` | string | Yes | Dossier reference |
| `commentaire` | string | Yes | Comment text |

> **Note:** The backend requires all three fields as non-empty. The frontend relaxes this to "at least one of `dum` or `dossier` must be filled".

#### File Upload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `images[]` | files | Yes* | Uploaded files |
| `images_base64` | array | Yes* | Alternative: Base64-encoded strings |

> *One of `images` or `images_base64` must be provided. The backend throws an exception if neither is present.

#### Response

```json
{
  "status": true,
  "message": "Rapport qualité créé",
  "data": {
    "id": 5,
    "images": ["data/rapport_qualite/5/1234567_photo.jpg"]
  }
}
```

---

### 3. Update Quality Report

| Field | Value |
|-------|-------|
| **Method** | `PUT` |
| **Path** | `/sdkboard/api/homescreen/rapport_qualite.php` |
| **Auth** | Required |

> **Note:** This endpoint exists in the backend but **is NOT used by the frontend app**. There is no edit screen or update API call in the client code.

#### Request Body

The `id` can be provided via:
- `$_POST['id']` (form data)
- JSON body `data['id']`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | int | Yes | Report ID |
| `dum` | string | No | Updated DUM reference |
| `dossier` | string | No | Updated dossier reference |
| `commentaire` | string | No | Updated comment |

#### Behavior

Updates the specified fields and sets `idModif` to the authenticated user's ID and `dateModif` to `NOW()`.

#### Response

```json
{ "status": true, "message": "Rapport modifié" }
```

---

### 4. Delete Quality Report

| Field | Value |
|-------|-------|
| **Method** | `DELETE` |
| **Path** | `/sdkboard/api/homescreen/rapport_qualite.php` |
| **Auth** | Required |

#### Request

The `id` can be provided via:
- Query parameter: `?id=5`
- JSON body: `{ "id": 5 }`

#### Behavior

Deletes associated images first (`rapport_qualite_image`), then the report record. Uses a transaction.

#### Response

```json
{ "status": true, "message": "Rapport supprimé" }
```

---

## Frontend ↔ Backend Differences

| Frontend Call | Backend Exists? | Notes |
|---------------|----------------|-------|
| `listQualityReports` (GET with `search` param) | Yes | Server-side search works |
| `createQualityReport` (POST multipart) | Yes | Matches |
| `getQualityReportById` (GET with `?id=`) | Yes | Returns single report with images |
| `deleteQualityReport` (DELETE) | Yes | Matches |
| UPDATE / Edit report | Yes (backend) | **Backend supports PUT, but frontend has no edit screen or update API call** |

---

## Error Responses

```json
{ "status": false, "message": "Error description" }
```

Authentication errors:

```json
{ "status": false, "message": "Token manquant" }
```