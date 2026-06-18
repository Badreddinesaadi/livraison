<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

require __DIR__ . "/../config.php";
require "../users/token.php";

/* ================= TOKEN ================= */

$headers = getallheaders();

$token = isset($headers['auth_token']) ? $headers['auth_token'] : '';

if($token == ''){
    echo json_encode(array(
        "status"=>false,
        "message"=>"Token manquant"
    ));
    exit;
}

$tokendata = checkToken($token, $con);

if(!$tokendata['status']){
    http_response_code(401);
    echo json_encode(array(
        "status"=>false,
        "message"=>$tokendata['code']
    ));
    exit;
}

$userId = $tokendata['idUser'];

$method = $_SERVER['REQUEST_METHOD'];

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if(!$data){
    $data = array();
}

$con->begin_transaction();

try {

    /* =========================================================
        GET : LISTE DES LOTS D'UNE DEMANDE
    ========================================================= */
    if($method == 'GET'){

        if(!isset($_GET['idItem']) || $_GET['idItem'] == ''){
            throw new Exception("idItem requis");
        }

        $idItem = intval($_GET['idItem']);

        // DETAIL ARTICLE
        $stmt = $con->prepare("
            SELECT dd.*, p.produit, p.type_stock
            FROM demandetransfert_details dd
            JOIN vue_produits p ON p.produit_id = dd.idProduit
            WHERE dd.id=?
        ");

        $stmt->bind_param("i", $idItem);
        $stmt->execute();

        $detail = $stmt->get_result()->fetch_assoc();

        if(!$detail){
            throw new Exception("Article introuvable");
        }

        // LOTS
        $stmt2 = $con->prepare("
            SELECT *
            FROM transfer_lots
            WHERE idItem=?
        ");

        $stmt2->bind_param("i", $idItem);
        $stmt2->execute();

        $res = $stmt2->get_result();

        $lots = array();

        while($row = $res->fetch_assoc()){
            $lots[] = $row;
        }

        $con->commit();

        echo json_encode(array(
            "status"=>true,
            "detail"=>$detail,
            "lots"=>$lots
        ));
        exit;
    }

    /* =========================================================
        POST : SAUVEGARDE LOTS
    ========================================================= */
    if($method == 'POST'){

        if(!isset($data['idItem']) || $data['idItem'] == ''){
            throw new Exception("idItem requis");
        }

        if(!isset($data['idProduit']) || $data['idProduit'] == ''){
            throw new Exception("idProduit requis");
        }

        $idItem = intval($data['idItem']);
        $idProduit = intval($data['idProduit']);

        $lots = isset($data['lots']) ? $data['lots'] : array();

        // SUPPRESSION ANCIENS LOTS
        $con->query("
            DELETE FROM transfer_lots
            WHERE idItem=$idItem
            AND idProduit=$idProduit
        ");

        $totalQte = 0;
        $nbrLots = 0;

        for($i=0; $i<count($lots); $i++){

            $lot = $lots[$i]['lot'];
            $qte = $lots[$i]['qte'];

            $stmt = $con->prepare("
                INSERT INTO transfer_lots
                (idItem, idProduit, lot, qte)
                VALUES (?,?,?,?)
            ");

            $stmt->bind_param(
                "iisd",
                $idItem,
                $idProduit,
                $lot,
                $qte
            );

            $stmt->execute();

            $totalQte += $qte;
            $nbrLots++;
        }

        // UPDATE DETAIL
        $stmtUp = $con->prepare("
            UPDATE demandetransfert_details
            SET Qte=?, nbrFDX=?
            WHERE id=?
        ");

        $stmtUp->bind_param("dii", $totalQte, $nbrLots, $idItem);
        $stmtUp->execute();

        $con->commit();

        echo json_encode(array(
            "status"=>true,
            "message"=>"Lots enregistrés",
            "qte"=>$totalQte,
            "nbrLots"=>$nbrLots
        ));
        exit;
    }

    /* =========================================================
        PUT : MODIFIER LOT
    ========================================================= */
   if($method == 'PUT'){

    $action = isset($data['action']) ? $data['action'] : '';

    /* =========================================================
        1. PREPARER UN LOT
    ========================================================= */
    if($action == 'preparer_lot'){

        if(empty($data['idItem']) || empty($data['lot'])){
            throw new Exception("idItem et lot requis");
        }

        $idItem = intval($data['idItem']);
        $lot = $data['lot'];

        $stmt = $con->prepare("
            UPDATE transfer_lots
            SET preparer = 'Oui',
                idModif = ?
            WHERE idItem = ?
            AND lot = ?
        ");

        $stmt->bind_param("iis", $userId, $idItem, $lot);
        $stmt->execute();

        $con->commit();

        echo json_encode(array(
            "status" => true,
            "message" => "Lot marqué comme préparé"
        ));
        exit;
    }

    /* =========================================================
        2. MODIFIER UN LOT
    ========================================================= */
    elseif($action == 'modifier_lot'){

        if(empty($data['idItem']) || empty($data['idProduit']) || empty($data['oldLot'])){
            throw new Exception("idItem, idProduit et oldLot requis");
        }

        $stmt = $con->prepare("
            UPDATE transfer_lots
            SET old_lot = lot,
                lot = ?,
                qte = ?,
                idModif = ?
            WHERE idItem = ?
            AND idProduit = ?
            AND lot = ?
        ");

        $stmt->bind_param(
            "sdiiis",
            $data['newLot'],
            $data['qte'],
            $userId,
            $data['idItem'],
            $data['idProduit'],
            $data['oldLot']
        );

        $stmt->execute();

        /* recalcul */
        $idItem = intval($data['idItem']);

        $con->query("
            UPDATE demandetransfert_details d
            JOIN (
                SELECT idItem,
                       COUNT(*) nbr,
                       SUM(qte) qte
                FROM transfer_lots
                WHERE idItem = $idItem
                GROUP BY idItem
            ) x ON x.idItem = d.id
            SET d.Qte = x.qte,
                d.nbrFDX = x.nbr
            WHERE d.id = $idItem
        ");

        $con->commit();

        echo json_encode(array(
            "status" => true,
            "message" => "Lot modifié avec succès"
        ));
        exit;
    }

    /* =========================================================
        3. ACTION INVALIDE
    ========================================================= */
    else{

        throw new Exception("Action PUT invalide");
    }
}
    /* =========================================================
        DELETE : SUPPRESSION
    ========================================================= */
    if($method == 'DELETE'){

        if(!isset($data['idItem']) || $data['idItem'] == ''){
            throw new Exception("idItem requis");
        }

        $idItem = intval($data['idItem']);

        $con->query("
            DELETE FROM transfer_lots
            WHERE idItem=$idItem
        ");

        $con->query("
            DELETE FROM demandetransfert_details
            WHERE id=$idItem
        ");

        $con->commit();

        echo json_encode(array(
            "status"=>true,
            "message"=>"Supprimé avec succès"
        ));
        exit;
    }

}
catch(Exception $e){

    $con->rollback();

    echo json_encode(array(
        "status"=>false,
        "message"=>$e->getMessage()
    ));
}