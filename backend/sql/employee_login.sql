CREATE TABLE employee_app_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    personal_phone VARCHAR(20),
    office_phone VARCHAR(20) NOT NULL,
    personal_email VARCHAR(100),
    office_email VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL COMMENT 'admin, judge, department_head, employee',
    department VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'Store hashed passwords only',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert admin account (you)
INSERT INTO employee_app_users (
    full_name, 
    personal_phone, 
    office_phone, 
    personal_email, 
    office_email, 
    role, 
    department, 
    city, 
    username, 
    password
) VALUES (
    'Douae Admin', 
    '+212612345678', 
    '+212536782010', 
    'douae.personal@example.com', 
    'douae.admin@justice.ma', 
    'admin', 
    'System Administration', 
    'Rabat', 
    'douae', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDqUiz8CJb6F7PjUFRVX8Y90VQx7US' 
);