CREATE TABLE employee_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_type ENUM('supplies', 'technical', 'administrative', 'other') NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);