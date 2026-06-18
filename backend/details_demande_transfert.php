<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, auth_token");

require __DIR__ . "/../config.php";
require "../users/token.php";

/* ============================================================
   TOKEN
============================================================ */
$headers = getallheaders();
$token = isset($headers['auth_token']) ? $headers['auth_token'] : null;

if (!$token) {
    echo json_encode(["status"=>false,"message"=>"Token manquant"]);
    exit;
}

$tokendata = checkToken($token, $con);

if (!$tokendata['status']) {
    http_response_code(401);
    echo json_encode(["status"=>false,"message"=>$tokendata['code']]);
    exit;
}

$userId = $tokendata['idUser'];

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) $data = [];

$con->begin_transaction();

/* =========================
   RESPONSE FUNCTION
========================= */
function response($arr){
    echo json_encode($arr);
    exit;
}

/* =========================
   GET
========================= */
if ($method == "GET") {

    /* ===== DETAILS TRANSFERT ===== */
    if (isset($_GET['details']) && $_GET['details'] == "1") {

        $idDT = intval($_GET['idDT']);

        $sql = "SELECT dd.*, p.produit, p.unite_v
                FROM demandetransfert_details dd
                LEFT JOIN vue_produits p ON p.produit_id = dd.idProduit
                WHERE dd.idDT = $idDT";

        $res = mysqli_query($con, $sql);

        $details = array();

        while ($row = mysqli_fetch_assoc($res)) {

            $idItem = $row['id'];

            $sql2 = "
                SELECT 
                    tl.*,
                    vls.id_depot AS depotId,
                    vls.depot AS depotName
                FROM transfer_lots tl
                LEFT JOIN vue_lots_solde vls 
                    ON vls.num_lot = tl.Lot 
                    AND vls.product_id = tl.idProduit
                WHERE tl.idItem = $idItem
            ";

            $res2 = mysqli_query($con, $sql2);

            $lots = array();

            while ($l = mysqli_fetch_assoc($res2)) {
                $lots[] = $l;
            }

            $row['lots'] = $lots;
            $details[] = $row;
        }

        /* ===== RESPONSE STRUCTURE ===== */
        response(array(
            "status" => true,
            "idDT" => $idDT,
            "data" => array(
                "details" => $details
            )
        ));
    }
}
/* =========================================================
   POST
========================================================= */
if ($method == "POST") {

    $type = isset($data['type']) ? $data['type'] : null;

    /* =========================================================
       CREATE DETAIL + LOTS INIT
    ========================================================= */
    if ($type == "detail_lots") {

        $con->begin_transaction();

        $idDT      = $data['idDT'];
        $idProduit = $data['idProduit'];
        $qte       = $data['qte'];
        $nbrFDX    = $data['nbrFDX'];
        $unite     = $data['unite'];

        /* ---------------- INSERT DETAIL ---------------- */
        $sql = "INSERT INTO demandetransfert_details
                (idDT, idProduit, Qte, nbrFDX, unite)
                VALUES
                ('$idDT', '$idProduit', '$qte', '$nbrFDX', '$unite')";

        $res = mysqli_query($con, $sql);

        if (!$res) {
            $con->rollback();
            response([
                "status" => false,
                "step" => "detail",
                "message" => mysqli_error($con)
            ]);
        }

        $idItem = mysqli_insert_id($con);

        /* ---------------- INSERT LOTS ---------------- */
        if (!empty($data['lots'])) {

            foreach ($data['lots'] as $lot) {

                $Lot = isset($lot['Lot']) ? $lot['Lot'] : '';
                $qteLot = isset($lot['qte']) ? $lot['qte'] : 0;

                $sqlLot = "INSERT INTO transfer_lots
                           (idItem, idProduit, Lot, qte)
                           VALUES
                           ('$idItem', '$idProduit', '$Lot', '$qteLot')";

                $resLot = mysqli_query($con, $sqlLot);

                if (!$resLot) {
                    $con->rollback();
                    response([
                        "status" => false,
                        "step" => "insert_lots",
                        "message" => mysqli_error($con)
                    ]);
                }
            }
        }

        $con->commit();

        response([
            "status" => true,
            "idItem" => $idItem,
            "message" => "Detail + lots créés"
        ]);
    }
}

/* =========================================================
   PUT
========================================================= */
if ($method == "PUT") {

    $type = isset($data['type']) ? $data['type'] : null;

    if ($type == "update_lot") {

        $con->begin_transaction();

        $userId = isset($userId) ? $userId : 0;

        /* =========================================================
           1. UPDATE LOTS
        ========================================================= */
        if (!empty($data['lots_update'])) {

            foreach ($data['lots_update'] as $lot) {

                $idItem    = isset($lot['idItem']) ? $lot['idItem'] : 0;
                $idProduit = isset($lot['idProduit']) ? $lot['idProduit'] : 0;
                $oldLot    = isset($lot['old_lot']) ? $lot['old_lot'] : '';
                $newLot    = isset($lot['new_lot']) ? $lot['new_lot'] : '';
                $qte       = isset($lot['qte']) ? $lot['qte'] : 0;

                $sql = "UPDATE transfer_lots
                        SET Lot = '$newLot',
                            qte = '$qte',
                            idModif = '$userId'
                        WHERE idItem = '$idItem'
                          AND idProduit = '$idProduit'
                          AND Lot = '$oldLot'";

                $res = mysqli_query($con, $sql);

                if (!$res) {
                    $con->rollback();
                    response([
                        "status" => false,
                        "step" => "update",
                        "message" => mysqli_error($con)
                    ]);
                }
            }
        }

        /* =========================================================
           2. INSERT LOTS
        ========================================================= */
        if (!empty($data['lots_insert'])) {

            foreach ($data['lots_insert'] as $lot) {

                $idItem    = isset($lot['idItem']) ? $lot['idItem'] : 0;
                $idProduit = isset($lot['idProduit']) ? $lot['idProduit'] : 0;
                $Lot       = isset($lot['Lot']) ? $lot['Lot'] : '';
                $qte       = isset($lot['qte']) ? $lot['qte'] : 0;

                $sql = "INSERT INTO transfer_lots
                        (idItem, idProduit, Lot, qte, idModif)
                        VALUES
                        ('$idItem', '$idProduit', '$Lot', '$qte', '$userId')";

                $res = mysqli_query($con, $sql);

                if (!$res) {
                    $con->rollback();
                    response([
                        "status" => false,
                        "step" => "insert",
                        "message" => mysqli_error($con)
                    ]);
                }
            }
        }

        /* =========================================================
           3. DELETE LOTS
        ========================================================= */
        if (!empty($data['lots_delete'])) {

            foreach ($data['lots_delete'] as $lot) {

                $idItem    = isset($lot['idItem']) ? $lot['idItem'] : 0;
                $idProduit = isset($lot['idProduit']) ? $lot['idProduit'] : 0;
                $Lot       = isset($lot['Lot']) ? $lot['Lot'] : '';

                $sql = "DELETE FROM transfer_lots
                        WHERE idItem = '$idItem'
                          AND idProduit = '$idProduit'
                          AND Lot = '$Lot'";

                $res = mysqli_query($con, $sql);

                if (!$res) {
                    $con->rollback();
                    response([
                        "status" => false,
                        "step" => "delete",
                        "message" => mysqli_error($con)
                    ]);
                }
            }
        }

        /* =========================================================
           COMMIT FINAL
        ========================================================= */
        $con->commit();

        response([
            "status" => true,
            "message" => "Lots update OK"
        ]);
    }
}

/* =========================================================
   DELETE
========================================================= */
if ($method == "DELETE") {

    if (!isset($data['type'])) {
        response(array("status" => false, "message" => "Type manquant"));
    }

    /* ===== DELETE TRANSFERT ===== */
    if ($data['type'] == "transfert") {

        $id = $data['id'];

        mysqli_query($con, "DELETE FROM transfer_lots WHERE idItem IN
                    (SELECT id FROM demandetransfert_details WHERE idDT=$id)");

        mysqli_query($con, "DELETE FROM demandetransfert_details WHERE idDT=$id");

        mysqli_query($con, "DELETE FROM demandetransfert WHERE id=$id");

        $con->commit();

        response(array(
            "status" => true,
            "message" => "Supprimé"
        ));
    }

    /* ===== DELETE DETAIL ===== */
    if ($data['type'] == "detail") {

        $id = $data['id'];

        mysqli_query($con, "DELETE FROM transfer_lots WHERE idItem=$id");
        mysqli_query($con, "DELETE FROM demandetransfert_details WHERE id=$id");

        $con->commit();

        response(array(
            "status" => true,
            "message" => "Ligne supprimée"
        ));
    }
}

/* =========================
   DEFAULT
========================= */
$con->rollback();

response(array(
    "status" => false,
    "message" => "Action non supportée"
));