const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Configuration de la connexion MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'justice_contact_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

router.post('/submit', async (req, res) => {
  try {
    console.log('Received form data:', req.body);
    
    const { fullName, email, phone, subject, inquiryType, message } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO contact_submissions 
      (full_name, email, phone, subject, inquiry_type, message, ip_address, user_agent) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName,
        email,
        phone,
        subject,
        inquiryType,
        message,
        req.ip,
        req.body.userAgent
      ]
    );

    console.log('Insert result:', result);
    
    res.status(201).json({
      success: true,
      message: 'تم استلام رسالتك بنجاح',
      submissionId: result.insertId
    });
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم الداخلي'
    });
  }
});

module.exports = router;