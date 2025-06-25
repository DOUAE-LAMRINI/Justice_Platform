-- Add category column to order_items
ALTER TABLE order_items ADD COLUMN category VARCHAR(255) AFTER item_name;

-- Create inventory_items table
CREATE TABLE inventory_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0.00,
  initial_quantity INT NOT NULL DEFAULT 0,
  current_quantity INT NOT NULL DEFAULT 0,
  min_stock_level INT NOT NULL DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (name)
);

-- Create categories table
CREATE TABLE inventory_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some common categories
INSERT INTO inventory_categories (name, description) VALUES 
('Office Supplies', 'Pens, papers, staplers, etc.'),
('Electronics', 'Computers, printers, phones'),
('Furniture', 'Desks, chairs, cabinets'),
('Printing', 'Ink, paper, toners');