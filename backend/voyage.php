<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

require __DIR__ . "/../config.php";
require "../users/token.php";
require __DIR__ . "/../functions.php";

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$con->set_charset("utf8mb4");

// ------------------ V�rification du token ------------------
$headers = checkAppHeader();
$token = isset($headers['auth_token']) ? $headers['auth_token'] : null;

if(empty($token)){
    http_response_code(401);
    echo json_encode(["status"=>false,"message"=>"Token manquant"]);
    exit;
}

$tokendata = checkToken($token, $con);
if(!$tokendata['status']){
    http_response_code(401);
    echo json_encode(["status"=>false,"message"=>$tokendata['message']]);
    exit;
}

$userId = $tokendata['idUser'];

$stmtRole = $con->prepare("SELECT role FROM utilisateur WHERE id=?");
$stmtRole->bind_param("i",$userId);
$stmtRole->execute();
$resRole = $stmtRole->get_result()->fetch_assoc();
$userRole = $resRole['role'];

$method = get_method();
$data = get_request_data();

$con->begin_transaction();

try {

    // ==================== POST ====================
   if($method === 'POST'){

    // Ajouter 'idVille' aux champs requis
    $requiredFields = ['date_depart', 'idChauffeur', 'idVehicule', 'km_depart', 'depot_depart', 'idVille'];
    foreach ($requiredFields as $field) {
        if(!isset($data[$field])){
            throw new Exception("Le champ $field est requis");
        }
    }

    // Préparer la requête avec idVille
    $stmt = $con->prepare("
        INSERT INTO voyage (date_depart, idChauffeur, idVehicule, km_depart, depot_depart, idVille, statut, date_create, idCreate)
        VALUES (?, ?, ?, ?, ?, ?, 'encours', NOW(), ?)
    ");

    $stmt->bind_param(
        "siiiiii",
        $data['date_depart'],
        $data['idChauffeur'],
        $data['idVehicule'],
        $data['km_depart'],
        $data['depot_depart'],
        $data['idVille'], // <-- ici
        $userId
    );
    $stmt->execute();
    $voyageId = $stmt->insert_id;

    // Gestion des BL
    if(isset($data['bl_list']) && is_array($data['bl_list'])){
        $stmtBL = $con->prepare("INSERT INTO voyage_bl (idVoyage, idBL, statut) VALUES (?, ?, 'encours')");
        foreach($data['bl_list'] as $bl){
            if(!isset($bl['id'])) continue;
            $stmtBL->bind_param("ii", $voyageId, $bl['id']);
            $stmtBL->execute();
        }
    }

    $con->commit();

    send_response([
        "status" => true,
        "message" => "Voyage crée avec succés",
        "data" => ["voyage_id" => $voyageId]
    ]);
}
    // ==================== GET ====================
    if($method === 'GET'){

        function getBLList($con, $idVoyage, $userRole, $userId){
            $sql = "
                SELECT vb.id AS idVoyageBL, vb.idBL AS id, d.id_document AS code, d.datetime_document, vb.statut, p.societe AS nomClient
                FROM voyage_bl vb
                JOIN jbm.document d ON d.id = vb.idBL
                JOIN jbm.partenaires p ON p.id = d.id_entreprise
                JOIN voyage v ON vb.idVoyage = v.id
                WHERE vb.idVoyage=? ".($userRole=="chauffeur"?" AND v.idChauffeur=?":"")."
            ";
            $stmtBL = $con->prepare($sql);

            if($userRole=="chauffeur"){
                $stmtBL->bind_param("ii",$idVoyage,$userId);
            } else {
                $stmtBL->bind_param("i",$idVoyage);
            }

            $stmtBL->execute();
            $blList = $stmtBL->get_result()->fetch_all(MYSQLI_ASSOC);

            foreach($blList as &$bl){
                $stmtImg = $con->prepare("
                    SELECT id, nom_fichier, chemin_fichier, date_upload
                    FROM voyage_bl_image 
                    WHERE idVoyageBL=?
                ");
                $stmtImg->bind_param("i",$bl['idVoyageBL']);
                $stmtImg->execute();
                $bl['images'] = $stmtImg->get_result()->fetch_all(MYSQLI_ASSOC);
            }

            return $blList;
        }

        $page = isset($_GET['page']) ? max(1,intval($_GET['page'])) : 1;
        $perPage = 10;
        $offset = ($page - 1) * $perPage;

        $filters = [];
        $values = [];
        $types = '';

        if(isset($_GET['id'])) { $filters[] = "v.id=?"; $values[] = intval($_GET['id']); $types .= 'i'; }
        if(isset($_GET['idChauffeur'])) { $filters[] = "v.idChauffeur=?"; $values[] = intval($_GET['idChauffeur']); $types .= 'i'; }
        if(isset($_GET['idClient'])) { $filters[] = "d2.id_entreprise=?"; $values[] = intval($_GET['idClient']); $types .= 'i'; }
        if(isset($_GET['idDepot'])) { $filters[] = "v.depot_depart=?"; $values[] = intval($_GET['idDepot']); $types .= 'i'; }
        if(isset($_GET['idVehicule'])) { $filters[] = "v.idVehicule=?"; $values[] = intval($_GET['idVehicule']); $types .= 'i'; }

        if($userRole=="chauffeur"){
            $filters[] = "v.idChauffeur=?";
            $values[] = $userId;
            $types .= 'i';
        }

        // ?? RECHERCHE GLOBALE
			if(isset($_GET['codeQuery']) && !empty($_GET['codeQuery'])){
				$search = "%".strtolower($_GET['codeQuery'])."%";

				$filters[] = "(
					LOWER(d.nom) LIKE ? OR
					LOWER(CONCAT(u.nom,' ',u.prenom)) LIKE ? OR
					LOWER(ve.immatriculation) LIKE ? OR
					LOWER(mv.designation) LIKE ? OR
					LOWER(p.societe) LIKE ? OR
					LOWER(d2.id_document) LIKE ?
				)";

				for($i=0; $i<6; $i++){
					$values[] = $search;
					$types .= 's';
				}
			}

        $where = count($filters)>0 ? "WHERE ".implode(" AND ", $filters) : "";

        // COUNT
        $stmtCount = $con->prepare("
            SELECT COUNT(DISTINCT v.id) AS total
            FROM voyage v
            LEFT JOIN utilisateur u ON v.idChauffeur = u.id
            LEFT JOIN vue_depots d ON v.depot_depart = d.id
            LEFT JOIN vehicule ve ON v.idVehicule = ve.id
            LEFT JOIN marque_vehicule mv ON ve.idMarque = mv.id
            LEFT JOIN voyage_bl vb ON vb.idVoyage = v.id
            LEFT JOIN jbm.document d2 ON d2.id = vb.idBL
            LEFT JOIN jbm.partenaires p ON p.id = d2.id_entreprise
            $where
        ");

        if(!empty($values)) $stmtCount->bind_param($types, ...$values);
        $stmtCount->execute();

        $total = $stmtCount->get_result()->fetch_assoc()['total'];
        $totalPages = ceil($total / $perPage);

        // DATA
   $sql = "
    SELECT DISTINCT
        v.*,
        CONCAT(u.nom,' ',u.prenom) AS nomChauffeur,
        d.nom AS depot_nom,
        mv.designation AS vehicule_nom,
        ve.immatriculation AS vehicule_immatriculation,
        vi.designation AS ville_nom  -- <-- ici
    FROM voyage v
    LEFT JOIN utilisateur u ON v.idChauffeur = u.id
    LEFT JOIN vue_depots d ON v.depot_depart = d.id
    LEFT JOIN vehicule ve ON v.idVehicule = ve.id
    LEFT JOIN marque_vehicule mv ON ve.idMarque = mv.id
    LEFT JOIN voyage_bl vb ON vb.idVoyage = v.id
    LEFT JOIN jbm.document d2 ON d2.id = vb.idBL
    LEFT JOIN jbm.partenaires p ON p.id = d2.id_entreprise
    LEFT JOIN ville vi ON vi.id = v.idVille  -- <-- ici
    $where
    ORDER BY v.date_depart DESC
    LIMIT ? OFFSET ?
";

        $stmt = $con->prepare($sql);

        $valuesWithLimit = $values;
        $typesWithLimit = $types . 'ii';

        $valuesWithLimit[] = $perPage;
        $valuesWithLimit[] = $offset;

        $stmt->bind_param($typesWithLimit, ...$valuesWithLimit);
        $stmt->execute();

        $voyages = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        foreach($voyages as &$voyage){
            $voyage['bl_list'] = getBLList($con,$voyage['id'],$userRole,$userId);
        }

        $con->commit();

        send_response([
            "status" => true,
            "pagination" => [
                "page" => $page,
                "perPage" => $perPage,
                "total" => $total,
                "totalPages" => $totalPages
            ],
            "data" => $voyages
        ]);
    }

    // ==================== PUT ====================
if($method === 'PUT'){

    if(empty($data['id'])) throw new Exception("ID voyage requis");
    $idVoyage = intval($data['id']);

    // Champs modifiables
    $allowedFields = ['statut','idVehicule','depot_depart','date_depart','heure_depart','km_depart','km_retour','date_retour','idVille'];

    $setParts = []; $values = []; $types = '';

    foreach($allowedFields as $field){
        if(isset($data[$field])){
            $setParts[] = "$field=?";

            if(in_array($field,['idVehicule','depot_depart','km_depart','km_retour','idVille'])){ 
                $values[] = intval($data[$field]);
                $types .= 'i';
            } else {
                $values[] = $data[$field];
                $types .= 's';
            }
        }
    }

    if(!empty($setParts)){
        $values[] = $idVoyage;
        $types .= 'i';

        if($userRole=="chauffeur"){
            $sql = "UPDATE voyage SET ".implode(", ",$setParts)." WHERE id=? AND idChauffeur=?";
            $values[] = $userId;
            $types .= 'i';
        } else {
            $sql = "UPDATE voyage SET ".implode(", ",$setParts)." WHERE id=?";
        }

        $stmt = $con->prepare($sql);
        $stmt->bind_param($types, ...$values);
        $stmt->execute();
    }

    // --- Mise à jour des BL ---
    if(isset($data['bl_list']) && is_array($data['bl_list'])){
        // Supprimer les BL existants
        $stmtDel = $con->prepare("DELETE FROM voyage_bl WHERE idVoyage=?");
        $stmtDel->bind_param("i", $idVoyage);
        $stmtDel->execute();

        // Réinsérer la nouvelle liste
        $stmtBL = $con->prepare("INSERT INTO voyage_bl (idVoyage, idBL, statut) VALUES (?, ?, 'encours')");
        foreach($data['bl_list'] as $bl){
            if(!isset($bl['id'])) continue;
            $stmtBL->bind_param("ii", $idVoyage, $bl['id']);
            $stmtBL->execute();
        }
    }

    $con->commit();

    send_response([
        "status"=>true,
        "message"=>"Voyage mis à jour avec BL"
    ]);
}

    // ==================== DELETE ====================
    if($method === 'DELETE') {

        if(empty($data['id'])) throw new Exception("ID voyage requis");
        $idVoyage = intval($data['id']);

        if($userRole == "chauffeur"){
            $stmtCheck = $con->prepare("SELECT id FROM voyage WHERE id=? AND idChauffeur=?");
            $stmtCheck->bind_param("ii", $idVoyage, $userId);
            $stmtCheck->execute();
            $exists = $stmtCheck->get_result()->fetch_assoc();
            if(!$exists) throw new Exception("Accès refusé");
        }

        $stmtBL = $con->prepare("DELETE FROM voyage_bl WHERE idVoyage=?");
        $stmtBL->bind_param("i", $idVoyage);
        $stmtBL->execute();

        $stmtVoyage = $con->prepare("DELETE FROM voyage WHERE id=?");
        $stmtVoyage->bind_param("i", $idVoyage);
        $stmtVoyage->execute();

        $con->commit();

        send_response([
            "status" => true,
            "message" => "Voyage supprimé"
        ]);
    }

} catch(Exception $e){
    $con->rollback();
    send_response([
        "status"=>false,
        "message"=>$e->getMessage()
    ]);
}