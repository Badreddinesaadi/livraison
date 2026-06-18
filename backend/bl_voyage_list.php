<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

require __DIR__ . "/../config.php";
require "../users/token.php";

// Vérification des headers
$headers = getallheaders();
if (!isset($headers['auth_token'])) {
    echo json_encode([
        "status" => false,
        "message" => "Authentication headers missing"
    ]);
    exit;
}

// Vérification du token
$token = $headers['auth_token'];
$tokendata = checkToken($token, $con);
if (!$tokendata['status']) {
    http_response_code(401);
    echo json_encode([
        "status" => false,
        "message" => $tokendata['code']
    ]);
    exit;
}

// Pagination
$page = isset($_GET['page']) ? max(intval($_GET['page']), 1) : 1;
$perPage = isset($_GET['perPage']) ? max(intval($_GET['perPage']), 30) : 30;
$offset = ($page - 1) * $perPage;

// Filtre par code BL
$codeQuery = isset($_GET['codeQuery']) ? $_GET['codeQuery'] : null;

// Requête principale
$sql = "SELECT DISTINCT
              d.id AS id,
              d.id_document AS code,
              d.id_entreprise,
              d.datetime_document,
              p.societe AS nomClient,
              vbl.idBL
        FROM jbm.document d 
        JOIN jbm.document_items di ON d.id = di.id_document 
        LEFT JOIN voyage_bl vbl ON d.id = vbl.idBL
        JOIN jbm.partenaires p ON p.id = d.id_entreprise
        WHERE vbl.idBL IS NULL 
        AND d.id_type_document = 7
        AND di.idproduit <> 0";

$where = [];
$params = [];
$types = "";

// Filtre par code
if ($codeQuery !== null) {
    $where[] = "d.id_document LIKE ?";
    $types .= "s";
    $params[] = "%$codeQuery%";
}

if (!empty($where)) {
    $sql .= " AND " . implode(" AND ", $where);
}

// Requête pour compter
$countSql = "SELECT COUNT(DISTINCT d.id) as total
            FROM jbm.document d 
            JOIN jbm.document_items di ON d.id = di.id_document 
            LEFT JOIN voyage_bl vbl ON d.id = vbl.idBL
            JOIN jbm.partenaires p ON p.id = d.id_entreprise
            WHERE vbl.idBL IS NULL 
            AND d.id_type_document = 7
            AND di.idproduit <> 0";

if (!empty($where)) {
    $countSql .= " AND " . implode(" AND ", $where);
}

// Pagination
$sql .= " ORDER BY d.datetime_document ASC LIMIT ? OFFSET ?";
$types .= "ii";
$params[] = $perPage;
$params[] = $offset;

// Préparation requête principale
$stmt = $con->prepare($sql);
if (!$stmt) {
    die(json_encode([
        "status" => false,
        "message" => "SQL Error: " . $con->error
    ]));
}

// bind dynamique
$bind_params = [];
foreach ($params as $key => $value) {
    $bind_params[$key] = $value;
}

$tmp = [];
foreach ($bind_params as $key => $value) {
    $tmp[$key] = &$bind_params[$key];
}

if (!empty($params)) {
    array_unshift($tmp, $types);
    call_user_func_array([$stmt, 'bind_param'], $tmp);
}

$stmt->execute();
$result = $stmt->get_result();

// Résultats
$bl_list = [];
while ($row = $result->fetch_assoc()) {

    $bl_id = $row['id'];

    $imgStmt = $con->prepare("SELECT id, nom_fichier, chemin_fichier, date_upload 
                              FROM voyage_bl_image 
                              WHERE idVoyageBL = ?");
    $imgStmt->bind_param("i", $bl_id);
    $imgStmt->execute();
    $imgResult = $imgStmt->get_result();

    $images = [];
    while ($img = $imgResult->fetch_assoc()) {
        $images[] = $img;
    }

    $row['images'] = $images;

    $bl_list[] = $row;
}

// Count total
$countStmt = $con->prepare($countSql);

if (!$countStmt) {
    die(json_encode([
        "status" => false,
        "message" => "SQL Count Error: " . $con->error
    ]));
}

if ($codeQuery !== null) {
    $countParam = "%$codeQuery%";
    $countStmt->bind_param("s", $countParam);
}

$countStmt->execute();
$totalResult = $countStmt->get_result();
$total = $totalResult->fetch_assoc()['total'];

// Réponse finale
echo json_encode([
    "status" => true,
    "data" => $bl_list,
    "pagination" => [
        "page" => $page,
        "perPage" => $perPage,
        "total" => intval($total),
        "totalPages" => ceil($total / $perPage)
    ]
]);