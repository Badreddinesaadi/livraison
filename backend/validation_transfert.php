<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

require __DIR__ . "/../config.php";
require "../users/token.php";

/* ============================================================
   TOKEN
============================================================ */

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

$userId = $tokendata['idUser'];

/* ============================================================
   LOAD PERMISSIONS
============================================================ */

$permissions = [];

$stmtPerm = $con->prepare("
    SELECT can_view, can_create, can_update, can_delete,
           can_take_picture_bl, can_close_bl, can_achever
    FROM permissions
    WHERE user_id = ?
    LIMIT 1
");

$stmtPerm->bind_param("i", $userId);
$stmtPerm->execute();
$resPerm = $stmtPerm->get_result();

if ($row = $resPerm->fetch_assoc()) {
    $permissions = $row;
}

/* helper */
function hasPerm($permissions, $key) {
    return isset($permissions[$key]) && $permissions[$key] == 1;
}

$method = $_SERVER['REQUEST_METHOD'];

$input = file_get_contents("php://input");
$data = json_decode($input, true);
if (!$data) $data = [];

$con->begin_transaction();

try {

    /* ============================================================
        GET LIST
    ============================================================ */
    if ($method === 'GET') {

        if (!hasPerm($permissions, 'can_view')) {
            throw new Exception("Access denied (view permission required)");
        }

        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $perPage = isset($_GET['perPage']) ? intval($_GET['perPage']) : 10;
        $offset = ($page - 1) * $perPage;

        $filters = [];
        $values = [];
        $types = '';

        if (isset($_GET['id'])) {
            $filters[] = "dt.id=?";
            $values[] = intval($_GET['id']);
            $types .= 'i';
        }

        if (isset($_GET['statut'])) {
            $filters[] = "dt.statut=?";
            $values[] = $_GET['statut'];
            $types .= 's';
        }

        $where = $filters ? "WHERE " . implode(" AND ", $filters) : "";

        /* COUNT */
        $sqlCount = "
            SELECT COUNT(*) as total
            FROM demandetransfert dt
            $where
        ";

        $stmtCount = $con->prepare($sqlCount);

        if (!empty($values)) {
            $stmtCount->bind_param($types, ...$values);
        }

        $stmtCount->execute();
        $total = $stmtCount->get_result()->fetch_assoc()['total'];
        $totalPages = ceil($total / $perPage);

        /* DATA */
        $sql = "
            SELECT dt.*,
                   d1.nom depot_source,
                   d2.nom depot_destination,
                   CONCAT(u.nom,' ',u.prenom) createur
            FROM demandetransfert dt
            LEFT JOIN vue_depots d1 ON dt.idDepotSource = d1.id
            LEFT JOIN vue_depots d2 ON dt.idDepotDestination = d2.id
            LEFT JOIN utilisateur u ON dt.idCreate = u.id
            $where
            ORDER BY dt.date DESC
            LIMIT ? OFFSET ?
        ";

        $stmt = $con->prepare($sql);

        $values2 = $values;
        $types2 = $types . "ii";

        $values2[] = $perPage;
        $values2[] = $offset;

        $stmt->bind_param($types2, ...$values2);
        $stmt->execute();

        $dataResult = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        $con->commit();

        echo json_encode([
            "status" => true,
            "data" => $dataResult,
            "pagination" => [
                "page" => $page,
                "perPage" => $perPage,
                "total" => $total,
                "totalPages" => $totalPages
            ]
        ]);
        exit;
    }

    /* ============================================================
        POST ACTIONS
    ============================================================ */
    if ($method === 'POST') {

        $action = isset($data['action']) ? $data['action'] : null;

        /* ============================================================
            PREPARER ITEM
        ============================================================ */
        if ($action == 'preparerItem') {

            if (!hasPerm($permissions, 'can_update')) {
                throw new Exception("Access denied (update required)");
            }

            $id_item = intval($data['id_item']);
            $id_document = intval($data['id_document']);

            $stmt = $con->prepare("
                UPDATE demandetransfert_details
                SET preparer='Oui'
                WHERE id=?
            ");

            $stmt->bind_param("i", $id_item);
            $stmt->execute();

            $stmt2 = $con->prepare("
                SELECT COUNT(*) as restant
                FROM demandetransfert_details
                WHERE idDT=? AND preparer!='Oui'
            ");

            $stmt2->bind_param("i", $id_document);
            $stmt2->execute();
            $row = $stmt2->get_result()->fetch_assoc();

            if ($row['restant'] == 0) {
                $con->query("
                    UPDATE demandetransfert
                    SET statut='Envoye', dateEnvoie=NOW()
                    WHERE id=$id_document
                ");
            }

            $con->commit();

            echo json_encode([
                "status" => true,
                "message" => "Préparation item OK"
            ]);
            exit;
        }

        /* ============================================================
            PREPARER LOT
        ============================================================ */
        if ($action == 'preparerLot') {

            if (!hasPerm($permissions, 'can_update')) {
                throw new Exception("Access denied (update required)");
            }

            $id_item = intval($data['id_item']);
            $id_lot = intval($data['id_lot']);

            $stmt = $con->prepare("
                UPDATE transfer_lots
                SET preparer='Oui'
                WHERE idItem=? AND lot=?
            ");

            $stmt->bind_param("ii", $id_item, $id_lot);
            $stmt->execute();

            $con->commit();

            echo json_encode([
                "status" => true,
                "message" => "Préparation lot OK"
            ]);
            exit;
        }

        /* ============================================================
            ANNULER
        ============================================================ */
        if ($action == 'annulerPreparation') {

            if (!hasPerm($permissions, 'can_update')) {
                throw new Exception("Access denied");
            }

            $id_item = intval($data['id_item']);
            $id_document = intval($data['id_document']);

            $con->query("
                UPDATE demandetransfert_details
                SET preparer='Non'
                WHERE id=$id_item
            ");

            $con->query("
                UPDATE demandetransfert
                SET statut='Encours'
                WHERE id=$id_document
            ");

            $con->commit();

            echo json_encode([
                "status" => true,
                "message" => "Annulation OK"
            ]);
            exit;
        }

        /* ============================================================
            VALIDATION FINALE
        ============================================================ */
        if ($action == 'validation') {

            if (!hasPerm($permissions, 'can_achever')) {
                throw new Exception("Access denied (achever required)");
            }

            $id = intval($data['id']);

            $stmt = $con->prepare("
                UPDATE demandetransfert
                SET statut='Reçue',
                    idRecu=?,
                    dateRecu=NOW()
                WHERE id=?
            ");

            $stmt->bind_param("ii", $userId, $id);
            $stmt->execute();

            $con->commit();

            echo json_encode([
                "status" => true,
                "message" => "Validation OK"
            ]);
            exit;
        }

        throw new Exception("Action inconnue");
    }

} catch (Exception $e) {

    $con->rollback();

    echo json_encode([
        "status" => false,
        "message" => $e->getMessage()
    ]);
}