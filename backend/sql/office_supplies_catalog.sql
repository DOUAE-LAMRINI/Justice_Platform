CREATE TABLE office_supplies_catalog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_fr VARCHAR(100),
    name_en VARCHAR(100),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for office supplies
INSERT INTO office_supplies_catalog (name_ar, name_fr, name_en, category) VALUES
('أقلام', 'Stylos', 'Pens', 'Writing Instruments'),
('أوراق', 'Papier', 'Paper', 'Paper Products'),
('دفاتر', 'Cahiers', 'Notebooks', 'Paper Products'),
('ملفات', 'Dossiers', 'Folders', 'Filing Supplies'),
('حبر طابعة', 'Encre d\'imprimante', 'Printer Ink', 'Printer Supplies'),
('أظرف', 'Enveloppes', 'Envelopes', 'Mailing Supplies'),
('دباسة', 'Agrafeuse', 'Stapler', 'Fastening Tools'),
('مقص', 'Ciseaux', 'Scissors', 'Cutting Tools'),
('لاصق', 'Colle', 'Glue', 'Adhesives'),
('أوراق ملاحظات', 'Papier de note', 'Note Paper', 'Paper Products');