<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

require __DIR__ . "/../config.php";
require "../users/token.php";

// ---------------- TOKEN ----------------
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

$input = file_get_contents("php://input");
$data = json_decode($input,true);
if(!$data) $data = [];

$con->begin_transaction();

try {

/* ====================== POST ====================== */
if($method === 'POST'){

    // Projet obligatoire
    $required = ['projet'];
    foreach($required as $f){
        if(!isset($_POST[$f]) || trim($_POST[$f]) === ''){
            throw new Exception("Le champ '$f' est obligatoire");
        }
    }

    if(!isset($_POST['localisation'])){
        throw new Exception("Localisation requise");
    }

    $localisation = $_POST['localisation'];
    $commentaire = isset($_POST['commentaire']) ? $_POST['commentaire'] : '';

    // Contact optionnel : remplacer null par '' pour bind_param
    $contact_nom = isset($_POST['contact_nom']) && trim($_POST['contact_nom']) !== '' ? $_POST['contact_nom'] : '';
    $contact_telephone = isset($_POST['contact_telephone']) && trim($_POST['contact_telephone']) !== '' ? $_POST['contact_telephone'] : '';

    // idCreate dynamique (par défaut user connecté)
    $idCreate = (isset($_POST['idCreate']) && trim($_POST['idCreate']) !== '') ? intval($_POST['idCreate']) : $userId;

    // Vérifier utilisateur
    $checkUser = $con->prepare("SELECT id FROM utilisateur WHERE id=?");
    $checkUser->bind_param("i", $idCreate);
    $checkUser->execute();
    if($checkUser->get_result()->num_rows === 0){
        throw new Exception("Utilisateur idCreate invalide");
    }

    // INSERT PROJET
    $stmt = $con->prepare("
        INSERT INTO projet 
        (projet, localisation, commentaire, contact_nom, contact_telephone, idCreate)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    if(!$stmt) throw new Exception($con->error);

    $stmt->bind_param(
        "sssssi",
        $_POST['projet'],
        $localisation,
        $commentaire,
        $contact_nom,
        $contact_telephone,
        $idCreate
    );

    $stmt->execute();

    // Vérifier que l'insertion a marché
    if($stmt->affected_rows === 0){
        throw new Exception("Erreur lors de l'insertion du projet : ".$stmt->error);
    }

    // Récupérer l'ID du projet créé
    $projetId = $stmt->insert_id;

    // Créer dossier pour le projet
    $uploadDir = __DIR__."/../../data/projet/".$projetId."/";
    if(!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    $uploaded = [];

    // ---------- FILES ----------
    if(isset($_FILES['images']) && is_array($_FILES['images']['name'])){
        foreach($_FILES['images']['name'] as $k=>$name){

            $safeName = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', basename($name));
            $filename = time().'_'.rand(1000,9999).'_'.$safeName;
            $path = $uploadDir.$filename;

            if(move_uploaded_file($_FILES['images']['tmp_name'][$k], $path)){

                $dbPath = "data/projet/".$projetId."/".$filename;

                $stmtImg = $con->prepare("
                    INSERT INTO projet_image (idProjet, nom_fichier, chemin_fichier)
                    VALUES (?, ?, ?)
                ");
                if(!$stmtImg) throw new Exception($con->error);

                $stmtImg->bind_param("iss", $projetId, $filename, $dbPath);
                $stmtImg->execute();

                $uploaded[] = $dbPath;
            }
        }
    }

    // ---------- BASE64 ----------
    elseif(isset($data['images_base64']) && is_array($data['images_base64'])){
        foreach($data['images_base64'] as $img){

            $imgData = base64_decode($img);
            if(!$imgData) continue;

            $filename = time().'_'.rand(1000,9999).'.jpg';
            $path = $uploadDir.$filename;

            if(file_put_contents($path, $imgData)){
                $dbPath = "data/projet/".$projetId."/".$filename;

                $stmtImg = $con->prepare("
                    INSERT INTO projet_image (idProjet, nom_fichier, chemin_fichier)
                    VALUES (?, ?, ?)
                ");
                if(!$stmtImg) throw new Exception($con->error);

                $stmtImg->bind_param("iss", $projetId, $filename, $dbPath);
                $stmtImg->execute();

                $uploaded[] = $dbPath;
            }
        }
    }

    $con->commit();

    // Retour JSON
    echo json_encode([
        "status"=>true,
        "message"=>"Projet créé avec succès",
        "data"=>[
            "id"=>$projetId,
            "idCreate"=>$idCreate,
            "images"=>$uploaded
        ]
    ]);
    exit;
}

/* ====================== GET ====================== */
if($method === 'GET'){

    $page  = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 10;
    $offset = ($page - 1) * $limit;

    $filters = [];
    $params = [];
    $types = '';

    if(isset($_GET['id'])){
        $filters[] = "p.id=?";
        $params[] = intval($_GET['id']);
        $types .= 'i';
    }

    if(isset($_GET['idCreate'])){
        $filters[] = "p.idCreate=?";
        $params[] = intval($_GET['idCreate']);
        $types .= 'i';
    }

    // COUNT
    $countSql = "SELECT COUNT(*) as total FROM projet p";
    if(!empty($filters)){
        $countSql .= " WHERE " . implode(" AND ", $filters);
    }

    $stmtCount = $con->prepare($countSql);

    if(!empty($params)){
        $refs = [];
        foreach($params as $k=>$v) $refs[$k] = &$params[$k];
        array_unshift($refs,$types);
        call_user_func_array([$stmtCount,'bind_param'],$refs);
    }

    $stmtCount->execute();
    $total = $stmtCount->get_result()->fetch_assoc()['total'];

    // DATA
    $sql = "SELECT p.*, CONCAT(u.nom,' ',u.prenom) as createur 
            FROM projet p
            LEFT JOIN utilisateur u ON u.id = p.idCreate";

    if(!empty($filters)){
        $sql .= " WHERE " . implode(" AND ", $filters);
    }

    $sql .= " ORDER BY p.id DESC LIMIT ? OFFSET ?";
    $types2 = $types . "ii";
    $params2 = $params;
    $params2[] = $limit;
    $params2[] = $offset;

    $stmt = $con->prepare($sql);

    $refs = [];
    foreach($params2 as $k=>$v) $refs[$k] = &$params2[$k];
    array_unshift($refs,$types2);
    call_user_func_array([$stmt,'bind_param'],$refs);

    $stmt->execute();
    $res = $stmt->get_result();

    $dataRes = [];

    while($row = $res->fetch_assoc()){

        $id = $row['id'];

        $imgs = [];
        $imgStmt = $con->prepare("SELECT * FROM projet_image WHERE idProjet=?");
        $imgStmt->bind_param("i",$id);
        $imgStmt->execute();
        $imgRes = $imgStmt->get_result();

        while($img = $imgRes->fetch_assoc()){
            $imgs[] = $img;
        }

        $row['images'] = $imgs;
        $dataRes[] = $row;
    }

 echo json_encode([
    "status" => true,
    "pagination" => [
        "page" => $page,
        "perPage" => $limit,
        "total" => intval($total),
        "totalPages" => ceil($total / $limit)
    ],
    "data" => $dataRes
]);

    exit;
}


/* ====================== PUT ====================== */
if($method === 'PUT'){

    if(!isset($data['id'])) throw new Exception("ID requis");

    $id = intval($data['id']);

    $fields = ['projet','localisation','commentaire','contact_nom','contact_telephone'];

    $set = [];
    $values = [];
    $types = "";

    foreach($fields as $f){
        if(isset($data[$f])){
            $set[] = "$f=?";
            $values[] = $data[$f];
            $types .= "s";
        }
    }

    if(empty($set)) throw new Exception("Aucun champ à modifier");

    $sql = "UPDATE projet SET ".implode(",",$set)." WHERE id=?";
    $types .= "i";
    $values[] = $id;

    $stmt = $con->prepare($sql);

    $refs = [];
    foreach($values as $k=>$v) $refs[$k] = &$values[$k];
    array_unshift($refs,$types);

    call_user_func_array([$stmt,'bind_param'],$refs);
    $stmt->execute();

    $con->commit();
    echo json_encode(["status"=>true,"message"=>"Projet modifié"]);
    exit;
}


/* ====================== DELETE ====================== */
if($method === 'DELETE'){

    if(isset($_GET['id'])){
        $id = intval($_GET['id']);
    } elseif(isset($data['id'])){
        $id = intval($data['id']);
    } else {
        throw new Exception("ID requis");
    }

    $stmt = $con->prepare("DELETE FROM projet_image WHERE idProjet=?");
    $stmt->bind_param("i",$id);
    $stmt->execute();

    $stmt = $con->prepare("DELETE FROM projet WHERE id=?");
    $stmt->bind_param("i",$id);
    $stmt->execute();

    $con->commit();
    echo json_encode(["status"=>true,"message"=>"Projet supprimé"]);
    exit;
}

} catch(Exception $e){
    $con->rollback();
    echo json_encode([
        "status"=>false,
        "message"=>$e->getMessage()
    ]);
}