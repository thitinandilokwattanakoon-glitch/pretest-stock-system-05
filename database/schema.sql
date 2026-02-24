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
-- CPUs
('BX8071513900K', 'Intel Core i9-13900K', 'CPU', 22900.00, 10, '{"socket": "LGA1700", "cores": 24, "threads": 32, "base_clock": "3.0GHz", "tdp": 125}', 36),
('BX8071513700K', 'Intel Core i7-13700K', 'CPU', 15900.00, 15, '{"socket": "LGA1700", "cores": 16, "threads": 24, "base_clock": "3.4GHz", "tdp": 125}', 36),
('BX8071513400F', 'Intel Core i5-13400F', 'CPU', 7900.00, 30, '{"socket": "LGA1700", "cores": 10, "threads": 16, "base_clock": "2.5GHz", "tdp": 65}', 36),
('BX8071514900K', 'Intel Core i9-14900K', 'CPU', 23900.00, 5, '{"socket": "LGA1700", "cores": 24, "threads": 32, "base_clock": "3.2GHz", "tdp": 125}', 36),
('BX8071512400F', 'Intel Core i5-12400F', 'CPU', 5400.00, 40, '{"socket": "LGA1700", "cores": 6, "threads": 12, "base_clock": "2.5GHz", "tdp": 65}', 36),
('100-100000593WOF', 'AMD Ryzen 9 7950X', 'CPU', 21500.00, 8, '{"socket": "AM5", "cores": 16, "threads": 32, "base_clock": "4.5GHz", "tdp": 170}', 36),
('100-100000910WOF', 'AMD Ryzen 7 7800X3D', 'CPU', 16500.00, 12, '{"socket": "AM5", "cores": 8, "threads": 16, "base_clock": "4.2GHz", "tdp": 120}', 36),
('100-100000591WOF', 'AMD Ryzen 5 7600X', 'CPU', 9900.00, 20, '{"socket": "AM5", "cores": 6, "threads": 12, "base_clock": "4.7GHz", "tdp": 105}', 36),
('100-100000065BOX', 'AMD Ryzen 5 5600', 'CPU', 5200.00, 25, '{"socket": "AM4", "cores": 6, "threads": 12, "base_clock": "3.5GHz", "tdp": 65}', 36),
('100-100000063WOF', 'AMD Ryzen 7 5800X', 'CPU', 8900.00, 15, '{"socket": "AM4", "cores": 8, "threads": 16, "base_clock": "3.8GHz", "tdp": 105}', 36),
-- GPUs
('GV-N4090GAMING OC-24GD', 'Gigabyte GeForce RTX 4090 Gaming OC', 'GPU', 65000.00, 5, '{"chipset": "RTX 4090", "memory": "24GB", "length_mm": 340, "recommended_psu": 850, "tdp": 450}', 36),
('ROG-STRIX-RTX4080-O16G', 'ASUS ROG Strix RTX 4080 OC', 'GPU', 48900.00, 6, '{"chipset": "RTX 4080", "memory": "16GB", "length_mm": 357, "recommended_psu": 750, "tdp": 320}', 36),
('ROG-STRIX-RTX4070TI-O12G', 'ASUS ROG Strix RTX 4070 Ti OC', 'GPU', 33900.00, 8, '{"chipset": "RTX 4070 Ti", "memory": "12GB", "length_mm": 336, "recommended_psu": 750, "tdp": 285}', 36),
('DUAL-RTX4060TI-O8G', 'ASUS Dual RTX 4060 Ti OC', 'GPU', 15900.00, 15, '{"chipset": "RTX 4060 Ti", "memory": "8GB", "length_mm": 227, "recommended_psu": 650, "tdp": 160}', 36),
('DUAL-RTX4060-O8G', 'ASUS Dual RTX 4060 OC', 'GPU', 11900.00, 20, '{"chipset": "RTX 4060", "memory": "8GB", "length_mm": 227, "recommended_psu": 550, "tdp": 115}', 36),
('RTX-3060-VENTUS-2X', 'MSI GeForce RTX 3060 Ventus 2X', 'GPU', 9900.00, 25, '{"chipset": "RTX 3060", "memory": "12GB", "length_mm": 235, "recommended_psu": 550, "tdp": 170}', 36),
('RX7900XTX-24G', 'MSI Radeon RX 7900 XTX Gaming Trio', 'GPU', 39900.00, 4, '{"chipset": "RX 7900 XTX", "memory": "24GB", "length_mm": 325, "recommended_psu": 800, "tdp": 355}', 36),
('RX7800XT-16G', 'Sapphire Pure Radeon RX 7800 XT', 'GPU', 19900.00, 10, '{"chipset": "RX 7800 XT", "memory": "16GB", "length_mm": 320, "recommended_psu": 700, "tdp": 263}', 36),
('RX7600-8G', 'Sapphire Pulse Radeon RX 7600', 'GPU', 10500.00, 12, '{"chipset": "RX 7600", "memory": "8GB", "length_mm": 240, "recommended_psu": 550, "tdp": 165}', 36),
-- Mainboards
('ROG-STRIX-Z790-E-GAMING-WIFI', 'ASUS ROG Strix Z790-E Gaming WiFi', 'Mainboard', 18900.00, 5, '{"socket": "LGA1700", "form_factor": "ATX", "memory_type": "DDR5", "chipset": "Z790"}', 36),
('MAG-Z790-TOMAHAWK-WIFI', 'MSI MAG Z790 Tomahawk WiFi', 'Mainboard', 10900.00, 10, '{"socket": "LGA1700", "form_factor": "ATX", "memory_type": "DDR5", "chipset": "Z790"}', 36),
('MAG-B760M-MORTAR-WIFI', 'MSI MAG B760M Mortar WiFi', 'Mainboard', 6900.00, 10, '{"socket": "LGA1700", "form_factor": "M-ATX", "memory_type": "DDR5", "chipset": "B760"}', 36),
('PRIME-H610M-E-D4', 'ASUS Prime H610M-E D4', 'Mainboard', 2600.00, 20, '{"socket": "LGA1700", "form_factor": "M-ATX", "memory_type": "DDR4", "chipset": "H610"}', 36),
('X670E-AORUS-MASTER', 'Gigabyte X670E Aorus Master', 'Mainboard', 16500.00, 6, '{"socket": "AM5", "form_factor": "E-ATX", "memory_type": "DDR5", "chipset": "X670E"}', 36),
('B650M-GAMING-WIFI', 'Gigabyte B650M Gaming WiFi', 'Mainboard', 4500.00, 15, '{"socket": "AM5", "form_factor": "M-ATX", "memory_type": "DDR5", "chipset": "B650"}', 36),
('B550-A-GAMING', 'ASUS ROG Strix B550-A Gaming', 'Mainboard', 5900.00, 12, '{"socket": "AM4", "form_factor": "ATX", "memory_type": "DDR4", "chipset": "B550"}', 36),
('B450M-PRO-VDH-MAX', 'MSI B450M PRO-VDH MAX', 'Mainboard', 2400.00, 20, '{"socket": "AM4", "form_factor": "M-ATX", "memory_type": "DDR4", "chipset": "B450"}', 36),
-- RAM
('CMK32GX5M2B5600C36', 'Corsair Vengeance 32GB (2x16GB) DDR5 5600MHz', 'RAM', 5200.00, 20, '{"type": "DDR5", "capacity": "32GB", "speed": "5600MHz", "modules": 2}', 999),
('F5-6000J3038F16GX2-TZ5NR', 'G.Skill Trident Z5 Neo RGB 32GB (2x16GB) DDR5 6000MHz', 'RAM', 5900.00, 15, '{"type": "DDR5", "capacity": "32GB", "speed": "6000MHz", "modules": 2}', 999),
('F5-5600J3636C16GX2-FX5', 'G.Skill Flare X5 32GB (2x16GB) DDR5 5600MHz', 'RAM', 4500.00, 20, '{"type": "DDR5", "capacity": "32GB", "speed": "5600MHz", "modules": 2}', 999),
('CMK16GX4M2E3200C16', 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz', 'RAM', 1800.00, 40, '{"type": "DDR4", "capacity": "16GB", "speed": "3200MHz", "modules": 2}', 999),
('KF432C16BBK2-16', 'Kingston FURY Beast 16GB (2x8GB) DDR4 3200MHz', 'RAM', 1750.00, 50, '{"type": "DDR4", "capacity": "16GB", "speed": "3200MHz", "modules": 2}', 999),
-- SSD
('MZ-V9P2T0BW', 'Samsung 990 Pro 2TB', 'SSD', 9900.00, 10, '{"capacity": "2TB", "interface": "PCIe 4.0", "form_factor": "M.2 2280"}', 60),
('MZ-V9P1T0BW', 'Samsung 990 Pro 1TB', 'SSD', 5900.00, 15, '{"capacity": "1TB", "interface": "PCIe 4.0", "form_factor": "M.2 2280"}', 60),
('CT1000P3SSD8', 'Crucial P3 1TB NVMe', 'SSD', 2100.00, 30, '{"capacity": "1TB", "interface": "PCIe 3.0", "form_factor": "M.2 2280"}', 60),
('MZ-V7E1T0BW', 'Samsung 970 EVO Plus 1TB', 'SSD', 3200.00, 20, '{"capacity": "1TB", "interface": "PCIe 3.0", "form_factor": "M.2 2280"}', 60),
('WDS100T3B0C', 'WD Blue SN570 1TB NVMe', 'SSD', 2400.00, 40, '{"capacity": "1TB", "interface": "PCIe 3.0", "form_factor": "M.2 2280"}', 60),
-- PSU
('CP-9020264-NA', 'Corsair RM1000e 1000W 80+ Gold ATX 3.0', 'PSU', 6500.00, 5, '{"wattage": 1000, "certification": "80+ Gold"}', 84),
('CP-9020263-NA', 'Corsair RM850e 850W 80+ Gold ATX 3.0', 'PSU', 5200.00, 10, '{"wattage": 850, "certification": "80+ Gold"}', 84),
('CP-9020262-NA', 'Corsair RM750e 750W 80+ Gold ATX 3.0', 'PSU', 4200.00, 12, '{"wattage": 750, "certification": "80+ Gold"}', 84),
('PS-TPD-0650FNFAGx-1', 'Thermaltake Toughpower GX3 650W 80+ Gold', 'PSU', 2800.00, 20, '{"wattage": 650, "certification": "80+ Gold"}', 60),
('CP-9020200-NA', 'Corsair RM850x 850W 80+ Gold', 'PSU', 4990.00, 10, '{"wattage": 850, "certification": "80+ Gold"}', 120),
('MSI-MAG-A650BN', 'MSI MAG A650BN 650W 80+ Bronze', 'PSU', 1990.00, 25, '{"wattage": 650, "certification": "80+ Bronze"}', 60),
('MSI-MAG-A550BN', 'MSI MAG A550BN 550W 80+ Bronze', 'PSU', 1690.00, 30, '{"wattage": 550, "certification": "80+ Bronze"}', 60),
('GP-AP1200PM', 'Gigabyte AORUS P1200W 80+ Platinum', 'PSU', 9900.00, 2, '{"wattage": 1200, "certification": "80+ Platinum"}', 120),
-- Cases
('O11D-EVO-RGB-BLACK', 'Lian Li O11 Dynamic EVO RGB Black', 'Case', 6200.00, 8, '{"form_factor": "E-ATX", "max_gpu_length": 455}', 12),
('CC-9011200-WW', 'Corsair 4000D Airflow Black', 'Case', 2990.00, 10, '{"form_factor": "ATX", "max_gpu_length": 360}', 24),
('CC-9011242-WW', 'Corsair 3000D RGB Airflow White', 'Case', 3400.00, 8, '{"form_factor": "ATX", "max_gpu_length": 360}', 24),
('CH370-WH', 'Deepcool CH370 White', 'Case', 1650.00, 15, '{"form_factor": "M-ATX", "max_gpu_length": 320}', 12),
('CA-H510B-W1', 'NZXT H510 White', 'Case', 2590.00, 10, '{"form_factor": "ATX", "max_gpu_length": 381}', 24),
-- Monitors
('VG249Q1A', 'ASUS TUF Gaming VG249Q1A 23.8" 165Hz', 'Monitor', 5900.00, 15, '{"size": "23.8\"", "resolution": "1920x1080", "refresh_rate": "165Hz", "panel": "IPS"}', 36),
('MAG-274QRF-QD', 'MSI Optix MAG274QRF-QD 27" 165Hz', 'Monitor', 13900.00, 8, '{"size": "27\"", "resolution": "2560x1440", "refresh_rate": "165Hz", "panel": "Rapid IPS"}', 36),
('ODYSSEY-G9', 'Samsung Odyssey G9 49" 240Hz UltraWide', 'Monitor', 45900.00, 3, '{"size": "49\"", "resolution": "5120x1440", "refresh_rate": "240Hz", "panel": "VA"}', 36),
-- Coolers
('AK400-WH', 'Deepcool AK400 White Air Cooler', 'Cooler', 1150.00, 20, '{"type": "Air", "noise_level": "28 dBA", "tdp_rating": 220}', 12),
('LT720-WH', 'Deepcool LT720 360mm AIO White', 'Cooler', 4200.00, 10, '{"type": "Liquid", "size": "360mm", "noise_level": "32.9 dBA"}', 36),
('NH-D15', 'Noctua NH-D15 Chromax.Black', 'Cooler', 3990.00, 12, '{"type": "Air", "noise_level": "24.6 dBA", "tdp_rating": 250}', 72),
-- Gaming Gear
('G502-HERO', 'Logitech G502 Hero High Performance', 'GamingGear', 1590.00, 30, '{"type": "Mouse", "dpi": 25600, "buttons": 11}', 24),
('G915-TKL', 'Logitech G915 TKL Wireless Mechanical', 'GamingGear', 6900.00, 10, '{"type": "Keyboard", "switch": "GL Tactile", "connectivity": "Wireless"}', 24),
('HUNTSMAN-V2', 'Razer Huntsman V2 Analog', 'GamingGear', 8500.00, 5, '{"type": "Keyboard", "switch": "Analog Optical", "connectivity": "Wired"}', 24),
-- Entry/Budget Parts
('BX8071512100F', 'Intel Core i3-12100F', 'CPU', 3500.00, 50, '{"socket": "LGA1700", "cores": 4, "threads": 8, "base_clock": "3.3GHz", "tdp": 58}', 36),
('100-100000263BOX', 'AMD Ryzen 3 4100', 'CPU', 2500.00, 30, '{"socket": "AM4", "cores": 4, "threads": 8, "base_clock": "3.8GHz", "tdp": 65}', 36),
('RTX-3050-VENTUS-2X', 'MSI GeForce RTX 3050 Ventus 2X', 'GPU', 8200.00, 20, '{"chipset": "RTX 3050", "memory": "8GB", "length_mm": 235, "recommended_psu": 450, "tdp": 130}', 36),
-- Even More CPUs
('BX8071513600K', 'Intel Core i5-13600K', 'CPU', 12900.00, 20, '{"socket": "LGA1700", "cores": 14, "threads": 20, "base_clock": "3.5GHz", "tdp": 125}', 36),
('BX8071512700K', 'Intel Core i7-12700K', 'CPU', 11500.00, 15, '{"socket": "LGA1700", "cores": 12, "threads": 20, "base_clock": "3.6GHz", "tdp": 125}', 36),
('100-100000061WOF', 'AMD Ryzen 9 5900X', 'CPU', 13900.00, 12, '{"socket": "AM4", "cores": 12, "threads": 24, "base_clock": "3.7GHz", "tdp": 105}', 36),
('100-100000252BOX', 'AMD Ryzen 7 5700G', 'CPU', 6900.00, 18, '{"socket": "AM4", "cores": 8, "threads": 16, "base_clock": "3.8GHz", "tdp": 65}', 36),
('BX8071514700K', 'Intel Core i7-14700K', 'CPU', 16900.00, 10, '{"socket": "LGA1700", "cores": 20, "threads": 28, "base_clock": "3.4GHz", "tdp": 125}', 36),
-- Even More GPUs
('GV-N4070EAGLE OC-12GD', 'Gigabyte RTX 4070 Eagle OC', 'GPU', 22900.00, 12, '{"chipset": "RTX 4070", "memory": "12GB", "length_mm": 261, "recommended_psu": 650, "tdp": 200}', 36),
('TUF-RTX3070-O8G-V2', 'ASUS TUF Gaming RTX 3070 OC', 'GPU', 14900.00, 15, '{"chipset": "RTX 3070", "memory": "8GB", "length_mm": 299, "recommended_psu": 650, "tdp": 220}', 36),
('RX-7700-XT-CL-12GO', 'ASRock RX 7700 XT Challenger', 'GPU', 16900.00, 10, '{"chipset": "RX 7700 XT", "memory": "12GB", "length_mm": 267, "recommended_psu": 700, "tdp": 245}', 36),
('DUAL-RX6600-8G', 'ASUS Dual Radeon RX 6600', 'GPU', 7900.00, 30, '{"chipset": "RX 6600", "memory": "8GB", "length_mm": 243, "recommended_psu": 500, "tdp": 132}', 36),
('RTX-4060-GAMING-X', 'MSI RTX 4060 Gaming X 8G', 'GPU', 12500.00, 20, '{"chipset": "RTX 4060", "memory": "8GB", "length_mm": 247, "recommended_psu": 550, "tdp": 115}', 36),
-- Even More RAM
('CMW32GX4M2E3200C16', 'Corsair Vengeance RGB Pro 32GB (2x16) DDR4', 'RAM', 3600.00, 20, '{"type": "DDR4", "capacity": "32GB", "speed": "3200MHz", "modules": 2}', 999),
('F5-6400J3239G16GX2-TZ5RS', 'G.Skill Trident Z5 RGB 32GB (2x16) DDR5 6400', 'RAM', 6500.00, 10, '{"type": "DDR5", "capacity": "32GB", "speed": "6400MHz", "modules": 2}', 999),
('KF552C40BBK2-32', 'Kingston FURY Beast 32GB (2x16) DDR5 5200', 'RAM', 4200.00, 25, '{"type": "DDR5", "capacity": "32GB", "speed": "5200MHz", "modules": 2}', 999),
('AX5U6000C3016G-DCLARBK', 'ADATA XPG Lancer RGB 32GB (2x16) DDR5 6000', 'RAM', 5400.00, 15, '{"type": "DDR5", "capacity": "32GB", "speed": "6000MHz", "modules": 2}', 999),
-- Even More SSD
('WDS200T3X0E', 'WD Black SN850X 2TB NVMe Gen4', 'SSD', 7900.00, 12, '{"capacity": "2TB", "interface": "PCIe 4.0", "form_factor": "M.2 2280"}', 60),
('SKC3000S/1024G', 'Kingston KC3000 1TB NVMe Gen4', 'SSD', 3400.00, 20, '{"capacity": "1TB", "interface": "PCIe 4.0", "form_factor": "M.2 2280"}', 60),
('CT2000P5PSSD8', 'Crucial P5 Plus 2TB NVMe Gen4', 'SSD', 6200.00, 10, '{"capacity": "2TB", "interface": "PCIe 4.0", "form_factor": "M.2 2280"}', 60),
('SA400S37/960G', 'Kingston A400 960GB SATA', 'SSD', 1850.00, 40, '{"capacity": "960GB", "interface": "SATA 3", "form_factor": "2.5\""}', 36),
-- Even More Mainboards
('ROG-STRIX-B760-I-GAMING-WIFI', 'ASUS ROG Strix B760-I Gaming WiFi (ITX)', 'Mainboard', 8900.00, 5, '{"socket": "LGA1700", "form_factor": "ITX", "memory_type": "DDR5", "chipset": "B760"}', 36),
('TUFGAMING-B650-PLUS-WIFI', 'ASUS TUF Gaming B650-Plus WiFi', 'Mainboard', 7500.00, 15, '{"socket": "AM5", "form_factor": "ATX", "memory_type": "DDR5", "chipset": "B650"}', 36),
('MPG-X670E-CARBON-WIFI', 'MSI MPG X670E Carbon WiFi', 'Mainboard', 16900.00, 5, '{"socket": "AM5", "form_factor": "ATX", "memory_type": "DDR5", "chipset": "X670E"}', 36),
('PRO-B660M-A-DDR4', 'MSI PRO B660M-A DDR4', 'Mainboard', 3900.00, 20, '{"socket": "LGA1700", "form_factor": "M-ATX", "memory_type": "DDR4", "chipset": "B660"}', 36),
('B550I-AORUS-PRO-AX', 'Gigabyte B550I Aorus Pro AX (ITX)', 'Mainboard', 6500.00, 6, '{"socket": "AM4", "form_factor": "ITX", "memory_type": "DDR4", "chipset": "B550"}', 36),
-- Even More PSU
('HG2-850', 'FSP Hydro G Pro 850W 80+ Gold', 'PSU', 3900.00, 15, '{"wattage": 850, "certification": "80+ Gold"}', 120),
('SSR-750FX', 'Seasonic Focus GX-750 80+ Gold', 'PSU', 3850.00, 12, '{"wattage": 750, "certification": "80+ Gold"}', 120),
('CP-9020250-NA', 'Corsair RM1200x Shift 80+ Gold ATX 3.0', 'PSU', 8900.00, 5, '{"wattage": 1200, "certification": "80+ Gold"}', 120),
('PK650D', 'Deepcool PK650D 650W 80+ Bronze', 'PSU', 1850.00, 30, '{"wattage": 650, "certification": "80+ Bronze"}', 60),
-- Even More Cases
('H6-FLOW-RGB-WHITE', 'NZXT H6 Flow RGB White', 'Case', 4200.00, 8, '{"form_factor": "ATX", "max_gpu_length": 365}', 24),
('O11-AIR-MINI-WHITE', 'Lian Li O11 Air Mini White', 'Case', 3900.00, 10, '{"form_factor": "ATX", "max_gpu_length": 362}', 12),
('PAEAN-M', 'Raijintek PAEAN M Micro-ATX Open Bench', 'Case', 3200.00, 5, '{"form_factor": "M-ATX", "max_gpu_length": 430}', 12),
('CG560', 'Deepcool CG560 Mid-Tower Case', 'Case', 2200.00, 15, '{"form_factor": "ATX", "max_gpu_length": 380}', 12),
-- Even More Monitors
('XB273U-NV', 'Acer Predator XB273U NV 27" 170Hz', 'Monitor', 12500.00, 10, '{"size": "27\"", "resolution": "2560x1440", "refresh_rate": "170Hz", "panel": "IPS"}', 36),
('C24G2', 'AOC C24G2 23.6" Curved 165Hz', 'Monitor', 4900.00, 20, '{"size": "23.6\"", "resolution": "1920x1080", "refresh_rate": "165Hz", "panel": "VA"}', 36),
('PG32UQX', 'ASUS ROG Swift PG32UQX 32" 4K 144Hz Mini-LED', 'Monitor', 119000.00, 1, '{"size": "32\"", "resolution": "3840x2160", "refresh_rate": "144Hz", "panel": "IPS Mini-LED"}', 36),
('ULTRA-GEAR-27GP850', 'LG 27GP850-B 27" Ultragear 180Hz', 'Monitor', 14500.00, 12, '{"size": "27\"", "resolution": "2560x1440", "refresh_rate": "180Hz", "panel": "Nano IPS"}', 36),
-- Even More Coolers
('ASSASSIN-IV', 'Deepcool Assassin IV Flagship Air Cooler', 'Cooler', 3500.00, 10, '{"type": "Air", "noise_level": "29.3 dBA", "tdp_rating": 280}', 12),
('KRAKEN-360-RGB', 'NZXT Kraken 360 RGB AIO White', 'Cooler', 7900.00, 8, '{"type": "Liquid", "size": "360mm", "noise_level": "30 dBA"}', 72),
('PURE-LOOP-240', 'be quiet! Pure Loop 2 240mm', 'Cooler', 3800.00, 12, '{"type": "Liquid", "size": "240mm", "noise_level": "24 dBA"}', 36),
('HYPER-212-HALO', 'Cooler Master Hyper 212 Halo Black', 'Cooler', 1350.00, 25, '{"type": "Air", "noise_level": "27 dBA", "tdp_rating": 180}', 24),
-- Even More Gaming Gear
('Viper-V2-Pro', 'Razer Viper V2 Pro Ultra-Lightweight', 'GamingGear', 4900.00, 12, '{"type": "Mouse", "dpi": 30000, "buttons": 5}', 24),
('Apex-Pro-TKL', 'SteelSeries Apex Pro TKL (2023)', 'GamingGear', 7900.00, 8, '{"type": "Keyboard", "switch": "OmniPoint 2.0", "connectivity": "Wired"}', 24),
('BlackShark-V2-Pro', 'Razer BlackShark V2 Pro (2023)', 'GamingGear', 6500.00, 15, '{"type": "Headset", "connectivity": "Wireless", "driver": "50mm"}', 24),
('G-Pro-X-2', 'Logitech G Pro X 2 Lightspeed', 'GamingGear', 8900.00, 10, '{"connectivity": "Wireless", "driver": "50mm Graphene", "type": "Headset"}', 24),
-- Top 5 Popular Monitors
('M27Q', 'Gigabyte M27Q 27" 170Hz KVM', 'Monitor', 10900.00, 15, '{"size": "27\"", "resolution": "2560x1440", "refresh_rate": "170Hz", "panel": "SS IPS"}', 36),
('S2721DGF', 'Dell S2721DGF 27" 165Hz Gaming', 'Monitor', 12900.00, 10, '{"size": "27\"", "resolution": "2560x1440", "refresh_rate": "165Hz", "panel": "Fast IPS"}', 36),
('G5-CURVED', 'Samsung Odyssey G5 27" 144Hz Curved', 'Monitor', 8900.00, 20, '{"size": "27\"", "resolution": "2560x1440", "refresh_rate": "144Hz", "panel": "VA"}', 36),
('XL2546K', 'BenQ ZOWIE XL2546K 24.5" 240Hz', 'Monitor', 19900.00, 8, '{"size": "24.5\"", "resolution": "1920x1080", "refresh_rate": "240Hz", "panel": "TN"}', 36),
('24GN600-B', 'LG UltraGear 24GN600-B 24" 144Hz', 'Monitor', 5500.00, 25, '{"size": "24\"", "resolution": "1920x1080", "refresh_rate": "144Hz", "panel": "IPS"}', 36),
-- Top 5 Popular Gaming Gear
('GPX-SUPERLIGHT', 'Logitech G Pro X Superlight Wireless', 'GamingGear', 4500.00, 30, '{"type": "Mouse", "dpi": 25600, "weight": "63g"}', 24),
('DA-V3-PRO', 'Razer DeathAdder V3 Pro Wireless', 'GamingGear', 5400.00, 15, '{"type": "Mouse", "dpi": 30000, "weight": "63g"}', 24),
('ARCTIS-NOVA-7', 'SteelSeries Arctis Nova 7 Wireless', 'GamingGear', 7200.00, 12, '{"type": "Headset", "connectivity": "Wireless", "driver": "40mm"}', 24),
('KEYCHRON-Q1', 'Keychron Q1 QMK Custom Mechanical', 'GamingGear', 6200.00, 10, '{"type": "Keyboard", "switch": "Hot-swappable", "form_factor": "75%"}', 12),
('K70-TKL', 'Corsair K70 RGB TKL Champion Series', 'GamingGear', 4900.00, 15, '{"type": "Keyboard", "switch": "Cherry MX Speed", "polling_rate": "8000Hz"}', 24);
;
;


