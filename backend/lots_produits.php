<?php
/**
 * lots_produits.php : lots de stock d'un produit (vue_lots_solde)
 * (contrat API SDKWOOD - Produits)
 *
 * GET ?idProduit=                                   tous les lots du produit (idProduit facultatif)
 * GET ?remplacable=1&idProduit=&idLot=&idDevis=     lots éligibles au remplacement de idLot dans un devis
 * GET ?remplacable=1&idProduit=&idLot=&idDT=        lots éligibles au remplacement de idLot dans une demande de transfert
 * GET ?ajoutable=1&idProduit=&idDT=                 lots éligibles à l'ajout dans une demande de transfert
 *
 * idDevis et idDT s'excluent mutuellement.
 * Devis : mêmes règles que PUT preparation_devis_produits.php (type=remplacer_lot).
 * Demande de transfert : refusée (409) si elle est au statut Reçue ; en remplacement, le lot courant
 * ne doit pas être préparé ; le statut Brouillon n'impose aucun critère de couleur ni de longueur
 * (même règle que details_demande_transfert.php).
 * Compatible PHP 5.5.
 */
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require "../config.php";
require "../functions.php";
require "../users/token.php";

if (!defined('JBM_DB')) define('JBM_DB', 'jbm');

// ------------------ Utilitaires ------------------
// Erreur au format du contrat : { status: false, message }
function erreur($message, $httpStatus) {
    send_response(array(
        'status' => false,
        'message' => $message
    ), $httpStatus);
    exit;
}

function preparerOuErreur($con, $sql) {
    $stmt = $con->prepare($sql);
    if (!$stmt) {
        erreur("SQL Error: " . $con->error, 500);
    }
    return $stmt;
}

// Longueur : "4", "4.00", "4,0" sont considérées identiques (même règle que le remplacement de lot)
function normaliserLongueur($v) {
    $v = trim((string) $v);
    $n = str_replace(',', '.', $v);
    if ($v !== '' && is_numeric($n)) return (string) round((float) $n, 4);
    return strtolower($v);
}
function memeLongueur($a, $b) {
    return normaliserLongueur($a) === normaliserLongueur($b);
}

function entierPositif($v) {
    return $v !== null && $v !== '' && ctype_digit((string) $v) && (int) $v > 0;
}

// Statuts de demande de transfert : Brouillon, Encours, Envoye, Reçue
function enBrouillon($statut) {
    return $statut !== null && strtolower(trim((string) $statut)) === 'brouillon';
}
function enRecue($statut) {
    if ($statut === null) return false;
    // "Reçue", "Recue" et même "ReÃ§ue" (accent mal encodé en base)
    return (bool) preg_match('/^re.{1,4}ue$/', strtolower(trim((string) $statut)));
}

function demandeTransfert($con, $idDT) {
    $s = preparerOuErreur($con, "SELECT id, statut FROM demandetransfert WHERE id = ? LIMIT 1");
    $s->bind_param("i", $idDT);
    $s->execute();
    return $s->get_result()->fetch_assoc();
}

// Codes des lots d'un produit déjà présents dans une demande de transfert : ["code" => true]
function lotsDeLaDemande($con, $idDT, $idProduit) {
    $s = preparerOuErreur($con, "SELECT tl.Lot AS lot
        FROM transfer_lots tl
        JOIN demandetransfert_details dd ON dd.id = tl.idItem
        WHERE dd.idDT = ? AND tl.idProduit = ?");
    $s->bind_param("ii", $idDT, $idProduit);
    $s->execute();
    $res = $s->get_result();
    $set = array();
    while ($r = $res->fetch_assoc()) $set[(string) $r['lot']] = true;
    return $set;
}

// UTF-8 SAFE (comportement existant)
function lotsEnUtf8($lots) {
    return array_map(function($item){
        return array_map(function($value){
            return is_string($value) ? utf8_encode($value) : $value;
        }, $item);
    }, $lots);
}

function repondreLots($lots) {
    echo json_encode(array(
        'status' => true,
        'data' => lotsEnUtf8($lots)
    ), JSON_UNESCAPED_UNICODE);
    exit;
}

// Colonnes retournées (schéma ProduitLot)
$COLONNES = "id_depot, product_id, color_id, couleur, colorCode, num_lot, longueur,
             nbrePiece, observation, date, nbreJrs, solde, qte_uv, depot, unite_v, tarif";

// ------------------ Vérification Header ------------------
$headers = checkAppHeader();

if(isset($headers['status']) && !$headers['status']){
    echo json_encode([
        "status" => false,
        "message" => "Authentication headers missing"
    ]);
    exit;
}

// ------------------ Vérification du token ------------------
$token = $headers['auth_token'];
$tokendata = checkToken($token, $con);

if(!$tokendata['status']){
    send_response([
        'status' => false,
        "message" => $tokendata['code'],
    ], 401);
    exit;
}

// ------------------ Méthode HTTP ------------------
$method = get_method();

// ------------------ GET LOTS PRODUITS ------------------
if($method === 'GET'){

    $remplacable = isset($_GET['remplacable']) && $_GET['remplacable'] === '1';
    $ajoutable = isset($_GET['ajoutable']) && $_GET['ajoutable'] === '1';

    if ($remplacable && $ajoutable) {
        erreur("remplacable et ajoutable sont mutuellement exclusifs", 400);
    }

    // =====================================================
    // Mode remplacement : remplacable=1 (devis OU demande de transfert)
    // =====================================================
    if ($remplacable) {

        $idProduitBrut = isset($_GET['idProduit']) ? $_GET['idProduit'] : '';
        $idLot = isset($_GET['idLot']) ? trim($_GET['idLot']) : '';
        $aDevis = isset($_GET['idDevis']) && $_GET['idDevis'] !== '';
        $aDT = isset($_GET['idDT']) && $_GET['idDT'] !== '';

        if (!entierPositif($idProduitBrut) || $idLot === '' || (!$aDevis && !$aDT)) {
            erreur("idProduit, idLot et idDevis ou idDT sont requis lorsque remplacable=1", 400);
        }
        if ($aDevis && $aDT) {
            erreur("idDevis et idDT sont mutuellement exclusifs", 400);
        }
        $idProduit = (int) $idProduitBrut;

        // ---------------- Contexte demande de transfert ----------------
        if ($aDT) {

            if (!entierPositif($_GET['idDT'])) {
                erreur("idProduit, idLot et idDevis ou idDT sont requis lorsque remplacable=1", 400);
            }
            $idDT = (int) $_GET['idDT'];

            $dt = demandeTransfert($con, $idDT);
            if (!$dt) erreur("Demande de transfert introuvable", 404);
            if (enRecue($dt['statut'])) erreur("Demande de transfert non modifiable (statut Reçue)", 409);
            $brouillon = enBrouillon($dt['statut']);

            // Lot courant : doit être sur cette demande, pour ce produit
            $stmtCourant = preparerOuErreur($con, "
                SELECT tl.preparer,
                       CASE WHEN v.num_lot IS NULL THEN ls.idCouleur ELSE v.color_id END AS color_id,
                       CASE WHEN v.num_lot IS NULL THEN ls.infos3 ELSE v.longueur END AS longueur
                FROM transfer_lots tl
                JOIN demandetransfert_details dd ON dd.id = tl.idItem
                JOIN " . JBM_DB . ".produits_lots_solde ls ON ls.num_lot = tl.Lot AND ls.product_id = tl.idProduit
                LEFT JOIN vue_lots_solde v ON v.num_lot = tl.Lot AND v.product_id = tl.idProduit
                WHERE dd.idDT = ? AND tl.idProduit = ? AND tl.Lot = ?
                LIMIT 1
            ");
            $stmtCourant->bind_param("iis", $idDT, $idProduit, $idLot);
            $stmtCourant->execute();
            $courant = $stmtCourant->get_result()->fetch_assoc();

            if (!$courant) erreur("Lot courant introuvable sur cette demande", 404);
            if ($courant['preparer'] === 'Oui') {
                erreur("Le lot courant est déjà préparé : il ne peut pas être remplacé", 409);
            }

            // Brouillon : aucun critère de couleur ni de longueur
            if ($brouillon) {
                $stmt = preparerOuErreur($con, "
                    SELECT $COLONNES
                    FROM vue_lots_solde
                    WHERE product_id = ? AND solde > 0 AND num_lot <> ?
                    ORDER BY date DESC
                ");
                $stmt->bind_param("is", $idProduit, $idLot);
            } else {
                $stmt = preparerOuErreur($con, "
                    SELECT $COLONNES
                    FROM vue_lots_solde
                    WHERE product_id = ? AND color_id <=> ? AND solde > 0 AND num_lot <> ?
                    ORDER BY date DESC
                ");
                $couleur = ($courant['color_id'] === null) ? null : (int) $courant['color_id'];
                $stmt->bind_param("iis", $idProduit, $couleur, $idLot);
            }
            $stmt->execute();
            $result = $stmt->get_result();

            $dejaDansLaDemande = lotsDeLaDemande($con, $idDT, $idProduit);
            $lots = [];
            while($row = $result->fetch_assoc()){
                if (isset($dejaDansLaDemande[(string) $row['num_lot']])) continue;
                if (!$brouillon && !memeLongueur($courant['longueur'], $row['longueur'])) continue;
                $lots[] = $row;
            }

            repondreLots($lots);
        }

        // ---------------- Contexte devis ----------------
        if (!entierPositif($_GET['idDevis'])) {
            erreur("idProduit, idLot et idDevis ou idDT sont requis lorsque remplacable=1", 400);
        }
        $idDevis = (int) $_GET['idDevis'];

        // Lot courant : doit être sur ce devis. Couleur et longueur lues dans vue_lots_solde,
        // avec repli sur la table brute si le lot n'apparaît plus dans la vue.
        $stmtCourant = preparerOuErreur($con, "
            SELECT dl.idItem,
                   CASE WHEN v.num_lot IS NULL THEN ls.idCouleur ELSE v.color_id END AS color_id,
                   CASE WHEN v.num_lot IS NULL THEN ls.infos3 ELSE v.longueur END AS longueur
            FROM devis_lots dl
            JOIN " . JBM_DB . ".document_items di ON di.id_item = dl.idItem
            JOIN " . JBM_DB . ".produits_lots_solde ls ON ls.num_lot = dl.lot AND ls.product_id = dl.idProduit
            LEFT JOIN vue_lots_solde v ON v.num_lot = dl.lot AND v.product_id = dl.idProduit
            WHERE di.id_document = ? AND dl.idProduit = ? AND dl.lot = ?
            LIMIT 1
        ");
        $stmtCourant->bind_param("iis", $idDevis, $idProduit, $idLot);
        $stmtCourant->execute();
        $courant = $stmtCourant->get_result()->fetch_assoc();

        if (!$courant) {
            erreur("Lot courant introuvable sur ce devis", 404);
        }

        // Candidats : même produit, même couleur, du stock, autre lot, pas déjà sur la ligne du devis
        $stmt = preparerOuErreur($con, "
            SELECT $COLONNES
            FROM vue_lots_solde
            WHERE product_id = ?
              AND color_id <=> ?
              AND solde > 0
              AND num_lot <> ?
              AND num_lot NOT IN (
                  SELECT dl2.lot
                  FROM devis_lots dl2
                  JOIN " . JBM_DB . ".document_items di2 ON di2.id_item = dl2.idItem
                  WHERE di2.id_document = ? AND dl2.idProduit = ?
              )
            ORDER BY date DESC
        ");
        $couleur = ($courant['color_id'] === null) ? null : (int) $courant['color_id'];
        $stmt->bind_param("iisii", $idProduit, $couleur, $idLot, $idDevis, $idProduit);
        $stmt->execute();
        $result = $stmt->get_result();

        // La longueur est comparée ici ("4" et "4.00" sont identiques)
        $lots = [];
        while($row = $result->fetch_assoc()){
            if (memeLongueur($courant['longueur'], $row['longueur'])) {
                $lots[] = $row;
            }
        }

        repondreLots($lots);
    }

    // =====================================================
    // Mode ajout transfert : ajoutable=1
    // =====================================================
    if ($ajoutable) {

        $idProduitBrut = isset($_GET['idProduit']) ? $_GET['idProduit'] : '';
        $idDTBrut = isset($_GET['idDT']) ? $_GET['idDT'] : '';

        if (!entierPositif($idProduitBrut) || !entierPositif($idDTBrut)) {
            erreur("idProduit et idDT sont requis lorsque ajoutable=1", 400);
        }
        $idProduit = (int) $idProduitBrut;
        $idDT = (int) $idDTBrut;

        $dt = demandeTransfert($con, $idDT);
        if (!$dt) erreur("Demande de transfert introuvable", 404);
        if (enRecue($dt['statut'])) erreur("Demande de transfert non modifiable (statut Reçue)", 409);

        // Couleur et longueur de référence : celles du produit, quand il les définit
        $stmtProduit = preparerOuErreur($con, "SELECT idCouleur, longueur FROM vue_produits WHERE produit_id = ? LIMIT 1");
        $stmtProduit->bind_param("i", $idProduit);
        $stmtProduit->execute();
        $produit = $stmtProduit->get_result()->fetch_assoc();
        if (!$produit) erreur("Produit introuvable", 404);

        $couleurProduit = (!empty($produit['idCouleur'])) ? (int) $produit['idCouleur'] : null;
        $longueurProduit = normaliserLongueur($produit['longueur']);
        $filtrerLongueur = ($longueurProduit !== '' && $longueurProduit !== '0');

        if ($couleurProduit !== null) {
            $stmt = preparerOuErreur($con, "
                SELECT $COLONNES
                FROM vue_lots_solde
                WHERE product_id = ? AND color_id = ? AND solde > 0
                ORDER BY date DESC
            ");
            $stmt->bind_param("ii", $idProduit, $couleurProduit);
        } else {
            $stmt = preparerOuErreur($con, "
                SELECT $COLONNES
                FROM vue_lots_solde
                WHERE product_id = ? AND solde > 0
                ORDER BY date DESC
            ");
            $stmt->bind_param("i", $idProduit);
        }
        $stmt->execute();
        $result = $stmt->get_result();

        $dejaDansLaDemande = lotsDeLaDemande($con, $idDT, $idProduit);
        $lots = [];
        while($row = $result->fetch_assoc()){
            if (isset($dejaDansLaDemande[(string) $row['num_lot']])) continue;
            if ($filtrerLongueur && !memeLongueur($produit['longueur'], $row['longueur'])) continue;
            $lots[] = $row;
        }

        repondreLots($lots);
    }

    // =====================================================
    // Mode standard (inchangé)
    // =====================================================

    // filtre optionnel
    $idProduit = isset($_GET['idProduit']) ? intval($_GET['idProduit']) : 0;

    $sql = "
        SELECT $COLONNES
        FROM vue_lots_solde
    ";

    // condition dynamique
    if($idProduit > 0){
        $sql .= " WHERE product_id = ? ";
    }

    $sql .= " ORDER BY date DESC";

    $stmt = $con->prepare($sql);

    if(!$stmt){
        send_response([
            "status" => false,
            "message" => "SQL Error: " . $con->error
        ], 500);
        exit;
    }

    // bind si filtre actif
    if($idProduit > 0){
        $stmt->bind_param("i", $idProduit);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $lots = [];

    while($row = $result->fetch_assoc()){
        $lots[] = $row;
    }

    repondreLots($lots);

}

// ------------------ METHOD NOT ALLOWED ------------------
send_response([
    'status' => false,
    'message' => 'Méthode HTTP non autorisée'
], 405);

?>