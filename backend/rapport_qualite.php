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

// INPUT JSON
$input = file_get_contents("php://input");
$data = json_decode($input,true);
if(!$data) $data = [];

$con->begin_transaction();

try {


// ==================== POST ====================
if($method === 'POST'){

    $requiredFields = ['dum','dossier','commentaire'];
    foreach($requiredFields as $f){
        if(!isset($_POST[$f]) || trim($_POST[$f]) === ''){
            throw new Exception("Le champ '$f' est obligatoire.");
        }
    }

    // INSERT RAPPORT
    $stmt = $con->prepare("
        INSERT INTO rapport_qualite 
        (dum, dossier, commentaire, user_id, idCreate, dateCreate) 
        VALUES (?, ?, ?, ?, ?, NOW())
    ");

    $stmt->bind_param(
        "sssii",
        $_POST['dum'],
        $_POST['dossier'],
        $_POST['commentaire'],
        $userId,
        $userId
    );

    $stmt->execute();
    $rapportId = $stmt->insert_id;

    // DOSSIER UPLOAD
    $uploadDir = __DIR__."/../../data/rapport_qualite/".$rapportId."/";
    if(!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    $uploadedFiles = [];

    // ===== FILES =====
    if(isset($_FILES['images']) && is_array($_FILES['images']['name'])){
        foreach($_FILES['images']['name'] as $key => $name){

            $safeName = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', basename($name));
            $filename = time()."_".rand(1000,9999)."_".$safeName;
            $path = $uploadDir.$filename;

            if(move_uploaded_file($_FILES['images']['tmp_name'][$key], $path)){

                $dbPath = "data/rapport_qualite/".$rapportId."/".$filename;

                $stmtImg = $con->prepare("
                    INSERT INTO rapport_qualite_image 
                    (idRapportQualite, nom_fichier, chemin_fichier, idCreate) 
                    VALUES (?, ?, ?, ?)
                ");

                $stmtImg->bind_param("issi", $rapportId, $filename, $dbPath, $userId);
                $stmtImg->execute();

                $uploadedFiles[] = $dbPath;
            }
        }
    }

    // ===== BASE64 =====
    elseif(isset($data['images_base64']) && is_array($data['images_base64'])){
        foreach($data['images_base64'] as $imgBase64){

            $imgData = base64_decode($imgBase64);
            if($imgData === false) continue;

            $filename = time()."_".rand(1000,9999).".jpg";
            $path = $uploadDir.$filename;

            if(file_put_contents($path, $imgData) !== false){

                $dbPath = "data/rapport_qualite/".$rapportId."/".$filename;

                $stmtImg = $con->prepare("
                    INSERT INTO rapport_qualite_image 
                    (idRapportQualite, nom_fichier, chemin_fichier, idCreate) 
                    VALUES (?, ?, ?, ?)
                ");

                $stmtImg->bind_param("issi", $rapportId, $filename, $dbPath, $userId);
                $stmtImg->execute();

                $uploadedFiles[] = $dbPath;
            }
        }
    }

    else{
        throw new Exception("Aucune image fournie");
    }

    $con->commit();

    echo json_encode([
        "status"=>true,
        "message"=>"Rapport qualité créé",
        "data"=>[
            "id"=>$rapportId,
            "images"=>$uploadedFiles
        ]
    ]);
    exit;
}


// ==================== GET ====================
if($method === 'GET'){

    $page  = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $perPage = isset($_GET['perPage']) ? max(1, intval($_GET['perPage'])) : 10;
    $offset = ($page - 1) * $perPage;

    $filters = [];
    $params = [];
    $types = '';

    if(isset($_GET['id'])){
        $filters[] = "rq.id=?";
        $params[] = intval($_GET['id']);
        $types .= 'i';
    }

    if(isset($_GET['user_id'])){
        $filters[] = "rq.user_id=?";
        $params[] = intval($_GET['user_id']);
        $types .= 'i';
    }

    // ✅ SEARCH GLOBAL (dum + dossier + commentaire)
    if(isset($_GET['search']) && $_GET['search'] !== ''){
        $filters[] = "(rq.dum LIKE ? OR rq.dossier LIKE ? OR rq.commentaire LIKE ?)";
        $search = "%".$_GET['search']."%";
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
        $types .= 'sss';
    }

    // COUNT
    $countSql = "SELECT COUNT(*) as total FROM rapport_qualite rq";
    if($filters) $countSql .= " WHERE ".implode(" AND ", $filters);

    $stmtCount = $con->prepare($countSql);
    if($params){
        $refs=[]; foreach($params as $k=>$v) $refs[$k]=&$params[$k];
        array_unshift($refs,$types);
        call_user_func_array([$stmtCount,'bind_param'],$refs);
    }
    $stmtCount->execute();
    $total = $stmtCount->get_result()->fetch_assoc()['total'];

    // MAIN
    $sql = "SELECT * FROM rapport_qualite rq";
    if($filters) $sql .= " WHERE ".implode(" AND ", $filters);
    $sql .= " ORDER BY rq.id DESC LIMIT ? OFFSET ?";

    $types2 = $types."ii";
    $params2 = $params;
    $params2[] = $perPage;
    $params2[] = $offset;

    $stmt = $con->prepare($sql);

    $refs=[]; foreach($params2 as $k=>$v) $refs[$k]=&$params2[$k];
    array_unshift($refs,$types2);
    call_user_func_array([$stmt,'bind_param'],$refs);

    $stmt->execute();
    $result = $stmt->get_result();

    $dataOut = [];

    while($row = $result->fetch_assoc()){

        $images = [];
        $stmtImg = $con->prepare("
            SELECT * FROM rapport_qualite_image WHERE idRapportQualite=?
        ");
        $stmtImg->bind_param("i",$row['id']);
        $stmtImg->execute();
        $resImg = $stmtImg->get_result();

        while($img = $resImg->fetch_assoc()){
            $images[] = $img;
        }

        $row['images'] = $images;
        $dataOut[] = $row;
    }

    echo json_encode([
        "status"=>true,
        "pagination"=>[
            "page"=>$page,
            "perPage"=>$perPage,
            "total"=>$total,
            "totalPages"=>ceil($total/$perPage)
        ],
        "data"=>$dataOut
    ]);
    exit;
}


// ==================== PUT ====================
if($method === 'PUT'){

    $id = null;

    if(isset($_POST['id'])){
        $id = $_POST['id'];
    }elseif(isset($data['id'])){
        $id = $data['id'];
    }

    if(!$id) throw new Exception("ID requis");
    $id = intval($id);

    $fields = ['dum','dossier','commentaire'];

    $set=[]; $types=''; $values=[];

    foreach($fields as $f){

        $value = null;

        if(isset($_POST[$f])){
            $value = $_POST[$f];
        }elseif(isset($data[$f])){
            $value = $data[$f];
        }

        if($value !== null){
            $set[]="$f=?";
            $types.='s';
            $values[]=$value;
        }
    }

    if(!empty($set)){
        $sql="UPDATE rapport_qualite SET ".implode(",",$set).", idModif=?, dateModif=NOW() WHERE id=?";
        $types.="ii";
        $values[]=$userId;
        $values[]=$id;

        $stmt=$con->prepare($sql);

        $refs=[]; foreach($values as $k=>$v) $refs[$k]=&$values[$k];
        array_unshift($refs,$types);
        call_user_func_array([$stmt,'bind_param'],$refs);

        $stmt->execute();
    }

    $con->commit();

    echo json_encode([
        "status"=>true,
        "message"=>"Rapport modifié"
    ]);
    exit;
}


// ==================== DELETE ====================
if($method === 'DELETE'){

    $id = isset($_GET['id']) ? intval($_GET['id']) : intval($data['id']);

    $stmtImg = $con->prepare("DELETE FROM rapport_qualite_image WHERE idRapportQualite=?");
    $stmtImg->bind_param("i",$id);
    $stmtImg->execute();

    $stmt = $con->prepare("DELETE FROM rapport_qualite WHERE id=?");
    $stmt->bind_param("i",$id);
    $stmt->execute();

    $con->commit();

    echo json_encode(["status"=>true,"message"=>"Rapport supprimé"]);
    exit;
}

} catch(Exception $e){
    $con->rollback();
    echo json_encode(["status"=>false,"message"=>$e->getMessage()]);
}