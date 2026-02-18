<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../db.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_orders':
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
        break;

    case 'get_order_details':
        $id = $_GET['id'] ?? 0;
        $stmt = $pdo->prepare("SELECT oi.*, p.name, p.category, p.warranty_months FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?");
        $stmt->execute([$id]);
        $items = $stmt->fetchAll();
        
        // Fetch serials for this order
        $serialStmt = $pdo->prepare("SELECT * FROM product_serials WHERE order_id = ?");
        $serialStmt->execute([$id]);
        $serials = $serialStmt->fetchAll(); // Logic to map serials to items would be here
        
        echo json_encode(['items' => $items, 'serials' => $serials]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['message' => 'Invalid action']);
        break;
}
?>
