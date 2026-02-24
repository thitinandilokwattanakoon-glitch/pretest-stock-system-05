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

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT DEFAULT NULL, -- NULL if for all admins
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Seed Data for PC Builder Testing
INSERT INTO products (model, name, category, price, quantity, specs, warranty_months) VALUES
-- CPUs
('BX8071513900K', 'Intel Core i9-13900K', 'CPU', 22900.00, 10, '{"socket": "LGA1700", "cores": 24, "threads": 32, "base_clock": "3.0GHz", "tdp": 125}', 36),
('BX8071513700K', 'Intel Core i7-13700K', 'CPU', 15900.00, 15, '{"socket": "LGA1700", "cores": 16, "threads": 24, "base_clock": "3.4GHz", "tdp": 125}', 36),
('BX8071513400F', 'Intel Core i5-13400F', 'CPU', 7900.00, 30, '{"socket": "LGA1700", "cores": 10, "threads": 16, "base_clock": "2.5GHz", "tdp": 65}', 36),
('100-100000593WOF', 'AMD Ryzen 9 7950X', 'CPU', 21500.00, 8, '{"socket": "AM5", "cores": 16, "threads": 32, "base_clock": "4.5GHz", "tdp": 170}', 36),
('100-100000910WOF', 'AMD Ryzen 7 7800X3D', 'CPU', 16500.00, 12, '{"socket": "AM5", "cores": 8, "threads": 16, "base_clock": "4.2GHz", "tdp": 120}', 36),
('100-100000591WOF', 'AMD Ryzen 5 7600X', 'CPU', 9900.00, 20, '{"socket": "AM5", "cores": 6, "threads": 12, "base_clock": "4.7GHz", "tdp": 105}', 36),
('100-100000065BOX', 'AMD Ryzen 5 5600', 'CPU', 5200.00, 25, '{"socket": "AM4", "cores": 6, "threads": 12, "base_clock": "3.5GHz", "tdp": 65}', 36),
-- GPUs
('GV-N4090GAMING OC-24GD', 'Gigabyte GeForce RTX 4090 Gaming OC', 'GPU', 65000.00, 5, '{"chipset": "RTX 4090", "memory": "24GB", "length_mm": 340, "recommended_psu": 850, "tdp": 450}', 36),
('ROG-STRIX-RTX4080-O16G', 'ASUS ROG Strix RTX 4080 OC', 'GPU', 48900.00, 6, '{"chipset": "RTX 4080", "memory": "16GB", "length_mm": 357, "recommended_psu": 750, "tdp": 320}', 36),
('ROG-STRIX-RTX4070TI-O12G', 'ASUS ROG Strix RTX 4070 Ti OC', 'GPU', 33900.00, 8, '{"chipset": "RTX 4070 Ti", "memory": "12GB", "length_mm": 336, "recommended_psu": 750, "tdp": 285}', 36),
('DUAL-RTX4060TI-O8G', 'ASUS Dual RTX 4060 Ti OC', 'GPU', 15900.00, 15, '{"chipset": "RTX 4060 Ti", "memory": "8GB", "length_mm": 227, "recommended_psu": 650, "tdp": 160}', 36),
('DUAL-RTX4060-O8G', 'ASUS Dual RTX 4060 OC', 'GPU', 11900.00, 20, '{"chipset": "RTX 4060", "memory": "8GB", "length_mm": 227, "recommended_psu": 550, "tdp": 115}', 36),
('RX7900XTX-24G', 'MSI Radeon RX 7900 XTX Gaming Trio', 'GPU', 39900.00, 4, '{"chipset": "RX 7900 XTX", "memory": "24GB", "length_mm": 325, "recommended_psu": 800, "tdp": 355}', 36),
('RX7600-8G', 'Sapphire Pulse Radeon RX 7600', 'GPU', 10500.00, 12, '{"chipset": "RX 7600", "memory": "8GB", "length_mm": 240, "recommended_psu": 550, "tdp": 165}', 36),
-- Mainboards
('ROG-STRIX-Z790-E-GAMING-WIFI', 'ASUS ROG Strix Z790-E Gaming WiFi', 'Mainboard', 18900.00, 5, '{"socket": "LGA1700", "form_factor": "ATX", "memory_type": "DDR5", "chipset": "Z790"}', 36),
('MAG-Z790-TOMAHAWK-WIFI', 'MSI MAG Z790 Tomahawk WiFi', 'Mainboard', 10900.00, 10, '{"socket": "LGA1700", "form_factor": "ATX", "memory_type": "DDR5", "chipset": "Z790"}', 36),
('MAG-B760M-MORTAR-WIFI', 'MSI MAG B760M Mortar WiFi', 'Mainboard', 6900.00, 10, '{"socket": "LGA1700", "form_factor": "M-ATX", "memory_type": "DDR5", "chipset": "B760"}', 36),
('PRIME-H610M-E-D4', 'ASUS Prime H610M-E D4', 'Mainboard', 2600.00, 20, '{"socket": "LGA1700", "form_factor": "M-ATX", "memory_type": "DDR4", "chipset": "H610"}', 36),
('X670E-AORUS-MASTER', 'Gigabyte X670E Aorus Master', 'Mainboard', 16500.00, 6, '{"socket": "AM5", "form_factor": "E-ATX", "memory_type": "DDR5", "chipset": "X670E"}', 36),
('B650M-GAMING-WIFI', 'Gigabyte B650M Gaming WiFi', 'Mainboard', 4500.00, 15, '{"socket": "AM5", "form_factor": "M-ATX", "memory_type": "DDR5", "chipset": "B650"}', 36),
('B450M-PRO-VDH-MAX', 'MSI B450M PRO-VDH MAX', 'Mainboard', 2400.00, 20, '{"socket": "AM4", "form_factor": "M-ATX", "memory_type": "DDR4", "chipset": "B450"}', 36),
-- RAM
('CMK32GX5M2B5600C36', 'Corsair Vengeance 32GB (2x16GB) DDR5 5600MHz', 'RAM', 5200.00, 20, '{"type": "DDR5", "capacity": "32GB", "speed": "5600MHz", "modules": 2}', 999),
('F5-6000J3038F16GX2-TZ5NR', 'G.Skill Trident Z5 Neo RGB 32GB (2x16GB) DDR5 6000MHz', 'RAM', 5900.00, 15, '{"type": "DDR5", "capacity": "32GB", "speed": "6000MHz", "modules": 2}', 999),
('CMK16GX4M2E3200C16', 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz', 'RAM', 1800.00, 40, '{"type": "DDR4", "capacity": "16GB", "speed": "3200MHz", "modules": 2}', 999),
('KF432C16BBK2-16', 'Kingston FURY Beast 16GB (2x8GB) DDR4 3200MHz', 'RAM', 1750.00, 50, '{"type": "DDR4", "capacity": "16GB", "speed": "3200MHz", "modules": 2}', 999),
-- SSD
('MZ-V9P2T0BW', 'Samsung 990 Pro 2TB', 'SSD', 9900.00, 10, '{"capacity": "2TB", "interface": "PCIe 4.0", "form_factor": "M.2 2280"}', 60),
('MZ-V9P1T0BW', 'Samsung 990 Pro 1TB', 'SSD', 5900.00, 15, '{"capacity": "1TB", "interface": "PCIe 4.0", "form_factor": "M.2 2280"}', 60),
('MZ-V7E1T0BW', 'Samsung 970 EVO Plus 1TB', 'SSD', 3200.00, 20, '{"capacity": "1TB", "interface": "PCIe 3.0", "form_factor": "M.2 2280"}', 60),
('WDS100T3B0C', 'WD Blue SN570 1TB NVMe', 'SSD', 2400.00, 40, '{"capacity": "1TB", "interface": "PCIe 3.0", "form_factor": "M.2 2280"}', 60),
-- PSU
('CP-9020264-NA', 'Corsair RM1000e 1000W 80+ Gold ATX 3.0', 'PSU', 6500.00, 5, '{"wattage": 1000, "certification": "80+ Gold"}', 84),
('CP-9020200-NA', 'Corsair RM850x 850W 80+ Gold', 'PSU', 4990.00, 10, '{"wattage": 850, "certification": "80+ Gold"}', 120),
('MSI-MAG-A650BN', 'MSI MAG A650BN 650W 80+ Bronze', 'PSU', 1990.00, 25, '{"wattage": 650, "certification": "80+ Bronze"}', 60),
('GP-AP1200PM', 'Gigabyte AORUS P1200W 80+ Platinum', 'PSU', 9900.00, 2, '{"wattage": 1200, "certification": "80+ Platinum"}', 120),
-- Cases
('O11D-EVO-RGB-BLACK', 'Lian Li O11 Dynamic EVO RGB Black', 'Case', 6200.00, 8, '{"form_factor": "E-ATX", "max_gpu_length": 455}', 12),
('CC-9011200-WW', 'Corsair 4000D Airflow Black', 'Case', 2990.00, 10, '{"form_factor": "ATX", "max_gpu_length": 360}', 24),
('CH370-WH', 'Deepcool CH370 White', 'Case', 1650.00, 15, '{"form_factor": "M-ATX", "max_gpu_length": 320}', 12),
('CA-H510B-W1', 'NZXT H510 White', 'Case', 2590.00, 10, '{"form_factor": "ATX", "max_gpu_length": 381}', 24);


