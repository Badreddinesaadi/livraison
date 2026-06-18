<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

require __DIR__ . "/../config.php";
require "../users/token.php";

/* ================= TOKEN ================= */
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
$userRole = isset($tokendata['role']) ? $tokendata['role'] : 'user';

$method = $_SERVER['REQUEST_METHOD'];

$input = file_get_contents("php://input");
$data = json_decode($input, true);
if (!$data) $data = [];

$con->begin_transaction();

try {

    /* ============================================================
        CREATE
    ============================================================ */
    if ($method === 'POST') {

        if (empty($data['idDepotSource']) || empty($data['idDepotDestination'])) {
            throw new Exception("Dépôt source et destination requis");
        }

        $res = $con->query("
            SELECT (CAST(SUBSTR(reference,3,7) AS UNSIGNED)+1) num
            FROM demandetransfert
            WHERE YEAR(date)=YEAR(NOW())
            ORDER BY id DESC
            LIMIT 1
        ");

        $num = ($row = $res->fetch_assoc())
            ? 'DT' . $row['num']
            : 'DT' . date('y') . '00001';

        $stmt = $con->prepare("
            INSERT INTO demandetransfert
            (reference,date,idDepotSource,idDepotDestination,dum,transporteur,matricule,observation,idCreate,statut)
            VALUES (?,NOW(),?,?,?,?,?,?,?,'Brouillon')
        ");

        $stmt->bind_param(
            "siiisssi",
            $num,
            $data['idDepotSource'],
            $data['idDepotDestination'],
            $data['dum'],
            $data['transporteur'],
            $data['matricule'],
            $data['observation'],
            $userId
        );

        $stmt->execute();

        $id = $stmt->insert_id;

        $con->commit();

        echo json_encode([
            "status" => true,
            "message" => "Demande créée",
            "data" => [
                "id" => $id,
                "reference" => $num
            ]
        ]);
        exit;
    }

    /* ============================================================
        GET + SEARCHQUERY + FILTERS + PAGINATION
    ============================================================ */
    if ($method === 'GET') {

        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $perPage = 10;
        $offset = ($page - 1) * $perPage;

        $filters = [];
        $values = [];
        $types = '';

        /* ================= GLOBAL SEARCH ================= */
        if (!empty($_GET['searchquery'])) {

            $search = "%" . $_GET['searchquery'] . "%";

            $filters[] = "(
                dt.reference LIKE ?
                OR dt.observation LIKE ?
                OR dt.dum LIKE ?
                OR dt.matricule LIKE ?
                OR dt.transporteur LIKE ?
                OR dt.statut LIKE ?
                OR d1.nom LIKE ?
                OR d2.nom LIKE ?
                OR u.nom LIKE ?
                OR u.prenom LIKE ?
                OR CONCAT(u.nom,' ',u.prenom) LIKE ?
            )";

            for ($i = 0; $i < 11; $i++) {
                $values[] = $search;
                $types .= 's';
            }
        }

        /* ================= FILTERS ================= */

        if (!empty($_GET['reference'])) {
            $filters[] = "dt.reference LIKE ?";
            $values[] = "%" . $_GET['reference'] . "%";
            $types .= 's';
        }

        if (!empty($_GET['date'])) {
            $filters[] = "DATE(dt.date) = ?";
            $values[] = $_GET['date'];
            $types .= 's';
        }

        if (!empty($_GET['observation'])) {
            $filters[] = "dt.observation LIKE ?";
            $values[] = "%" . $_GET['observation'] . "%";
            $types .= 's';
        }

        if (!empty($_GET['demandeur'])) {
            $filters[] = "(u.nom LIKE ? OR u.prenom LIKE ? OR CONCAT(u.nom,' ',u.prenom) LIKE ?)";
            $values[] = "%" . $_GET['demandeur'] . "%";
            $values[] = "%" . $_GET['demandeur'] . "%";
            $values[] = "%" . $_GET['demandeur'] . "%";
            $types .= 'sss';
        }

        if (!empty($_GET['depotSource'])) {
            $filters[] = "d1.nom LIKE ?";
            $values[] = "%" . $_GET['depotSource'] . "%";
            $types .= 's';
        }

        if (!empty($_GET['depotDestination'])) {
            $filters[] = "d2.nom LIKE ?";
            $values[] = "%" . $_GET['depotDestination'] . "%";
            $types .= 's';
        }

        if (!empty($_GET['dum'])) {
            $filters[] = "dt.dum LIKE ?";
            $values[] = "%" . $_GET['dum'] . "%";
            $types .= 's';
        }

        if (!empty($_GET['matricule'])) {
            $filters[] = "dt.matricule LIKE ?";
            $values[] = "%" . $_GET['matricule'] . "%";
            $types .= 's';
        }

        if (!empty($_GET['transporteur'])) {
            $filters[] = "dt.transporteur LIKE ?";
            $values[] = "%" . $_GET['transporteur'] . "%";
            $types .= 's';
        }

        if (!empty($_GET['statut'])) {
            $filters[] = "dt.statut = ?";
            $values[] = $_GET['statut'];
            $types .= 's';
        }

        $where = "";
        if (!empty($filters)) {
            $where = "WHERE " . implode(" AND ", $filters);
        }

        /* ================= COUNT ================= */
        $sqlCount = "
            SELECT COUNT(*) AS total
            FROM demandetransfert dt
            LEFT JOIN vue_depots d1 ON d1.id = dt.idDepotSource
            LEFT JOIN vue_depots d2 ON d2.id = dt.idDepotDestination
            LEFT JOIN utilisateur u ON u.id = dt.idCreate
            $where
        ";

        $stmtCount = $con->prepare($sqlCount);

        if (!empty($values)) {
            $stmtCount->bind_param($types, ...$values);
        }

        $stmtCount->execute();
        $total = $stmtCount->get_result()->fetch_assoc()['total'];

        $totalPages = ($total > 0) ? ceil($total / $perPage) : 1;

        /* ================= DATA ================= */
        $sql = "
            SELECT 
                dt.*,
                d1.nom AS depot_source,
                d2.nom AS depot_destination,
                CONCAT(u.nom,' ',u.prenom) AS createur
            FROM demandetransfert dt
            LEFT JOIN vue_depots d1 ON d1.id = dt.idDepotSource
            LEFT JOIN vue_depots d2 ON d2.id = dt.idDepotDestination
            LEFT JOIN utilisateur u ON u.id = dt.idCreate
            $where
            ORDER BY dt.id DESC
            LIMIT ? OFFSET ?
        ";

        $stmt = $con->prepare($sql);

        $values2 = $values;
        $values2[] = $perPage;
        $values2[] = $offset;

        $types2 = $types . "ii";

        $stmt->bind_param($types2, ...$values2);
        $stmt->execute();

        $data = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        echo json_encode([
            "status" => true,
            "pagination" => [
                "page" => $page,
                "perPage" => $perPage,
                "total" => $total,
                "totalPages" => $totalPages
            ],
            "data" => $data
        ]);

        exit;
    }

    /* ============================================================
        PUT
    ============================================================ */
    if ($method === 'PUT') {

        if (empty($data['id'])) {
            throw new Exception("ID requis");
        }

        $id = intval($data['id']);

        $stmt = $con->prepare("SELECT idCreate,statut FROM demandetransfert WHERE id=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $dt = $stmt->get_result()->fetch_assoc();

        if (!$dt) {
            throw new Exception("Demande introuvable");
        }

        $msg = "Aucune action";

        if ($dt['statut'] == 'Brouillon' && $dt['idCreate'] == $userId) {

            $stmtUp = $con->prepare("
                UPDATE demandetransfert
                SET statut='Envoye',
                    idSigneDemamdeur=?,
                    dateSingeDemandeur=NOW(),
                    idEnvoie=?,
                    dateEnvoie=NOW()
                WHERE id=?
            ");

            $stmtUp->bind_param("iii", $userId, $userId, $id);
            $stmtUp->execute();

            $msg = "Demande envoyée";
        }

        elseif ($dt['statut'] == 'Encours' && $userRole == 'admin') {

            $stmtUp = $con->prepare("
                UPDATE demandetransfert
                SET statut='Envoye',
                    idEnvoie=?,
                    dateEnvoie=NOW()
                WHERE id=?
            ");

            $stmtUp->bind_param("ii", $userId, $id);
            $stmtUp->execute();

            $msg = "Envoyée";
        }

        elseif ($dt['statut'] == 'Envoye' && $userRole == 'admin') {

            $stmtUp = $con->prepare("
                UPDATE demandetransfert
                SET statut='Reçue',
                    idRecu=?,
                    dateRecu=NOW()
                WHERE id=?
            ");

            $stmtUp->bind_param("ii", $userId, $id);
            $stmtUp->execute();

            $msg = "Reçue";
        }

        $con->commit();

        echo json_encode([
            "status" => true,
            "message" => $msg
        ]);
        exit;
    }

    /* ============================================================
        DELETE
    ============================================================ */
    if ($method === 'DELETE') {

        if (empty($data['id'])) {
            throw new Exception("ID requis");
        }

        $id = intval($data['id']);

        $con->query("DELETE FROM transfer_lots WHERE idItem IN (
            SELECT id FROM demandetransfert_details WHERE idDT=$id
        )");

        $con->query("DELETE FROM demandetransfert_details WHERE idDT=$id");
        $con->query("DELETE FROM demandetransfert WHERE id=$id");

        $con->commit();

        echo json_encode([
            "status" => true,
            "message" => "Supprimé"
        ]);
        exit;
    }

} catch (Exception $e) {

    $con->rollback();

    echo json_encode([
        "status" => false,
        "message" => $e->getMessage()
    ]);
}