<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

require "../config.php";
require "../users/token.php";

// ---------------- TOKEN ----------------
$headers = getallheaders();
$token = isset($headers['auth_token']) ? $headers['auth_token'] : null;

if (empty($token)) {
    echo json_encode(["status" => false, "message" => "Token manquant"]);
    exit;
}

$tokendata = checkToken($token, $con);

if (!$tokendata['status']) {
    http_response_code(401);
    echo json_encode(["status" => false, "message" => $tokendata['code']]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["status" => false, "message" => "Méthode non autorisée"]);
    exit;
}

try {

    // ---------------- PAGINATION ----------------
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    if ($page < 1) $page = 1;

    $perPage = isset($_GET['perPage']) ? intval($_GET['perPage']) : 10;
    if ($perPage < 1) $perPage = 10;

    $offset = ($page - 1) * $perPage;

    // ---------------- FILTERS ----------------
    $where = [];

    if (isset($_GET['vehicule_id']) && $_GET['vehicule_id'] !== '') {
        $where[] = "v.id = " . intval($_GET['vehicule_id']);
    }

    if (isset($_GET['chauffeur_id']) && $_GET['chauffeur_id'] !== '') {
        $where[] = "voy.idChauffeur = " . intval($_GET['chauffeur_id']);
    }

    // disponibilité filtre optionnel
    if (isset($_GET['disponibilite']) && $_GET['disponibilite'] !== '') {

        if ($_GET['disponibilite'] == '1' || $_GET['disponibilite'] === 'true') {
            $where[] = "(voy.statut IS NULL OR voy.statut = 'terminer')";
        }

        if ($_GET['disponibilite'] == '0' || $_GET['disponibilite'] === 'false') {
            $where[] = "(voy.statut = 'encours')";
        }
    }

    $whereSql = "";
    if (count($where) > 0) {
        $whereSql = " WHERE " . implode(" AND ", $where);
    }

    // ---------------- MAIN QUERY ----------------
    $sql = "
        SELECT
            v.id AS vehicule_id,

            CONCAT(
                IFNULL(mv.designation, ''),
                ' - ',
                IFNULL(v.immatriculation, '')
            ) AS vehicule,

            voy.id AS voyage_id,
            voy.date_depart,
            voy.date_retour,
            voy.statut,

            CONCAT(
                IFNULL(u.nom, ''),
                ' ',
                IFNULL(u.prenom, '')
            ) AS chauffeur,

            u.id AS chauffeur_id,

            vil.designation AS ville,

            --  disponibilité
            CASE
                WHEN voy.statut IS NULL THEN 1
                WHEN voy.statut = 'terminer' THEN 1
                ELSE 0
            END AS disponibilite,

            --  km total
            IFNULL(km.total_km, 0) AS km_parcourus

        FROM vehicule v

        LEFT JOIN marque_vehicule mv ON mv.id = v.idMarque

        --  dernier voyage par véhicule
        LEFT JOIN voyage voy
            ON voy.id = (
                SELECT v2.id
                FROM voyage v2
                WHERE v2.idVehicule = v.id
                ORDER BY v2.date_depart DESC
                LIMIT 1
            )

        LEFT JOIN utilisateur u ON u.id = voy.idChauffeur
        LEFT JOIN ville vil ON vil.id = voy.idVille

        --  km total par véhicule
        LEFT JOIN (
            SELECT
                voy.idVehicule,
                SUM(IFNULL(vil.kmDeCasa,0) * 2) AS total_km
            FROM voyage voy
            LEFT JOIN ville vil ON vil.id = voy.idVille
            GROUP BY voy.idVehicule
        ) km ON km.idVehicule = v.id

        $whereSql

        ORDER BY v.id DESC
        LIMIT $perPage OFFSET $offset
    ";

    $result = $con->query($sql);

    if (!$result) {
        throw new Exception($con->error);
    }

    $data = [];

    while ($row = $result->fetch_assoc()) {

        $data[] = array(
            "vehicule_id" => intval($row["vehicule_id"]),
            "vehicule" => $row["vehicule"],

            "voyage_id" => isset($row["voyage_id"]) ? intval($row["voyage_id"]) : 0,

            "chauffeur" => $row["chauffeur"],
            "chauffeur_id" => isset($row["chauffeur_id"]) ? intval($row["chauffeur_id"]) : 0,

            "ville" => $row["ville"],

            "date_depart" => $row["date_depart"],
            "date_retour" => $row["date_retour"],

            "statut" => $row["statut"],

            "disponibilite" => ($row["disponibilite"] == 1),

            "km_parcourus" => intval($row["km_parcourus"])
        );
    }

    // ---------------- COUNT ----------------
    $countSql = "
        SELECT COUNT(*) AS total
        FROM vehicule v

        LEFT JOIN voyage voy
            ON voy.id = (
                SELECT v2.id
                FROM voyage v2
                WHERE v2.idVehicule = v.id
                ORDER BY v2.date_depart DESC
                LIMIT 1
            )

        $whereSql
    ";

    $countResult = $con->query($countSql);
    $total = intval($countResult->fetch_assoc()["total"]);

    echo json_encode(array(
        "status" => true,
        "pagination" => array(
            "page" => $page,
            "perPage" => $perPage,
            "total" => $total,
            "totalPages" => ceil($total / $perPage)
        ),
        "data" => $data
    ), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode(array(
        "status" => false,
        "message" => $e->getMessage()
    ));
}