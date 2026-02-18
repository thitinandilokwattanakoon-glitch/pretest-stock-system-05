<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../db.php';

try {
    // Total Products Count
    $stmt = $pdo->query("SELECT COUNT(*) as total_items FROM products");
    $total_items = $stmt->fetch()['total_items'];

    // Low Stock Count
    $stmt = $pdo->query("SELECT COUNT(*) as low_stock_count FROM products WHERE quantity <= min_threshold");
    $low_stock_count = $stmt->fetch()['low_stock_count'];

    // Total Stock Value
    $stmt = $pdo->query("SELECT SUM(price * quantity) as total_value FROM products");
    $total_value = $stmt->fetch()['total_value'] ?: 0;

    // Category Breakdown
    $stmt = $pdo->query("SELECT category, COUNT(*) as count FROM products GROUP BY category");
    $categories = $stmt->fetchAll();

    echo json_encode([
        'total_items' => $total_items,
        'low_stock_count' => $low_stock_count,
        'total_value' => $total_value,
        'categories' => $categories
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error fetching dashboard data: " . $e->getMessage()]);
}
?>
