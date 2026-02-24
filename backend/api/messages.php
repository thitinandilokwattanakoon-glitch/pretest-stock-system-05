<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Fetch messages for a specific sender or all if admin
        $sender_id = $_GET['sender_id'] ?? null;
        
        if ($sender_id) {
            $stmt = $pdo->prepare("SELECT m.*, u.username FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.sender_id = ? OR m.receiver_id = ? ORDER BY m.created_at ASC");
            $stmt->execute([$sender_id, $sender_id]);
        } else {
            // Admin view: get unique conversants or all messages
            $stmt = $pdo->query("SELECT m.*, u.username FROM messages m JOIN users u ON m.sender_id = u.id ORDER BY m.created_at ASC");
        }
        
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->sender_id) && !empty($data->message)) {
            $is_admin_reply = $data->is_admin_reply ?? false;
            $receiver_id = $data->receiver_id ?? null;

            $sql = "INSERT INTO messages (sender_id, receiver_id, message, is_admin_reply) VALUES (?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            
            if ($stmt->execute([$data->sender_id, $receiver_id, $data->message, $is_admin_reply])) {
                http_response_code(201);
                echo json_encode(["message" => "Message sent successfully."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to send message."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Incomplete data."]);
        }
        break;
}
?>
