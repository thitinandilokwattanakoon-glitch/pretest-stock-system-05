CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category ENUM('CPU', 'GPU', 'RAM', 'SSD', 'Mainboard', 'PSU', 'Case') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    min_threshold INT NOT NULL DEFAULT 5,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO products (name, category, price, quantity, min_threshold) VALUES
('Intel Core i9-13900K', 'CPU', 22900.00, 10, 3),
('AMD Ryzen 9 7950X', 'CPU', 21500.00, 8, 3),
('NVIDIA GeForce RTX 4090', 'GPU', 65000.00, 2, 1),
('Corsair Vengeance 32GB', 'RAM', 4500.00, 20, 5),
('Samsung 990 Pro 1TB', 'SSD', 5900.00, 15, 5);
