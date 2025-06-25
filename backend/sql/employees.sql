CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name_ar VARCHAR(100) NOT NULL,
    full_name_fr VARCHAR(100),
    department VARCHAR(50) NOT NULL,
    position VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for employees
INSERT INTO employees (full_name_ar, full_name_fr, department, position) VALUES
('محمد العلوي', 'Mohamed Alaoui', 'الإدارة', 'مدير'),
('فاطمة الزهراء', 'Fatima Zahra', 'المالية', 'محاسبة'),
('أحمد بنعلي', 'Ahmed Benali', 'الموارد البشرية', 'مسؤول'),
('سمية الحمداوي', 'Soumia Hamdaoui', 'السكرتارية', 'سكرتيرة'),
('يوسف المرابط', 'Youssef Mourabbit', 'تكنولوجيا المعلومات', 'تقني'),
('خديجة الناصري', 'Khadija Nassiri', 'المحفوظات', 'أرشيفية'),
('عبد الله المنصوري', 'Abdellah Mansouri', 'الشؤون القانونية', 'محام'),
('أمينة الحسني', 'Amina Hassani', 'الاستقبال', 'موظفة استقبال');