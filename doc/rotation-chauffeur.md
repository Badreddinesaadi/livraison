# Rotation Chauffeur — API Documentation

**Base path:** `/sdkboard/api/homescreen/rotation_chauffeur.php`

**Authentication:** All requests require a valid `auth_token` header.

**Note:** This is a **read-only** endpoint. Only `GET` requests are allowed.

---

## Endpoints

### 1. List Rotations

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **Path** | `/sdkboard/api/homescreen/rotation_chauffeur.php` |
| **Auth** | Required |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | int | No | Page number (default: 1) |
| `perPage` | int | No | Items per page (default: 10) |
| `vehicule_id` | int | No | Filter by vehicle ID |
| `chauffeur_id` | int | No | Filter by driver ID |
| `disponibilite` | string | No | Filter by availability: `1`/`true` = Available, `0`/`false` = Reserved |

> **Note:** Date range filtering (`date_du`, `date_au`) is **not implemented** in the backend despite the frontend sending these parameters.

#### Availability Logic (Backend)

| Condition | Result |
|-----------|--------|
| `voyage.statut IS NULL` | Available (`disponibilite = true`) |
| `voyage.statut = 'terminer'` | Available (`disponibilite = true`) |
| `voyage.statut = 'encours'` | Reserved/On-trip (`disponibilite = false`) |

#### How Rotations Work

The backend queries all vehicles and LEFT JOINs the **most recent voyage** per vehicle (by `date_depart DESC`). The rotation data is derived from this latest voyage:

- If no voyage exists for a vehicle → `disponibilite = true`, all fields are null/empty
- If latest voyage is `terminer` or no status → driver is "Available" since `date_retour`
- If latest voyage is `encours` → driver is "Reserved" since `date_depart`, heading to `ville`

The `km_parcourus` field is calculated as `SUM(ville.kmDeCasa * 2)` across all voyages for the vehicle.

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
      "vehicule_id": 1,
      "vehicule": "Renault - AB-123-CD",
      "voyage_id": 42,
      "chauffeur": "Dupont Jean",
      "chauffeur_id": 3,
      "ville": "Tanger",
      "date_depart": "2024-01-15 08:00:00",
      "date_retour": "2024-01-16 18:00:00",
      "statut": "terminer",
      "disponibilite": true,
      "km_parcourus": 680
    }
  ]
}
```

---

## Frontend ↔ Backend Differences

| Frontend Call | Backend Exists? | Notes |
|---------------|----------------|-------|
| `ListRotations` (GET with `page`, `date_du`, `date_au`, `vehicule_id`, `chauffeur_id`, `disponibilite`) | Partial | `date_du` and `date_au` parameters are **sent by the frontend but ignored by the backend**. No date filtering is implemented in the SQL query. |

> **Missing backend feature:** Date range filtering (`date_du`, `date_au`) is not implemented. The rotation_chauffeur.php file has no `$_GET['date_du']` or `$_GET['date_au']` handling.

---

## Error Responses

```json
{ "status": false, "message": "Error description" }
```

Method not allowed (non-GET request):

```json
{ "status": false, "message": "Méthode non autorisée" }
```