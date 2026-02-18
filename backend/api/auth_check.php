<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        "authenticated" => true,
        "user" => [
            "id" => $_SESSION['user_id'],
            "username" => $_SESSION['username']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        "authenticated" => false,
        "message" => "Not authenticated"
    ]);
}
?>
