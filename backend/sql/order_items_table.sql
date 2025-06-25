CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'piece',
    employee_id INT NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    reason ENUM('out_of_stock', 'broken', 'new_employee', 'transferred', 'other') NOT NULL,
    is_new_employee BOOLEAN DEFAULT FALSE,
    is_transferred BOOLEAN DEFAULT FALSE,
    is_broken BOOLEAN DEFAULT FALSE,
    proof_file_path VARCHAR(255),
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES employee_office_orders(id) ON DELETE CASCADE
);

ALTER TABLE order_items
MODIFY COLUMN employee_id INT NULL,
MODIFY COLUMN employee_name VARCHAR(100) NOT NULL,
MODIFY COLUMN reason VARCHAR(50) NOT NULL DEFAULT 'other';