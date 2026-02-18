CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category ENUM('CPU', 'GPU', 'RAM', 'SSD', 'Mainboard', 'PSU', 'Case', 'Cooler', 'Monitor', 'GamingGear') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    min_threshold INT NOT NULL DEFAULT 5,
    image_url VARCHAR(255),
    specs JSON,
    warranty_months INT DEFAULT 12,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff', 'customer') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    customer_tax_id VARCHAR(20),
    customer_address TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS product_serials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    status ENUM('available', 'sold', 'rma', 'lost') DEFAULT 'available',
    order_id INT DEFAULT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS rma_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serial_number VARCHAR(100) NOT NULL,
    issue_description TEXT,
    status ENUM('received', 'checking', 'vendor_claim', 'returning', 'completed', 'rejected') DEFAULT 'received',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed Data for PC Builder Testing
INSERT INTO products (model, name, category, price, quantity, specs, warranty_months) VALUES
('BX8071513900K', 'Intel Core i9-13900K', 'CPU', 22900.00, 10, '{"socket": "LGA1700", "cores": 24, "threads": 32, "base_clock": "3.0GHz", "boost_clock": "5.8GHz", "tdp": 125, "integrated_graphics": true}', 36),
('100-100000593WOF', 'AMD Ryzen 9 7950X', 'CPU', 21500.00, 8, '{"socket": "AM5", "cores": 16, "threads": 32, "base_clock": "4.5GHz", "boost_clock": "5.7GHz", "tdp": 170, "integrated_graphics": true}', 36),
('GV-N4090GAMING OC-24GD', 'Gigabyte GeForce RTX 4090 Gaming OC', 'GPU', 65000.00, 5, '{"chipset": "RTX 4090", "memory": "24GB", "memory_type": "GDDR6X", "length_mm": 340, "tdp": 450, "recommended_psu": 850}', 36),
('ROG-STRIX-Z790-E-GAMING-WIFI', 'ASUS ROG Strix Z790-E Gaming WiFi', 'Mainboard', 18900.00, 5, '{"socket": "LGA1700", "chipset": "Z790", "form_factor": "ATX", "memory_type": "DDR5", "memory_slots": 4, "max_memory": 128}', 36),
('CMK32GX5M2B5600C36', 'Corsair Vengeance 32GB (2x16GB) DDR5 5600MHz', 'RAM', 5200.00, 20, '{"type": "DDR5", "capacity": "32GB", "speed": "5600MHz", "cas_latency": 36, "modules": 2}', 999),
('MZ-V9P1T0BW', 'Samsung 990 Pro 1TB', 'SSD', 5900.00, 15, '{"interface": "PCIe 4.0", "form_factor": "M.2 2280", "read_speed": "7450MB/s", "write_speed": "6900MB/s"}', 60),
('CP-9020200-NA', 'Corsair RM850x 850W 80+ Gold', 'PSU', 4990.00, 10, '{"wattage": 850, "certification": "80+ Gold", "modularity": "Full"}', 120),
('CC-9011200-WW', 'Corsair 4000D Airflow', 'Case', 2990.00, 10, '{"form_factor": "Mid Tower", "max_gpu_length": 360, "max_cpu_cooler_height": 170, "psu_support": "ATX"}', 24);
