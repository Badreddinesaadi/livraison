<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, auth_token");

require __DIR__ . "/../config.php";
require "../users/token.php";

if (!defined('JBM_DB')) define('JBM_DB', 'jbm');

/* =========================================================
   TOKEN
========================================================= */
$headers = getallheaders();
$token = isset($headers['auth_token']) ? $headers['auth_token'] : null;

if (!$token) {
    echo json_encode(array("status"=>false,"message"=>"Token manquant"));
    exit;
}

$tokendata = checkToken($token, $con);

if (!$tokendata['status']) {
    http_response_code(401);
    echo json_encode(array("status"=>false,"message"=>$tokendata['code']));
    exit;
}

$userId = $tokendata['idUser'];

$method = $_SERVER['REQUEST_METHOD'];

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) $data = $_POST;

/* =========================================================
   RESPONSE
========================================================= */
function response($arr){
    echo json_encode($arr);
    exit;
}

/* =========================================================
   REMPLACEMENT D'UN LOT : règles selon le statut de la demande
   - Brouillon : le lot se change sans critère (couleur, longueur...),
                 mais on ne peut PAS préparer produits ni lots.
   - Encours, Envoye, Reçue : le nouveau lot doit être du même produit,
                 de même couleur et de même longueur que le lot remplacé.
   - Reçue : on ne peut PAS préparer non plus ; on marque le produit comme
                 reçu (POST type=recevoir_produit, id = ligne).
========================================================= */
function preparerSql($con, $sql){
    $s = $con->prepare($sql);
    if (!$s) {
        $con->rollback();
        response(array("status" => false, "message" => "Erreur SQL : " . $con->error));
    }
    return $s;
}

// Statut de la demande de transfert qui porte une ligne (demandetransfert_details.id)
function statutDemandeDeLigne($con, $idItem){
    $s = preparerSql($con, "SELECT dt.statut FROM demandetransfert_details dd
        JOIN demandetransfert dt ON dt.id = dd.idDT WHERE dd.id = ? LIMIT 1");
    $s->bind_param("i", $idItem);
    $s->execute();
    $r = $s->get_result()->fetch_assoc();
    return $r ? $r['statut'] : null;
}
function enBrouillon($statut){
    return $statut !== null && strtolower(trim((string) $statut)) === 'brouillon';
}
function enRecue($statut){
    if ($statut === null) return false;
    // "Reçue", "Recue" et même "ReÃ§ue" (accent mal encodé en base) : seul ce statut ressemble à re..ue
    return (bool) preg_match('/^re.{1,4}ue$/', strtolower(trim((string) $statut)));
}

function normaliserLongueur($v){
    $v = trim((string) $v);
    $n = str_replace(',', '.', $v);
    if ($v !== '' && is_numeric($n)) return (string) round((float) $n, 4);
    return strtolower($v);
}

function libelleCouleur($con, $idCouleur){
    if ($idCouleur === null || $idCouleur === '') return 'aucune';
    $s = preparerSql($con, "SELECT designation FROM couleurs WHERE id = ?");
    $s->bind_param("i", $idCouleur);
    $s->execute();
    $r = $s->get_result()->fetch_assoc();
    return $r ? $r['designation'] : (string) $idCouleur;
}

// Caractéristiques d'un lot. Source : vue_lots_solde (comme lots_produits.php),
// avec repli sur la table brute pour un lot qui n'y figure plus (stock épuisé).
function caracteristiquesLot($con, $numLot, $idProduit, $repliTable){
    if ($idProduit === null) {
        $s = preparerSql($con, "SELECT num_lot, product_id, color_id, longueur, solde FROM vue_lots_solde WHERE num_lot = ? LIMIT 1");
        $s->bind_param("s", $numLot);
    } else {
        $s = preparerSql($con, "SELECT num_lot, product_id, color_id, longueur, solde FROM vue_lots_solde WHERE num_lot = ? AND product_id = ? LIMIT 1");
        $s->bind_param("si", $numLot, $idProduit);
    }
    $s->execute();
    $r = $s->get_result()->fetch_assoc();
    if ($r) return $r;

    if ($repliTable && $idProduit !== null) {
        $s2 = preparerSql($con, "SELECT num_lot, product_id, idCouleur AS color_id, infos3 AS longueur, solde
            FROM " . JBM_DB . ".produits_lots_solde WHERE num_lot = ? AND product_id = ? LIMIT 1");
        $s2->bind_param("si", $numLot, $idProduit);
        $s2->execute();
        return $s2->get_result()->fetch_assoc();
    }
    return null;
}

// Retourne true si le remplacement est autorisé, sinon la réponse d'erreur à renvoyer
function verifierRemplacementLot($con, $idItem, $idProduit, $oldLot, $newLot, $brouillon = false){
    $oldLot = trim((string) $oldLot);
    $newLot = trim((string) $newLot);

    // Même lot : simple changement de quantité, rien à contrôler
    if ($oldLot !== '' && $oldLot === $newLot) return true;

    if ($newLot === '') {
        return array("status" => false, "code" => "VALIDATION_ERROR", "message" => "new_lot est requis");
    }

    // Le lot actuel doit être sur la ligne
    $s = preparerSql($con, "SELECT 1 FROM transfer_lots WHERE idItem = ? AND idProduit = ? AND Lot = ? LIMIT 1");
    $s->bind_param("iis", $idItem, $idProduit, $oldLot);
    $s->execute();
    if (!$s->get_result()->fetch_assoc()) {
        return array("status" => false, "code" => "NOT_FOUND", "message" => "Lot actuel $oldLot introuvable sur cette ligne");
    }

    // Le nouveau lot ne doit pas déjà être sur la ligne
    $d = preparerSql($con, "SELECT 1 FROM transfer_lots WHERE idItem = ? AND idProduit = ? AND Lot = ? LIMIT 1");
    $d->bind_param("iis", $idItem, $idProduit, $newLot);
    $d->execute();
    if ($d->get_result()->fetch_assoc()) {
        return array("status" => false, "code" => "LOT_DEJA_AFFECTE", "message" => "Le lot $newLot est déjà sur cette ligne");
    }

    // Brouillon : aucun critère (produit, couleur, longueur, stock) n'est imposé
    if ($brouillon) return true;

    $ancien = caracteristiquesLot($con, $oldLot, $idProduit, true);
    $nouveau = caracteristiquesLot($con, $newLot, $idProduit, false);

    $ecarts = array();

    if (!$nouveau) {
        // Existe-t-il pour un autre produit ?
        $autre = caracteristiquesLot($con, $newLot, null, false);
        if (!$autre) {
            return array("status" => false, "code" => "NOT_FOUND", "message" => "Lot $newLot introuvable en stock");
        }
        $ecarts[] = array('critere' => 'produit', 'attendu' => $idProduit, 'recu' => (int) $autre['product_id'],
            'message' => 'Le lot doit être du même produit');
        $nouveau = $autre;
    }

    if ($ancien) {
        $ca = ($ancien['color_id'] === null) ? null : (int) $ancien['color_id'];
        $cb = ($nouveau['color_id'] === null) ? null : (int) $nouveau['color_id'];
        if ($ca !== $cb) {
            $ecarts[] = array('critere' => 'couleur', 'attendu' => libelleCouleur($con, $ca), 'recu' => libelleCouleur($con, $cb),
                'message' => 'Le lot doit avoir la même couleur');
        }
        if (normaliserLongueur($ancien['longueur']) !== normaliserLongueur($nouveau['longueur'])) {
            $ecarts[] = array('critere' => 'longueur', 'attendu' => trim((string) $ancien['longueur']), 'recu' => trim((string) $nouveau['longueur']),
                'message' => 'Le lot doit avoir la même longueur');
        }
    }

    if (!empty($ecarts)) {
        $details = array();
        foreach ($ecarts as $e) {
            $details[] = $e['critere'] . " (attendu " . $e['attendu'] . ", reçu " . $e['recu'] . ")";
        }
        return array(
            "status" => false,
            "code" => "CRITERES_NON_RESPECTES",
            "message" => "Le lot $newLot ne respecte pas les critères de remplacement : " . implode(', ', $details),
            "ecarts" => $ecarts
        );
    }

    if ((float) $nouveau['solde'] <= 0) {
        return array("status" => false, "code" => "LOT_SANS_STOCK", "message" => "Le lot $newLot n'a plus de stock");
    }

    return true;
}

/* =========================================================
   GET (FIXED : else branch ajoutée)
========================================================= */
if ($method == "GET") {

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

            $sql2 = "SELECT tl.*, vls.id_depot AS depotId, vls.depot AS depotName
                     FROM transfer_lots tl
                     LEFT JOIN vue_lots_solde vls 
                        ON vls.num_lot = tl.Lot 
                        AND vls.product_id = tl.idProduit
                     WHERE tl.idItem = $idItem";

            $res2 = mysqli_query($con, $sql2);

            $lots = array();

            while ($l = mysqli_fetch_assoc($res2)) {
                $lots[] = $l;
            }

            $row['lots'] = $lots;
            $details[] = $row;
        }

        response(array(
            "status" => true,
            "idDT" => $idDT,
            "data" => array("details" => $details)
        ));
    }

    // Aucun paramètre "details" reconnu
    response(array(
        "status" => false,
        "message" => "Paramètre 'details' requis"
    ));
}

/* =========================================================
   POST
========================================================= */
if ($method == "POST") {

    $type = isset($data['type']) ? $data['type'] : null;

    /* =========================
       AJOUT PRODUIT
    ========================= */
    if ($type == "detail") {

        $con->begin_transaction();

        $idDT      = intval($data['idDT']);
        $idProduit = intval($data['idProduit']);
        $qte       = floatval($data['qte']);
        $nbrFDX    = floatval($data['nbrFDX']);
        $unite     = mysqli_real_escape_string($con, $data['unite']);

        $sql = "INSERT INTO demandetransfert_details
                (idDT, idProduit, Qte, nbrFDX, unite)
                VALUES
                ($idDT, $idProduit, $qte, $nbrFDX, '$unite')";

        mysqli_query($con, $sql);

        $idItem = mysqli_insert_id($con);

        $con->commit();

        response(array(
            "status" => true,
            "idItem" => $idItem,
            "message" => "Produit ajouté"
        ));
    }

    /* =========================
       AJOUT LOTS
    ========================= */
    if ($type == "detail_lots") {

        $con->begin_transaction();

        $idItem    = intval($data['idItem']);
        $idProduit = intval($data['idProduit']);
        $lots      = isset($data['lots']) ? $data['lots'] : array();

        foreach ($lots as $lot) {

            $Lot = mysqli_real_escape_string($con, $lot['Lot']);
            $qte = floatval($lot['qte']);

            $sql = "INSERT INTO transfer_lots
                    (idItem, idProduit, Lot, qte)
                    VALUES
                    ($idItem, $idProduit, '$Lot', $qte)";

            mysqli_query($con, $sql);
        }

        $con->commit();

        response(array(
            "status" => true,
            "message" => "Lots ajoutés"
        ));
    }

    /* =========================
       PREPARER PRODUIT
    ========================= */
    if ($type == "preparer_produit") {

        $id = intval($data['id']);

        $statutLigne = statutDemandeDeLigne($con, $id);
        if (enBrouillon($statutLigne)) {
            response(array(
                "status" => false,
                "code" => "DEMANDE_EN_BROUILLON",
                "message" => "Impossible de préparer un produit : la demande de transfert est en brouillon"
            ));
        }
        if (enRecue($statutLigne)) {
            response(array(
                "status" => false,
                "code" => "DEMANDE_RECUE",
                "message" => "Impossible de préparer un produit : la demande est reçue. Marque le produit comme reçu (type recevoir_produit)"
            ));
        }

        mysqli_query($con,
            "UPDATE demandetransfert_details
             SET preparer = 'Oui'
             WHERE id = $id"
        );

        response(array(
            "status" => true,
            "message" => "Produit préparé"
        ));
    }

    /* =========================
       PREPARER LOT + SYNC PRODUIT (FIXED)
    ========================= */
    if ($type == "preparer_lot") {

        $idItem    = intval($data['idItem']);
        $idProduit = intval($data['idProduit']);
        $Lot       = mysqli_real_escape_string($con, $data['Lot']);

        $statutLigne = statutDemandeDeLigne($con, $idItem);
        if (enBrouillon($statutLigne)) {
            response(array(
                "status" => false,
                "code" => "DEMANDE_EN_BROUILLON",
                "message" => "Impossible de préparer un lot : la demande de transfert est en brouillon"
            ));
        }
        if (enRecue($statutLigne)) {
            response(array(
                "status" => false,
                "code" => "DEMANDE_RECUE",
                "message" => "Impossible de préparer un lot : la demande est reçue. Marque le produit comme reçu (type recevoir_produit)"
            ));
        }

        /* 1. UPDATE LOT */
        mysqli_query($con,
            "UPDATE transfer_lots
             SET preparer = 'Oui'
             WHERE idItem = $idItem
               AND idProduit = $idProduit
               AND Lot = '$Lot'"
        );

        /* 2. CHECK TOTAL VS PREPARED */
        $totalQ = mysqli_query($con,
            "SELECT COUNT(*) as total
             FROM transfer_lots
             WHERE idItem = $idItem
               AND idProduit = $idProduit"
        );

        $totalRow = mysqli_fetch_assoc($totalQ);
        $total = $totalRow['total'];

        $doneQ = mysqli_query($con,
            "SELECT COUNT(*) as done
             FROM transfer_lots
             WHERE idItem = $idItem
               AND idProduit = $idProduit
               AND preparer = 'Oui'"
        );

        $doneRow = mysqli_fetch_assoc($doneQ);
        $done = $doneRow['done'];

        /* 3. ONLY IF ALL LOTS ARE PREPARED */
        if ($total > 0 && $total == $done) {

            mysqli_query($con,
                "UPDATE demandetransfert_details
                 SET preparer = 'Oui'
                 WHERE id = $idItem"
            );
        }

        response(array(
            "status" => true,
            "message" => "Lot préparé + sync correcte"
        ));
    }

    /* =========================
       RECEVOIR PRODUIT (statut Reçue uniquement)
       Colonnes requises : demandetransfert_details.recu, idRecu, dateRecu
       (script alter_demandetransfert_details_recu.sql)
    ========================= */
    if ($type == "recevoir_produit") {

        $id = isset($data['id']) ? intval($data['id']) : 0;
        if ($id <= 0) {
            response(array("status" => false, "code" => "VALIDATION_ERROR", "message" => "id (ligne du produit) est requis"));
        }

        $statutLigne = statutDemandeDeLigne($con, $id);
        if ($statutLigne === null) {
            response(array("status" => false, "code" => "NOT_FOUND", "message" => "Produit introuvable"));
        }
        if (!enRecue($statutLigne)) {
            response(array(
                "status" => false,
                "code" => "DEMANDE_NON_RECUE",
                "message" => "Impossible de marquer le produit comme reçu : la demande n'est pas au statut Reçue (statut actuel : " . $statutLigne . ")"
            ));
        }

        // On garde qui a reçu et quand lors du premier marquage (idempotent) :
        // les affectations sont évaluées de gauche à droite, recu est donc mis à jour en dernier.
        $s = preparerSql($con, "UPDATE demandetransfert_details
            SET idRecu = IF(recu = 'Oui', idRecu, ?),
                dateRecu = IF(recu = 'Oui', dateRecu, NOW()),
                recu = 'Oui'
            WHERE id = ?");
        $s->bind_param("ii", $userId, $id);
        $s->execute();

        response(array(
            "status" => true,
            "message" => "Produit marqué comme reçu"
        ));
    }

    /* =========================
       DEFAULT
    ========================= */
    response(array(
        "status" => false,
        "message" => "Action non supportée"
    ));
}

/* =========================================================
   PUT (FIXED : isset sur type)
========================================================= */
if ($method == "PUT") {

    $type = isset($data['type']) ? $data['type'] : null;

    if ($type == "update_lot") {

        $con->begin_transaction();

        $userId = isset($data['userId']) ? intval($data['userId']) : 0;

        /* ---- Contrôle de tous les remplacements AVANT toute écriture ---- */
        if (!empty($data['lots_update'])) {

            foreach ($data['lots_update'] as $lot) {

                $idItemLot = isset($lot['idItem']) ? intval($lot['idItem']) : 0;
                $brouillon = enBrouillon(statutDemandeDeLigne($con, $idItemLot));

                $verif = verifierRemplacementLot(
                    $con,
                    $idItemLot,
                    isset($lot['idProduit']) ? intval($lot['idProduit']) : 0,
                    isset($lot['old_lot']) ? $lot['old_lot'] : '',
                    isset($lot['new_lot']) ? $lot['new_lot'] : '',
                    $brouillon
                );

                if ($verif !== true) {
                    $con->rollback();
                    response($verif);
                }
            }
        }

        if (!empty($data['lots_update'])) {

            foreach ($data['lots_update'] as $lot) {

                $idItem = intval($lot['idItem']);
                $idProduit = intval($lot['idProduit']);

                $oldLot = mysqli_real_escape_string($con, $lot['old_lot']);
                $newLot = mysqli_real_escape_string($con, $lot['new_lot']);
                $qte = floatval($lot['qte']);

                mysqli_query($con,
                    "UPDATE transfer_lots
                     SET Lot='$newLot', qte=$qte, idModif=$userId
                     WHERE idItem=$idItem AND idProduit=$idProduit AND Lot='$oldLot'"
                );
            }
        }

        if (!empty($data['lots_insert'])) {

            foreach ($data['lots_insert'] as $lot) {

                $idItem = intval($lot['idItem']);
                $idProduit = intval($lot['idProduit']);
                $Lot = mysqli_real_escape_string($con, $lot['Lot']);
                $qte = floatval($lot['qte']);

                mysqli_query($con,
                    "INSERT INTO transfer_lots
                     (idItem,idProduit,Lot,qte,idModif)
                     VALUES
                     ($idItem,$idProduit,'$Lot',$qte,$userId)"
                );
            }
        }

        if (!empty($data['lots_delete'])) {

            foreach ($data['lots_delete'] as $lot) {

                $idItem = intval($lot['idItem']);
                $idProduit = intval($lot['idProduit']);
                $Lot = mysqli_real_escape_string($con, $lot['Lot']);

                mysqli_query($con,
                    "DELETE FROM transfer_lots
                     WHERE idItem=$idItem AND idProduit=$idProduit AND Lot='$Lot'"
                );
            }
        }

        $con->commit();

        response(array(
            "status" => true,
            "message" => "Lots update OK"
        ));
    }

    response(array(
        "status" => false,
        "message" => "Action non supportée"
    ));
}

/* =========================================================
   DELETE (FIXED : isset sur type)
========================================================= */
if ($method == "DELETE") {

    $type = isset($data['type']) ? $data['type'] : null;

    if ($type == "detail") {

        $id = intval($data['id']);

        mysqli_query($con, "DELETE FROM transfer_lots WHERE idItem=$id");
        mysqli_query($con, "DELETE FROM demandetransfert_details WHERE id=$id");

        response(array(
            "status"=>true,
            "message"=>"deleted"
        ));
    }

    response(array(
        "status" => false,
        "message" => "Action non supportée"
    ));
}