<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT");

require __DIR__ . "/../config.php";
require "../users/token.php";
require __DIR__ . "/../functions.php";

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$con->set_charset("utf8mb4");

// ==================== Vérification TOKEN ====================
$headers = checkAppHeader();
$token = isset($headers['auth_token']) ? $headers['auth_token'] : null;

if(empty($token)){
    http_response_code(401);
    echo json_encode(["status"=>false,"message"=>"Token manquant"]);
    exit;
}

$stmtToken = $con->prepare("SELECT idUser FROM utilisateur_token WHERE token=? LIMIT 1");
$stmtToken->bind_param("s",$token);
$stmtToken->execute();
$resToken = $stmtToken->get_result()->fetch_assoc();

if(!$resToken){
    http_response_code(401);
    echo json_encode(["status"=>false,"message"=>"Token invalide"]);
    exit;
}

$user_id = $resToken['idUser'];
$method = get_method();
$data = get_request_data();

try {

    // ======================================================
    // ======================== GET =========================
    // ======================================================
    if($method === "GET") {

        $page = isset($_GET['page']) ? max(intval($_GET['page']),1) : 1;
        $perPage = isset($_GET['perPage']) ? max(intval($_GET['perPage']),10) : 10;
        $offset = ($page-1) * $perPage;

        $stmtTotal = $con->prepare("SELECT COUNT(*) as total FROM voyage WHERE idChauffeur=?");
        $stmtTotal->bind_param("i",$user_id);
        $stmtTotal->execute();
        $total = $stmtTotal->get_result()->fetch_assoc()['total'];

        $stmt = $con->prepare("
            SELECT *
            FROM voyage
            WHERE idChauffeur=?
            ORDER BY date_depart DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bind_param("iii",$user_id,$perPage,$offset);
        $stmt->execute();
        $voyages = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        foreach($voyages as &$voyage){
            $idVoyage = $voyage['id'];

            $stmtBL = $con->prepare("
                SELECT vb.id, vb.idBL, p.societe AS nomClient, d.datetime_document, vb.statut, vb.coordinates
                FROM voyage_bl vb
                JOIN jbm.document d ON d.id = vb.idBL
                JOIN jbm.partenaires p ON p.id = d.id_entreprise
                WHERE vb.idVoyage=?
            ");
            $stmtBL->bind_param("i",$idVoyage);
            $stmtBL->execute();
            $bl_list = $stmtBL->get_result()->fetch_all(MYSQLI_ASSOC);

            foreach($bl_list as &$bl){
                $stmtImg = $con->prepare("SELECT nom_fichier, chemin_fichier FROM voyage_bl_image WHERE idVoyageBL=?");
                $stmtImg->bind_param("i",$bl['id']);
                $stmtImg->execute();
                $bl['images'] = $stmtImg->get_result()->fetch_all(MYSQLI_ASSOC);

                // ✅ Decode coordinates si exist
                if(!empty($bl['coordinates'])){
                    $bl['coordinates'] = json_decode(stripslashes($bl['coordinates']), true);
                }
            }

            $voyage['bl_list'] = $bl_list;
        }

        echo json_encode([
            "status"=>true,
            "data"=>$voyages,
            "pagination"=>[
                "page"=>$page,
                "perPage"=>$perPage,
                "total"=>intval($total),
                "totalPages"=>ceil($total/$perPage)
            ]
        ]);
    }

    // ======================================================
    // ======================== POST ========================
    // ======================================================
    elseif($method === "POST") {

        if(!isset($data['idBL']) || !isset($data['idVoyage']))
            throw new Exception("idBL ou idVoyage manquant");

        $idBL = intval($data['idBL']);
        $idVoyage = intval($data['idVoyage']);

        $stmt = $con->prepare("
            SELECT vb.id AS idVoyageBL
            FROM voyage_bl vb
            JOIN voyage v ON v.id = vb.idVoyage
            WHERE vb.idBL=? AND vb.idVoyage=? AND v.idChauffeur=?
        ");
        $stmt->bind_param("iii", $idBL, $idVoyage, $user_id);
        $stmt->execute();
        $res = $stmt->get_result()->fetch_assoc();

        if(!$res)
            throw new Exception("BL non trouvé dans ce voyage ou non autorisé");

        $idVoyageBL = $res['idVoyageBL'];
        $uploadDir = __DIR__ . "/../../data/voyage/".$idVoyage."/";
        if(!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);

        $uploadedFiles = [];

        // Upload images
        if(isset($_FILES['images']) && is_array($_FILES['images']['name'])){
            $allowed = ['jpg','jpeg','png','webp'];
            foreach($_FILES['images']['name'] as $key => $name){
                $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
                if(!in_array($ext,$allowed)) continue;

                $filename = time() . "_" . rand(1000,9999) . "." . $ext;
                $path = $uploadDir.$filename;

                if(move_uploaded_file($_FILES['images']['tmp_name'][$key], $path)){
                    $dbPath = "data/voyage/".$idVoyage."/".$filename;
                    $stmtInsert = $con->prepare("INSERT INTO voyage_bl_image (idVoyageBL, nom_fichier, chemin_fichier) VALUES (?,?,?)");
                    $stmtInsert->bind_param("iss",$idVoyageBL,$filename,$dbPath);
                    $stmtInsert->execute();
                    $uploadedFiles[] = $dbPath;
                }
            }
        }
        // Upload Base64
        elseif(isset($data['images_base64']) && is_array($data['images_base64'])){
            foreach($data['images_base64'] as $imgBase64){
                $imgData = base64_decode($imgBase64);
                if($imgData === false) continue;

                $filename = time() . "_" . rand(1000,9999) . ".jpg";
                $path = $uploadDir.$filename;
                if(file_put_contents($path,$imgData) !== false){
                    $dbPath = "data/voyage/".$idVoyage."/".$filename;
                    $stmtInsert = $con->prepare("INSERT INTO voyage_bl_image (idVoyageBL, nom_fichier, chemin_fichier) VALUES (?,?,?)");
                    $stmtInsert->bind_param("iss",$idVoyageBL,$filename,$dbPath);
                    $stmtInsert->execute();
                    $uploadedFiles[] = $dbPath;
                }
            }
        }
        else throw new Exception("Aucune image fournie");

        // ✅ Store coordinates string échappée telle quelle et nettoyer antislashs
        if(isset($data['coordinates'])){
            $coordinates = stripslashes($data['coordinates']);
            $stmtCoord = $con->prepare("UPDATE voyage_bl SET coordinates=? WHERE id=?");
            $stmtCoord->bind_param("si",$coordinates,$idVoyageBL);
            $stmtCoord->execute();
        }

        // Update statut
        $statut = isset($data['statut']) ? $data['statut'] : "Livré";
        $stmtUpdate = $con->prepare("UPDATE voyage_bl SET statut=? WHERE id=?");
        $stmtUpdate->bind_param("si",$statut,$idVoyageBL);
        $stmtUpdate->execute();

        echo json_encode([
            "status"=>true,
            "message"=>"Images ajoutées et BL mis à jour",
            "uploaded"=>$uploadedFiles,
            "statut"=>$statut
        ]);
    }

    // ======================================================
    // ======================== PUT =========================
    // ======================================================
    elseif($method === "PUT") {

        if(isset($data['idBL'])) {

            $idBL = intval($data['idBL']);
            $statut = isset($data['statut']) ? $data['statut'] : "Livré";

            $stmt = $con->prepare("SELECT vb.id AS idVoyageBL, v.idChauffeur, vb.idVoyage FROM voyage_bl vb JOIN voyage v ON v.id = vb.idVoyage WHERE vb.idBL=?");
            $stmt->bind_param("i",$idBL);
            $stmt->execute();
            $res = $stmt->get_result()->fetch_assoc();

            if(!$res) throw new Exception("BL introuvable");
            if($res['idChauffeur'] != $user_id) throw new Exception("BL non autorisé");

            $idVoyageBL = $res['idVoyageBL'];
            $idVoyage = $res['idVoyage'];

            $uploadedFiles = [];
            $uploadDir = __DIR__ . "/../../data/voyage/".$idVoyage."/";
            if(!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);

            // Upload images
            if(isset($_FILES['images']) && is_array($_FILES['images']['name'])){
                $allowed = ['jpg','jpeg','png','webp'];
                foreach($_FILES['images']['name'] as $key => $name){
                    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
                    if(!in_array($ext,$allowed)) continue;

                    $filename = time() . "_" . rand(1000,9999) . "." . $ext;
                    $path = $uploadDir.$filename;

                    if(move_uploaded_file($_FILES['images']['tmp_name'][$key], $path)){
                        $dbPath = "data/voyage/".$idVoyage."/".$filename;
                        $stmtInsert = $con->prepare("INSERT INTO voyage_bl_image (idVoyageBL, nom_fichier, chemin_fichier) VALUES (?,?,?)");
                        $stmtInsert->bind_param("iss",$idVoyageBL,$filename,$dbPath);
                        $stmtInsert->execute();
                        $uploadedFiles[] = $dbPath;
                    }
                }
            } elseif(isset($data['images_base64']) && is_array($data['images_base64'])){
                foreach($data['images_base64'] as $imgBase64){
                    $imgData = base64_decode($imgBase64);
                    if($imgData === false) continue;

                    $filename = time() . "_" . rand(1000,9999) . ".jpg";
                    $path = $uploadDir.$filename;
                    if(file_put_contents($path,$imgData) !== false){
                        $dbPath = "data/voyage/".$idVoyage."/".$filename;
                        $stmtInsert = $con->prepare("INSERT INTO voyage_bl_image (idVoyageBL, nom_fichier, chemin_fichier) VALUES (?,?,?)");
                        $stmtInsert->bind_param("iss",$idVoyageBL,$filename,$dbPath);
                        $stmtInsert->execute();
                        $uploadedFiles[] = $dbPath;
                    }
                }
            }

            // ✅ Store coordinates string échappée telle quelle et nettoyer antislashs
            if(isset($data['coordinates'])){
                $coordinates = stripslashes($data['coordinates']);
                $stmtCoord = $con->prepare("UPDATE voyage_bl SET coordinates=? WHERE id=?");
                $stmtCoord->bind_param("si",$coordinates,$idVoyageBL);
                $stmtCoord->execute();
            }

            // Update statut
            $stmtUpdate = $con->prepare("UPDATE voyage_bl SET statut=? WHERE id=?");
            $stmtUpdate->bind_param("si",$statut,$idVoyageBL);
            $stmtUpdate->execute();

            echo json_encode([
                "status"=>true,
                "message"=>"BL mis à jour",
                "statut"=>$statut,
                "uploaded"=>$uploadedFiles
            ]);

        } elseif(isset($data['idVoyage'])) {

            $idVoyage = intval($data['idVoyage']);
            $statut = isset($data['statut']) ? $data['statut'] : "Livré";

            $stmt = $con->prepare("SELECT idChauffeur FROM voyage WHERE id=?");
            $stmt->bind_param("i",$idVoyage);
            $stmt->execute();
            $res = $stmt->get_result()->fetch_assoc();

            if(!$res) throw new Exception("Voyage introuvable");
            if($res['idChauffeur'] != $user_id) throw new Exception("Voyage non autorisé");

            $stmtUpdate = $con->prepare("UPDATE voyage_bl SET statut=? WHERE idVoyage=?");
            $stmtUpdate->bind_param("si",$statut,$idVoyage);
            $stmtUpdate->execute();

            echo json_encode(["status"=>true,"message"=>"Tous les BL du voyage mis à jour","statut"=>$statut]);

        } else throw new Exception("idBL ou idVoyage manquant");
    } else{
        http_response_code(403);
        echo json_encode(["status"=>false,"message"=>"Action non autorisée"]);
    }

} catch(Exception $e){
    http_response_code(500);
    echo json_encode(["status"=>false,"message"=>$e->getMessage()]);
}