<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $product = $stmt->fetch();
            echo json_encode($product);
        } else {
            $stmt = $pdo->query("SELECT * FROM products ORDER BY id DESC");
            $products = $stmt->fetchAll();
            echo json_encode($products);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->name) && !empty($data->category) && isset($data->price) && isset($data->quantity)) {
            $sql = "INSERT INTO products (name, category, price, quantity, min_threshold, image_url) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $min_threshold = isset($data->min_threshold) ? $data->min_threshold : 5;
            $image_url = isset($data->image_url) ? $data->image_url : '';
            
            if ($stmt->execute([$data->name, $data->category, $data->price, $data->quantity, $min_threshold, $image_url])) {
                http_response_code(201);
                echo json_encode(["message" => "Product created successfully."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to create product."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Incomplete data."]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->id)) {
            // Update logic - ensuring not to overwrite with nulls if fields are missing is better, but for simplicity:
            // Fetch existing first
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$data->id]);
            $existing = $stmt->fetch();

            if ($existing) {
                $name = $data->name ?? $existing['name'];
                $category = $data->category ?? $existing['category'];
                $price = $data->price ?? $existing['price'];
                $quantity = $data->quantity ?? $existing['quantity'];
                $min_threshold = $data->min_threshold ?? $existing['min_threshold'];
                $image_url = $data->image_url ?? $existing['image_url'];

                $sql = "UPDATE products SET name=?, category=?, price=?, quantity=?, min_threshold=?, image_url=? WHERE id=?";
                $stmt = $pdo->prepare($sql);
                if ($stmt->execute([$name, $category, $price, $quantity, $min_threshold, $image_url, $data->id])) {
                    echo json_encode(["message" => "Product updated successfully."]);
                } else {
                    http_response_code(503);
                    echo json_encode(["message" => "Unable to update product."]);
                }
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Product not found."]);
            }
        }
        break;

    case 'DELETE':
        // Parse ID from URL query or body
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        if (!$id) {
             $data = json_decode(file_get_contents("php://input"));
             $id = $data->id ?? null;
        }

        if ($id) {
            $stmt = $pdo->prepare("Delete FROM products WHERE id = ?");
            if ($stmt->execute([$id])) {
                echo json_encode(["message" => "Product deleted."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to delete product."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Product ID is missing."]);
        }
        break;
}
?>
