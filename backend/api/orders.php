<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (
        !empty($data->customer_name) && 
        !empty($data->customer_address) && 
        !empty($data->items) && 
        is_array($data->items)
    ) {
        try {
            $pdo->beginTransaction();

            $totalAmount = 0;
            foreach ($data->items as $item) {
                // Verify price and stock
                $stmt = $pdo->prepare("SELECT price, quantity FROM products WHERE id = ? FOR UPDATE");
                $stmt->execute([$item->id]);
                $product = $stmt->fetch();

                if (!$product) {
                    throw new Exception("Product ID {$item->id} not found.");
                }
                if ($product['quantity'] < 1) {
                    throw new Exception("Product ID {$item->id} is out of stock.");
                }

                $totalAmount += $product['price'];
            }
            
            // Add assembly fee if applicable (logic in frontend was +500)
            // Ideally backend should handle this logic or trust frontend 'total' for now, but safer to re-calc.
            // Let's trust the item prices from DB + fixed fee.
            $totalAmount += 500; // Assembly Fee

            // Create Order
            $sql = "INSERT INTO orders (customer_name, customer_tax_id, customer_address, total_amount, status) VALUES (?, ?, ?, ?, 'pending')";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data->customer_name,
                $data->customer_tax_id ?? '',
                $data->customer_address,
                $totalAmount
            ]);
            $orderId = $pdo->lastInsertId();

            // Create Order Items and Deduct Stock
            foreach ($data->items as $item) {
                 // Get current price again (redundant but safe)
                $stmt = $pdo->prepare("SELECT price FROM products WHERE id = ?");
                $stmt->execute([$item->id]);
                $product = $stmt->fetch();
                
                // Deduct Stock
                $updateStmt = $pdo->prepare("UPDATE products SET quantity = quantity - 1 WHERE id = ?");
                $updateStmt->execute([$item->id]);

                // Insert Order Item
                $itemSql = "INSERT INTO order_items (order_id, product_id, quantity, price_per_unit) VALUES (?, ?, 1, ?)";
                $itemStmt = $pdo->prepare($itemSql);
                $itemStmt->execute([$orderId, $item->id, $product['price']]);
            }

            $pdo->commit();
            
            http_response_code(201);
            echo json_encode(["message" => "Order created.", "order_id" => $orderId]);

        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(503);
            echo json_encode(["message" => "Order failed: " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed."]);
}
?>
