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
            if ($product && $product['specs']) {
                $product['specs'] = json_decode($product['specs']);
            }
            echo json_encode($product);
        } else {
            $category = isset($_GET['category']) ? $_GET['category'] : null;
            $sql = "SELECT * FROM products";
            if ($category) {
                $sql .= " WHERE category = :category";
            }
            $sql .= " ORDER BY id DESC";
            
            $stmt = $pdo->prepare($sql);
            if ($category) {
                $stmt->bindParam(':category', $category);
            }
            $stmt->execute();
            $products = $stmt->fetchAll();
            
            // Decode JSON specs for each product
            foreach ($products as &$product) {
                if (isset($product['specs'])) {
                    $product['specs'] = json_decode($product['specs']);
                }
            }
            
            echo json_encode($products);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->name) && !empty($data->category) && isset($data->price) && isset($data->quantity)) {
            $sql = "INSERT INTO products (model, name, category, price, quantity, min_threshold, image_url, specs, warranty_months) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            
            $model = $data->model ?? '';
            $min_threshold = $data->min_threshold ?? 5;
            $image_url = $data->image_url ?? '';
            $specs = isset($data->specs) ? json_encode($data->specs) : null;
            $warranty_months = $data->warranty_months ?? 12;

            if ($stmt->execute([$model, $data->name, $data->category, $data->price, $data->quantity, $min_threshold, $image_url, $specs, $warranty_months])) {
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
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$data->id]);
            $existing = $stmt->fetch();

            if ($existing) {
                $model = $data->model ?? $existing['model'];
                $name = $data->name ?? $existing['name'];
                $category = $data->category ?? $existing['category'];
                $price = $data->price ?? $existing['price'];
                $quantity = $data->quantity ?? $existing['quantity'];
                $min_threshold = $data->min_threshold ?? $existing['min_threshold'];
                $image_url = $data->image_url ?? $existing['image_url'];
                $specs = isset($data->specs) ? json_encode($data->specs) : $existing['specs'];
                $warranty_months = $data->warranty_months ?? $existing['warranty_months'];

                $sql = "UPDATE products SET model=?, name=?, category=?, price=?, quantity=?, min_threshold=?, image_url=?, specs=?, warranty_months=? WHERE id=?";
                $stmt = $pdo->prepare($sql);
                if ($stmt->execute([$model, $name, $category, $price, $quantity, $min_threshold, $image_url, $specs, $warranty_months, $data->id])) {
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
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        if (!$id) {
             $data = json_decode(file_get_contents("php://input"));
             $id = $data->id ?? null;
        }

        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
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
