<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

require __DIR__ . "/../config.php";
require "../users/token.php";

// ------------------ VÃ©rification du token ------------------
$headers = getallheaders();
$token = isset($headers['auth_token']) ? $headers['auth_token'] : null;

if(empty($token)){
    echo json_encode(["status"=>false,"message"=>"Token manquant"]);
    exit;
}

$tokendata = checkToken($token, $con);
if(!$tokendata['status']){
    http_response_code(401);
    echo json_encode(["status"=>false,"message"=>$tokendata['code']]);
    exit;
}

$userId = $tokendata['idUser'];
$method = $_SERVER['REQUEST_METHOD'];

// Pour PUT/DELETE JSON
$input = file_get_contents("php://input");
$data = json_decode($input,true);
if(!$data) $data = [];

$con->begin_transaction();

try {

    // ==================== POST ====================
if($method === 'POST'){

    // Champs obligatoires (reclamation n'est plus obligatoire)
    $requiredFields = ['Bl_cachetet','reglement','retour_Mse','client_id'];
    foreach($requiredFields as $f){
        if(!isset($_POST[$f]) || trim($_POST[$f]) === ''){
            throw new Exception("Le champ '$f' est obligatoire.");
        }
    }

    // Statut par défaut
    $statut = 'envoyer';

    // Valeur reclamation par défaut si non fournie
    $reclamation = isset($_POST['reclamation']) ? $_POST['reclamation'] : '';

    // Insertion retour chauffeur
    $stmt = $con->prepare("
        INSERT INTO retour_chauffeur 
        (Bl_cachetet, reglement, retour_Mse, reclamation, statut, client_id, chauffeur_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    if(!$stmt){
        throw new Exception("Erreur lors de la préparation de la requête : " . $con->error);
    }

    $stmt->bind_param(
        "sssssii",
        $_POST['Bl_cachetet'],
        $_POST['reglement'],
        $_POST['retour_Mse'],
        $reclamation,       // reclamation facultatif
        $statut,            // statut par défaut "envoyer"
        $_POST['client_id'], // obligatoire
        $userId             // id du chauffeur connecté
    );
        $stmt->execute();
        $retourId = $stmt->insert_id;

        // Gestion images
$uploadedFiles = []; // pour stocker les chemins des fichiers uploadÃ©s

$uploadDir = __DIR__."/../../data/retour_chauffeur/".$retourId."/"; 
if(!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);


// -------------------- Upload via $_FILES --------------------
if(isset($_FILES['images']) && is_array($_FILES['images']['name'])){
    foreach($_FILES['images']['name'] as $key => $name){
        // nom unique
        $originalName = basename($name);

// Encoder le nom (espaces + caractères spéciaux)
$safeName = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $originalName);

$filename = time() . "_" . rand(1000,9999) . "_" . $safeName;
        $path = $uploadDir . $filename;

        if(move_uploaded_file($_FILES['images']['tmp_name'][$key], $path)){
            // chemin à stocker en DB (relatif)
            $dbPath = "data/retour_chauffeur/".$retourId."/".$filename;

            $stmtInsert = $con->prepare("INSERT INTO retour_chauffeur_image (idRetourChaufeur, nom_fichier, chemin_fichier, idCreate) VALUES (?, ?, ?, ?)");
            $stmtInsert->bind_param("issi", $retourId, $filename, $dbPath, $userId);
            $stmtInsert->execute();

            $uploadedFiles[] = $dbPath; // pour le retour éventuel
        }
    }
}

// -------------------- Upload via Base64 --------------------
elseif(isset($data['images_base64']) && is_array($data['images_base64'])){
    foreach($data['images_base64'] as $imgBase64){
        $imgData = base64_decode($imgBase64);
        if($imgData === false) continue;

        // nom unique
        $filename = time() . "_" . rand(1000,9999) . ".jpg";
        $path = $uploadDir . $filename;

        if(file_put_contents($path, $imgData) !== false){
            $dbPath = "data/retour_chauffeur/".$retourId."/".$filename;

            $stmtInsert = $con->prepare("INSERT INTO retour_chauffeur_image (idRetourChaufeur, nom_fichier, chemin_fichier, idCreate) VALUES (?, ?, ?, ?)");
            $stmtInsert->bind_param("issi", $retourId, $filename, $dbPath, $userId);
            $stmtInsert->execute();

            $uploadedFiles[] = $dbPath;
        }
    }
}
else {
    throw new Exception("Aucune image fournie");
}

        // RÃ©cup client
        $stmtClient = $con->prepare("SELECT societe AS client FROM jbm.partenaires WHERE id=?");
        $stmtClient->bind_param("i", $_POST['client_id']);
        $stmtClient->execute();
        $client = $stmtClient->get_result()->fetch_assoc();

        $con->commit();
        echo json_encode([
            "status"=>true,
            "message"=>"Retour chauffeur crÃ©Ã© avec succÃ¨s",
            "data"=>[
                "retour_id"=>$retourId,
                "client"=>$client['client']
            ]
        ]);
        exit;
    }


// ==================== GET ====================
if($method === 'GET'){

    // ================== PAGINATION ==================
    $page  = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $perPage = isset($_GET['perPage']) ? max(1, intval($_GET['perPage'])) : 10;
    $offset = ($page - 1) * $perPage;

    $filters = [];
    $params = [];
    $types = '';

    // ================== FILTERS ==================

    // Filtre par chauffeur_id
    if(isset($_GET['chauffeur_id']) && $_GET['chauffeur_id'] !== ''){
        $filters[] = "rc.chauffeur_id = ?";
        $params[] = intval($_GET['chauffeur_id']);
        $types .= 'i';
    }

    // Filtre par client_id
    if(isset($_GET['client_id']) && $_GET['client_id'] !== ''){
        $filters[] = "rc.client_id = ?";
        $params[] = intval($_GET['client_id']);
        $types .= 'i';
    }

    // Filtre par id
    if(isset($_GET['id']) && $_GET['id'] !== ''){
        $filters[] = "rc.id = ?";
        $params[] = intval($_GET['id']);
        $types .= 'i';
    }

    // ================== COUNT ==================
    $countSql = "SELECT COUNT(*) as total
                 FROM retour_chauffeur rc
                 LEFT JOIN jbm.partenaires p ON p.id = rc.client_id
                 LEFT JOIN utilisateur u ON u.id = rc.chauffeur_id";

    if(!empty($filters)){
        $countSql .= " WHERE " . implode(" AND ", $filters);
    }

    $stmtCount = $con->prepare($countSql);

    if(!empty($params)){
        $refs = [];
        foreach($params as $k => $v){
            $refs[$k] = &$params[$k];
        }
        array_unshift($refs, $types);
        call_user_func_array([$stmtCount, 'bind_param'], $refs);
    }

    $stmtCount->execute();
    $total = $stmtCount->get_result()->fetch_assoc()['total'];

    // ================== MAIN QUERY ==================
    $sql = "SELECT 
        rc.id, 
        rc.Bl_cachetet, 
        rc.reglement, 
        rc.retour_Mse, 
        rc.reclamation, 
        rc.statut, 
        rc.client_id, 
        rc.chauffeur_id,
        rc.date,
        rc.commentaire,
        p.societe AS client,
        CONCAT(u.nom,' ',u.prenom) AS nomChauffeur
    FROM retour_chauffeur rc
    LEFT JOIN jbm.partenaires p ON p.id = rc.client_id
    LEFT JOIN utilisateur u ON u.id = rc.chauffeur_id";

    if(!empty($filters)){
        $sql .= " WHERE " . implode(" AND ", $filters);
    }

    $sql .= " ORDER BY 
        CASE 
            WHEN rc.statut = 'envoyer' THEN 1
            ELSE 2
        END,
        rc.date DESC
        LIMIT ? OFFSET ?";

    // ================== PARAMS ==================
    $types2 = $types . "ii";
    $params2 = $params;
    $params2[] = $perPage;
    $params2[] = $offset;

    // ================== PREPARE ==================
    $stmt = $con->prepare($sql);

    if(!$stmt){
        echo json_encode([
            "status" => false,
            "message" => "Erreur SQL",
            "error" => $con->error
        ]);
        exit;
    }

    // ================== BIND ==================
    $refs = [];
    foreach($params2 as $key => $val){
        $refs[$key] = &$params2[$key];
    }
    array_unshift($refs, $types2);
    call_user_func_array([$stmt, 'bind_param'], $refs);

    // ================== EXECUTE ==================
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];

    while($row = $result->fetch_assoc()){

        $id = (int)$row['id'];

        // ================== IMAGES ==================
        $images = [];

        $imgSql = "SELECT id, nom_fichier, chemin_fichier, date_upload 
                   FROM retour_chauffeur_image 
                   WHERE idRetourChaufeur = ?";

        $imgStmt = $con->prepare($imgSql);

        if($imgStmt){
            $imgStmt->bind_param("i", $id);
            $imgStmt->execute();
            $imgResult = $imgStmt->get_result();

            while($img = $imgResult->fetch_assoc()){
                $images[] = $img;
            }

            $imgStmt->close();

        }

        $row['images'] = $images;
        $data[] = $row;
    }

    // ================== RESPONSE ==================
    echo json_encode([
        "status" => true,
        "pagination" => [
            "page" => $page,
            "perPage" => $perPage,
            "total" => intval($total),
            "totalPages" => ceil($total / $perPage)
        ],
        "data" => $data
    ]);

    exit;
}
    // ==================== PUT ====================
if($method === 'PUT') {
    if(!isset($data['id'])) throw new Exception("ID retour requis");
    $id = intval($data['id']);

    // Vérifier si l'utilisateur peut valider le retour
    $stmtCheck = $con->prepare("SELECT ValidationRetourChauffeur FROM utilisateur WHERE id=?");
    $stmtCheck->bind_param("i", $userId);
    $stmtCheck->execute();
    $resCheck = $stmtCheck->get_result();
    if($resCheck->num_rows === 0) throw new Exception("Utilisateur introuvable");
    $user = $resCheck->fetch_assoc();
    $canValidate = ($user['ValidationRetourChauffeur'] === 'Oui');

    // Champs à mettre à jour
    $fields = ['Bl_cachetet','reglement','retour_Mse','reclamation'];
    if($canValidate) {
        $fields[] = 'statut';      // autorisé si validation = Oui
        $fields[] = 'commentaire'; // autorisé si validation = Oui
    }

    $set = []; $types=''; $values=[];
    foreach($fields as $f) {
        if(isset($data[$f])) {
            $set[] = "$f=?";
            $types .= 's';
            $values[] = $data[$f];
        }
    }

    if(empty($set)) throw new Exception("Aucun champ à modifier");

    $sql = "UPDATE retour_chauffeur SET ".implode(", ", $set)." WHERE id=?";
    $types .= 'i';
    $values[] = $id;

    $stmt = $con->prepare($sql);
    if(!$stmt) throw new Exception("Erreur préparation SQL : ".$con->error);

    // bind_param dynamique avec références
    $refs = [];
    foreach($values as $key => $val) $refs[$key] = &$values[$key];
    array_unshift($refs, $types);
    call_user_func_array([$stmt, 'bind_param'], $refs);
    $stmt->execute();

        $con->commit();
        echo json_encode(["status"=>true,"message"=>"Retour chauffeur mis Ã  jour"]);
        exit;
    }

    // ==================== DELETE ====================
if($method === 'DELETE'){
    // Lire l'ID depuis URL ou body JSON
    if(isset($_GET['id'])){
        $id = intval($_GET['id']);
    } elseif(isset($data['id'])){
        $id = intval($data['id']);
    } else {
        throw new Exception("ID retour requis");
    }

    // VÃ©rifier si l'ID existe
    $stmtCheck = $con->prepare("SELECT id FROM retour_chauffeur WHERE id=?");
    $stmtCheck->bind_param("i",$id);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();
    if($resultCheck->num_rows === 0){
        throw new Exception("ID retour non trouvÃ©");
    }

    // Supprimer les images
    $stmtImg = $con->prepare("DELETE FROM retour_chauffeur_image WHERE idRetourChaufeur=?");
    $stmtImg->bind_param("i",$id);
    $stmtImg->execute();

    // Supprimer le retour
    $stmt = $con->prepare("DELETE FROM retour_chauffeur WHERE id=?");
    $stmt->bind_param("i",$id);
    $stmt->execute();

    $con->commit();
    echo json_encode(["status"=>true,"message"=>"Retour chauffeur supprimÃ© avec succÃ¨s"]);
    exit;
}

} catch(Exception $e){
    $con->rollback();
    echo json_encode(["status"=>false,"message"=>$e->getMessage()]);
}