<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->username) && !empty($data->password)) {
        // Check if username already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$data->username]);
        if ($stmt->rowCount() > 0) {
            http_response_code(409); // Conflict
            echo json_encode(["message" => "Username already exists."]);
            exit;
        }

        // Hash password
        $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

        $sql = "INSERT INTO users (username, password) VALUES (?, ?)";
        $stmt = $pdo->prepare($sql);

        if ($stmt->execute([$data->username, $password_hash])) {
            http_response_code(201);
            echo json_encode(["message" => "User registered successfully."]);
        } else {
            http_response_code(503); // Service Unavailable
            echo json_encode(["message" => "Unable to register user."]);
        }
    } else {
        http_response_code(400); // Bad Request
        echo json_encode(["message" => "Incomplete data. Username and password are required."]);
    }
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["message" => "Method not allowed."]);
}
?>
