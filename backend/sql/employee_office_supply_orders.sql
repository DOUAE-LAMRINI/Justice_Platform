-- First, drop existing tables if they exist
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS employee_office_orders;

-- Create the main orders table with ALL required columns
CREATE TABLE employee_office_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) NOT NULL UNIQUE,
    requested_by_name VARCHAR(100) NOT NULL,  -- This is the employee name
    chef_name VARCHAR(100),
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected', 'fulfilled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the order items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'piece',
    employee_name VARCHAR(100) NOT NULL,
    reason VARCHAR(50) NOT NULL DEFAULT 'other',
    is_new_employee BOOLEAN DEFAULT FALSE,
    is_transferred BOOLEAN DEFAULT FALSE,
    is_broken BOOLEAN DEFAULT FALSE,
    proof_file_path VARCHAR(255),
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES employee_office_orders(id) ON DELETE CASCADE
);