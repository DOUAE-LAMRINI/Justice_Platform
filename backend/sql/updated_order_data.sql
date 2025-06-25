-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS employee_office_orders;

-- Create the main orders table
CREATE TABLE employee_office_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) NOT NULL UNIQUE,
    chef_name VARCHAR(100),
    employee_name VARCHAR(100) NOT NULL,
    notes TEXT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected', 'fulfilled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the order items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'piece',
    reason VARCHAR(50) NOT NULL DEFAULT 'other',
    notes TEXT NULL,
    FOREIGN KEY (order_id) REFERENCES employee_office_orders(id) ON DELETE CASCADE
);