<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

require "../config.php";
require "token.php";


function createToken($userId, $con) {
    $token = generateToken(32).time(); // 64 chars
    $dateNow = date("Y-m-d H:i:s");

    $stmt = $con->prepare("INSERT INTO utilisateur_token (idUser, date_demander_appel, token) VALUES (?, ?, ?)");
    if(!$stmt){
        return ["status"=>false,"message"=>"Prepare failed","error"=>$con->error];
    }
    $stmt->bind_param("iss", $userId, $dateNow, $token);
    $stmt->execute();

    return ["status"=>true,"token"=>$token];
}

// ?? STEP 1: Check APP Header First
checkAppHeader();


// ?? Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "status" => false,
        "message" => "Method not allowed"
    ]);
    exit;
}
// ?? Get JSON body from mobile
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode([
        "status" => false,
        "message" => "username and password required"
    ]);
    exit;
}

$username = $data['username'];
$password = md5($data['password']);


//  V rification utilisateur
$stmt = $con->prepare("SELECT id, login, mot_passe,CONCAT(prenom,' ', nom) name FROM utilisateur WHERE login = ? 
LIMIT 1
");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();



$user = $result->fetch_assoc();
$mot_passe = $user['mot_passe'];
if($mot_passe==$password){
			
	if($util->desactive==1)	{
		$json['erreur']='Compte d sactiv  !';
		    echo json_encode([
		        "status" => false,
		        "message" =>'Compte d sactiv  !'
		 ]);
		exit;
	}else{
		// ? LOGIN SUCCESS
		$tok = createToken($user['id'],$con);
		if(!$tok['status']){
			echo json_encode([
			"status" => false,
			"message" => "Token !!!",
			
		]);
		}else{
			echo json_encode([
				"status" => true,
				"message" => "Login successful",
				"data" =>[
					"user_id" => $user['id'],
					"name" => $user['name'],
					"token" => $tok['token'],
				]
				
			]);
		}
		
	}

}else{
	    echo json_encode([
        "status" => false,
        "message" =>"? mot de passe incorrect"
 ]);
    exit;
}