const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const excel = require('exceljs');
const PDFDocument = require('pdfkit');



const app = express();
const port = 5000;
const axios = require('axios');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');


const WebSocket = require('ws');
const { createServer } = require('http');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Create HTTP server
const server = createServer(app);

// WebSocket Server Configuration
const wss = new WebSocket.Server({ 
  server,
  path: '/ws',
  clientTracking: true,
  perMessageDeflate: {
    zlibDeflateOptions: { chunkSize: 1024, memLevel: 7, level: 3 },
    zlibInflateOptions: { chunkSize: 10 * 1024 },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    concurrencyLimit: 10,
    threshold: 1024
  }
});
wss.on('error', (error) => {
  console.error('WebSocket Server error:', error);
});


const ALLOWED_ORIGINS = [
  'http://localhost:3000', 
  'http://####:5000', 
  'http://###########'
];
const MAX_CONNECTIONS_PER_IP = 5;
const HEARTBEAT_INTERVAL = 30000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://######:5000', 'http://########'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'justice_platform',
  port: '3306',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('😁 Connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('😒 Database connection error:', err);
  });
  

// State Management
const connectionCounts = {};
const activeClients = new Map();
const sensorDataStore = {
  current: {
    temperature: 0,
    humidity: 0,
    alcohol_level: 0,
    flame_detected: false,
    water_detected: false,
    timestamp: new Date().toISOString()
  },
  history: []
};
// Utility Functions
const isAllowedOrigin = (origin) => ALLOWED_ORIGINS.includes(origin);

const validateSensorData = (data) => {
  return data && 
    typeof data.temperature === 'number' && 
    data.temperature >= -40 && data.temperature <= 100 &&
    typeof data.humidity === 'number' &&
    data.humidity >= 0 && data.humidity <= 100 &&
    typeof data.alcohol_level === 'number' &&
    data.alcohol_level >= 0 && data.alcohol_level <= 5000 &&
    typeof data.flame_detected === 'boolean' &&
    typeof data.water_detected === 'boolean';
};

// WebSocket Connection Handler
wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  const origin = req.headers.origin;
  
  // Origin validation
  if (!isAllowedOrigin(origin)) {
    console.log(`Rejected connection from unauthorized origin: ${origin}`);
    return ws.close(4001, 'Unauthorized origin');
  }

  // Connection limit per IP
  connectionCounts[clientIp] = (connectionCounts[clientIp] || 0) + 1;
  if (connectionCounts[clientIp] > MAX_CONNECTIONS_PER_IP) {
    console.log(`Rejecting connection from ${clientIp} - too many connections`);
    return ws.close(1008, 'Too many connections from your IP');
  }

  const clientId = uuidv4();
  console.log(`New connection from ${clientIp} (ID: ${clientId})`);

  // Client state management
  ws.isAlive = true;
  ws.clientId = clientId;
  ws.clientIp = clientIp;

  // Add to active clients
  activeClients.set(clientId, {
    ws,
    ip: clientIp,
    connectedAt: new Date()
  });

  // Heartbeat handler
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  // Message handler
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Message from client:', data);
      
      if (data.type === 'request_data') {
        ws.send(JSON.stringify({
          type: 'init',
          data: sensorDataStore.current,
          history: sensorDataStore.history.slice(-50)
        }));
      }
    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  });

  // Error handler
  ws.on('error', (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
    cleanupClient(clientId, clientIp);
  });

  // Close handler
  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    cleanupClient(clientId, clientIp);
  });

  // Send initial data
  ws.send(JSON.stringify({
    type: 'init',
    data: sensorDataStore.current,
    history: sensorDataStore.history.slice(-50)
  }));
});

// Cleanup client function
function cleanupClient(clientId, clientIp) {
  activeClients.delete(clientId);
  connectionCounts[clientIp] = (connectionCounts[clientIp] || 1) - 1;
}

// Heartbeat interval
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log(`Terminating inactive connection: ${ws.clientId}`);
      cleanupClient(ws.clientId, ws.clientIp);
      return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping(null, false, (err) => {
      if (err) {
        console.log(`Heartbeat failed for ${ws.clientId}`);
        cleanupClient(ws.clientId, ws.clientIp);
        ws.terminate();
      }
    });
  });
}, HEARTBEAT_INTERVAL);

// Broadcast sensor data to all connected clients
function broadcastSensorData(data) {
  if (!validateSensorData(data)) {
    console.error('Invalid sensor data format');
    return;
  }

  // Update data store
  sensorDataStore.current = {
    ...data,
    timestamp: new Date().toISOString()
  };
  sensorDataStore.history.push(sensorDataStore.current);

  // Broadcast to all clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'sensor_update',
        data: sensorDataStore.current,
        timestamp: new Date().toISOString()
      }));
    }
  });
}

// API IOT Endpoints
app.post('/api/iot/data', (req, res) => {
  try {
    const sensorData = req.body;
    
    if (!validateSensorData(sensorData)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid sensor data format'
      });
    }

    broadcastSensorData(sensorData);
    
    res.json({ 
      success: true,
      message: 'Data received and broadcasted',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error handling sensor data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/iot/history', (req, res) => {
  try {
    const { hours = 24, limit = 100 } = req.query;
    const history = sensorDataStore.history
      .filter(entry => {
        const entryTime = new Date(entry.timestamp).getTime();
        const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
        return entryTime >= cutoffTime;
      })
      .slice(0, limit);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch history'
    });
  }
});
app.get('/api/iot/export', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const history = sensorDataStore.history
      .filter(entry => {
        const entryTime = new Date(entry.timestamp).getTime();
        const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
        return entryTime >= cutoffTime;
      });
    const header = 'Timestamp,Temperature,Humidity,Alcohol Level,Flame Detected,Water Detected\n';
    const csv = history.map(entry => 
      `"${entry.timestamp}","${entry.temperature}","${entry.humidity}","${entry.alcohol_level}","${entry.flame_detected}","${entry.water_detected}"`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sensor_data_export.csv');
    res.send(header + csv);
    
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export data' 
    });
  }
});
async function initializeSensorData() {
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM iot_sensor_data 
      ORDER BY timestamp DESC 
      LIMIT 50
    `);
    
    if (rows.length > 0) {
      const latest = rows[0];
      sensorDataStore.current = {
        temperature: latest.temperature,
        humidity: latest.humidity,
        alcohol_level: latest.alcohol_level,
        flame_detected: Boolean(latest.flame_detected),
        water_detected: Boolean(latest.water_detected),
        timestamp: latest.timestamp
      };
      
      sensorDataStore.history = rows.map(row => ({
        temperature: row.temperature,
        humidity: row.humidity,
        alcohol_level: row.alcohol_level,
        flame_detected: Boolean(row.flame_detected),
        water_detected: Boolean(row.water_detected),
        timestamp: row.timestamp
      }));
    }
  } catch (error) {
    console.error('Error initializing sensor data:', error);
  }
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    websocketClients: wss.clients.size,
    activeConnections: Array.from(activeClients.values()).map(client => ({
      id: client.ws.clientId,
      ip: client.ip,
      connectedAt: client.connectedAt
    }))
  });
});

// Cleanup on server close
server.on('close', () => {
  clearInterval(heartbeatInterval);
  console.log('Server and WebSocket connections closed');
});


  // Admin Authentication Middleware
const authenticateAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [users] = await pool.execute(
      'SELECT id, username, role, permissions, is_active FROM admin_users WHERE id = ? AND is_deleted = FALSE',
      [decoded.userId]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({ success: false, message: 'Account not found or disabled' });
    }

    req.user = {
      ...users[0],
      permissions: JSON.parse(users[0].permissions || '{}')
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Middleware to verify admin permissions
const checkAdminPermissions = (requiredPermission) => {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || {};
    
    // Super admins have all permissions
    if (req.user.role === 'super_admin') return next();
    
    // Check if user has the required permission
    const permission = userPermissions[requiredPermission];
    if (permission && (permission.read || permission.write || permission.execute)) {
      return next();
    }
    
    res.status(403).json({ 
      success: false, 
      message: 'You do not have permission to perform this action' 
    });
  };
};


// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


// Citizen contact endpoint
app.post('/api/contact/submit', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      subject,
      inquiryType,
      message,
      ipAddress,
      userAgent
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO citizen_contact_form 
      (full_name, email, phone, subject, inquiry_type, message, ip_address, user_agent) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [fullName, email, phone, subject, inquiryType, message, ipAddress || null, userAgent || null]
    );

    res.json({ success: true, message: 'تم إرسال النموذج بنجاح' });
  } catch (error) {
    console.error('Insert error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم. حاول مرة أخرى لاحقًا.' });
  }
});

//login
app.post('/api/employee/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [users] = await pool.execute(`
      SELECT 
        id, 
        username, 
        password, 
        role,
        full_name,
        full_name_ar,
        department,
        IFNULL(position, '') as position
      FROM employee_app_users 
      WHERE username = ?`, 
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'اسم المستخدم غير صحيح' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret is not configured');
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        fullName: user.full_name,
        fullNameAr: user.full_name_ar,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    await pool.execute(
      'UPDATE employee_app_users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name || '',
        fullNameAr: user.full_name_ar || '',
        role: user.role,
        department: user.department || '',
        position: user.position || ''
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'حدث خطأ في الخادم' 
    });
  }
});

// Employee current login 
app.get('/api/employee/current', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret is not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [users] = await pool.execute(
      `SELECT 
        id, 
        username, 
        full_name, 
        full_name_ar,
        role,
        department,
        IFNULL(position, '') as position
       FROM employee_app_users 
       WHERE id = ?`,
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false });
    }

    res.json({ 
      success: true, 
      user: users[0] 
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Chefs recommendations endpoint
app.get('/api/chefs/search', async (req, res) => {
  try {
    const { query } = req.query;
    let sql = 'SELECT id, full_name_ar, full_name_fr FROM chefs';
    let params = [];
    
    if (query) {
      sql += ' WHERE full_name_ar LIKE ? OR full_name_fr LIKE ? LIMIT 10';
      params = [`%${query}%`, `%${query}%`];
    } else {
      sql += ' LIMIT 50';
    }
    
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Chefs search error:', err);
    res.status(500).json({ message: 'خطأ في البحث عن المسؤولين' });
  }
});

//Employees recommandations

app.get('/api/employees/search', async (req, res) => {
  try {
    const { query } = req.query;
    const [rows] = await pool.execute(
      `SELECT id, full_name_ar, full_name_fr FROM employees 
       WHERE full_name_ar LIKE ? OR full_name_fr LIKE ? LIMIT 10`,
      [`%${query}%`, `%${query}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error('Employee search error:', err);
    res.status(500).json({ message: 'خطأ في البحث عن الموظفين' });
  }
});

//Supplies recommandations 
app.get('/api/supplies/search', async (req, res) => {
  try {
    const { query } = req.query;
    const [rows] = await pool.execute(
      `SELECT id, name_ar, name_en FROM office_supplies_catalog 
       WHERE name_ar LIKE ? OR name_en LIKE ? LIMIT 10`,
      [`%${query}%`, `%${query}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error('Supplies search error:', err);
    res.status(500).json({ message: 'خطأ في البحث عن الأدوات المكتبية' });
  }
});

// Submit order
app.post('/api/orders/new', upload.any(), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    console.log('Request body:', req.body);
    console.log('Files:', req.files);
    
    // Get user info from JWT
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { notes } = req.body;
    const items = JSON.parse(req.body.items || '[]');

    if (!Array.isArray(items)) {
      return res.status(400).json({ 
        success: false,
        message: 'Items must be an array' 
      });
    }

    await conn.beginTransaction();

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    
    // Insert main order - using authenticated user's name
    const [orderResult] = await conn.execute(
      `INSERT INTO employee_office_orders 
       (order_number, requested_by_name, chef_name, notes) 
       VALUES (?, ?, ?, ?)`,
      [
        orderNumber,
        decoded.fullNameAr || decoded.fullName || 'غير معروف',
        decoded.fullNameAr || decoded.fullName || 'غير معروف',
        notes || null
      ]
    );

    const orderId = orderResult.insertId;

    // Handle file uploads
    const files = req.files || [];
    const fileMap = {};
    files.forEach(file => {
      const match = file.fieldname.match(/proofFile_(\d+)/);
      if (match) {
        fileMap[match[1]] = file.path;
      }
    });

    // Insert items
    for (const [index, item] of items.entries()) {
      await conn.execute(
        `INSERT INTO order_items 
         (order_id, item_name, quantity, unit, employee_name, reason,
          is_new_employee, is_transferred, is_broken, proof_file_path, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.name,
          item.quantity,
          item.unit || 'piece',
          item.employeeName || 'غير محدد', // Employee name is now optional
          item.reason || 'other',
          item.isNewEmployee ? 1 : 0,
          item.isTransferred ? 1 : 0,
          item.isBroken ? 1 : 0,
          fileMap[index] || null,
          item.notes || null
        ]
      );
    }

    await conn.commit();
    
    res.json({ 
      success: true, 
      message: 'تم تقديم الطلب بنجاح',
      orderNumber 
    });

  } catch (error) {
    await conn.rollback();
    console.error('Order submission error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'فشل في تقديم الطلب'
    });
  } finally {
    conn.release();
  }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT 
        o.id,
        o.order_number,
        o.requested_by_name AS employee_name,
        o.chef_name,
        DATE_FORMAT(o.order_date, '%Y-%m-%d %H:%i:%s') AS order_date,
        o.status,
        o.notes,
        GROUP_CONCAT(i.item_name SEPARATOR ', ') AS items_list,
        COUNT(i.id) AS items_count
      FROM 
        employee_office_orders o
      LEFT JOIN 
        order_items i ON o.id = i.order_id
      GROUP BY o.id
      ORDER BY o.order_date DESC
    `);

    // Map status to Arabic
    const statusMap = {
      'pending': 'قيد المعالجة',
      'approved': 'تم الموافقة', 
      'rejected': 'تم الرفض',
      'fulfilled': 'تم التسليم'
    };

    const formattedOrders = orders.map(order => ({
      ...order,
      status: statusMap[order.status] || order.status,
      order_date: new Date(order.order_date).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }));

    res.json(formattedOrders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ 
      success: false,
      message: 'فشل في جلب الطلبات',
      error: err.message  
    });
  }
});

//  order status endpoint
app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ 
      success: false,
      message: 'يجب توفير الحالة الجديدة' 
    });
  }

  // Reverse mapping for status
  const statusMap = {
    'قيد المعالجة': 'pending',
    'تم الموافقة': 'approved',
    'تم الرفض': 'rejected',
    'تم التسليم': 'fulfilled'
  };

  const dbStatus = statusMap[status] || status;

  try {
    const [result] = await pool.execute(
      'UPDATE employee_office_orders SET status = ? WHERE id = ?',
      [dbStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'لم يتم العثور على الطلب' 
      });
    }

    res.json({ 
      success: true, 
      message: 'تم تحديث الحالة بنجاح',
      newStatus: status
    });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ 
      success: false,
      message: 'فشل في تحديث الحالة',
      error: err.message
    });
  }
});

// Employee rating endpoint
app.post('/api/employee/rating', async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (typeof rating !== 'number' || isNaN(rating)) {
      return res.status(400).json({
        success: false,
        message: 'التقييم يجب أن يكون رقماً'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'يجب أن يكون التقييم بين 1 و 5'
      });
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const [result] = await pool.execute(
      `INSERT INTO employee_ratings (rating, comment, ip_address, user_agent)
       VALUES (?, ?, ?, ?)`,
      [rating, comment || null, ipAddress || null, userAgent || null]
    );

    res.json({ 
      success: true, 
      message: 'تم إرسال التقييم بنجاح' 
    });
  } catch (error) {
    console.error('Rating submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم. حاول مرة أخرى لاحقًا.' 
    });
  }
});


// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  try {
    // Check if IP/username is blocked
    const [attempts] = await pool.execute(
      `SELECT * FROM admin_login_attempts 
       WHERE (ip_address = ? OR username = ?) 
       AND is_blocked = TRUE 
       AND blocked_until > NOW()`,
      [ip, username]
    );

    if (attempts.length > 0) {
      const blockedUntil = new Date(attempts[0].blocked_until);
      const secondsLeft = Math.ceil((blockedUntil - new Date()) / 1000);
      
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts',
        blocked: true,
        blockTimeLeft: secondsLeft
      });
    }

    // Find admin user
    const [users] = await pool.execute(
      `SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE AND is_deleted = FALSE`,
      [username]
    );

    if (users.length === 0) {
      await recordFailedAttempt(ip, username);
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      await recordFailedAttempt(ip, username);
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Reset failed attempts on successful login
    await pool.execute(
      `DELETE FROM admin_login_attempts 
       WHERE ip_address = ? OR username = ?`,
      [ip, username]
    );

    // Update last login
    await pool.execute(
      `UPDATE admin_users SET last_login = NOW() WHERE id = ?`,
      [user.id]
    );

    // Create token
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
});

// Helper function to record failed attempts
async function recordFailedAttempt(ip, username) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check existing attempts
    const [existing] = await conn.execute(
      `SELECT * FROM admin_login_attempts 
       WHERE (ip_address = ? OR username = ?)`,
      [ip, username]
    );

    if (existing.length > 0) {
      const attempt = existing[0];
      const newAttempts = attempt.attempts + 1;
      let isBlocked = attempt.is_blocked;
      let blockedUntil = attempt.blocked_until;

      // Block after 3 attempts for 20 seconds
      if (newAttempts >= 3) {
        isBlocked = true;
        blockedUntil = new Date(Date.now() + 20000); // 20 seconds from now
      }

      await conn.execute(
        `UPDATE admin_login_attempts 
         SET attempts = ?, last_attempt = NOW(), 
             is_blocked = ?, blocked_until = ?
         WHERE id = ?`,
        [newAttempts, isBlocked, blockedUntil, attempt.id]
      );
    } else {
      await conn.execute(
        `INSERT INTO admin_login_attempts 
         (ip_address, username, attempts, last_attempt) 
         VALUES (?, ?, 1, NOW())`,
        [ip, username]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    console.error('Error recording failed attempt:', err);
  } finally {
    conn.release();
  }
}

app.post('/api/admin/logout', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    console.log('Headers:', req.headers); // Log incoming headers
    console.log('Authorization header:', req.headers.authorization);

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }

    console.log('Token received:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    console.log('Logging logout for admin:', decoded.userId);

    await conn.execute(
      `INSERT INTO admin_logout_logs 
       (admin_id, ip_address, user_agent) 
       VALUES (?, ?, ?)`,
      [decoded.userId, ipAddress, userAgent]
    );

    console.log('Logout logged successfully');

    res.json({ 
      success: true,
      message: 'Déconnexion réussie'
    });

  } catch (error) {
    console.error('Detailed logout error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      console.log('JWT Error:', error.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Token invalide',
        details: error.message 
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion',
      error: error.message
    });
  } finally {
    conn.release();
  }
});

// logout_logs
app.get('/api/admin/logout-logs', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const [logs] = await pool.execute(
      `SELECT l.*, u.username, u.full_name 
       FROM admin_logout_logs l
       JOIN admin_users u ON l.admin_id = u.id
       ORDER BY l.logout_time DESC
       LIMIT 100`
    );

    res.json({
      success: true,
      logs: logs.map(log => ({
        ...log,
        logout_time: new Date(log.logout_time).toISOString()
      }))
    });

  } catch (error) {
    console.error('Error fetching logout logs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des logs'
    });
  }
});




// Get all admin users (only for super admin)
app.get('/api/admin/users', authenticateAdmin, checkAdminPermissions('users'), async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, username, full_name, email, role, is_active, last_login, created_at, permissions, is_deleted, deleted_at 
      FROM admin_users WHERE is_deleted = FALSE`);

    // Parse permissions JSON string
    const formattedUsers = users.map(user => ({
      ...user,
      permissions: JSON.parse(user.permissions || '{}'),
      last_login: user.last_login ? new Date(user.last_login).toISOString() : null,
      created_at: new Date(user.created_at).toISOString()
    }));

    res.json({ 
      success: true, 
      users: formattedUsers 
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
});

// Create new admin user
app.post('/api/admin/users', authenticateAdmin, checkAdminPermissions('users'), async (req, res) => {
  try {
    const { username, full_name, email, password, role, permissions } = req.body;

    // Validate input
    if (!username || !full_name || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Check if username exists
    const [existing] = await pool.execute(
      'SELECT id FROM admin_users WHERE username = ?',
      [username]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default permissions based on role if not provided
    let finalPermissions = permissions;
    if (!permissions) {
      if (role === 'messages_manager') {
        finalPermissions = {
          dashboard: { read: true, write: false, execute: false },
          messages: { read: true, write: true, execute: true },
          ratings: { read: true, write: true, execute: true },
          analytics: { read: true, write: false, execute: false }
        };
      } else if (role === 'inventory_manager') {
        finalPermissions = {
          dashboard: { read: true, write: false, execute: false },
          inventory: { read: true, write: true, execute: true },
          analytics: { read: true, write: false, execute: false }
        };
      }
    }

    // Insert new user
    const [result] = await pool.execute(
      `INSERT INTO admin_users 
       (username, full_name, email, password, role, permissions, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [
        username,
        full_name,
        email || null,
        hashedPassword,
        role,
        JSON.stringify(finalPermissions || {})
      ]
    );

    // Get the newly created user
    const [newUser] = await pool.execute(
      'SELECT * FROM admin_users WHERE id = ?',
      [result.insertId]
    );

    res.json({ 
      success: true, 
      message: 'User created successfully',
      user: {
        ...newUser[0],
        permissions: JSON.parse(newUser[0].permissions || '{}')
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create user' 
    });
  }
});

// Update admin user
app.put('/api/admin/users/:id', authenticateAdmin, checkAdminPermissions('users'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, full_name, email, password, role, permissions, is_active } = req.body;

    // Get current user
    const [users] = await pool.execute(
      'SELECT * FROM admin_users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const currentUser = users[0];
    const currentPermissions = JSON.parse(currentUser.permissions || '{}');

    // Only super admin can modify other super admins
    if (currentUser.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot modify super admin' 
      });
    }

    // Prepare update data
    const updateData = {
      username: username || currentUser.username,
      full_name: full_name || currentUser.full_name,
      email: email !== undefined ? email : currentUser.email,
      role: role || currentUser.role,
      permissions: permissions ? JSON.stringify(permissions) : currentUser.permissions,
      is_active: is_active !== undefined ? is_active : currentUser.is_active
    };

    // Update password if provided
    let passwordUpdate = '';
    let passwordParams = [];
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      passwordUpdate = ', password = ?';
      passwordParams = [hashedPassword];
    }

    // Execute update
    await pool.execute(
      `UPDATE admin_users SET
       username = ?, full_name = ?, email = ?, role = ?,
       permissions = ?, is_active = ?${passwordUpdate}
       WHERE id = ?`,
      [
        updateData.username,
        updateData.full_name,
        updateData.email,
        updateData.role,
        updateData.permissions,
        updateData.is_active,
        ...passwordParams,
        userId
      ]
    );

    // Get updated user
    const [updatedUser] = await pool.execute(
      'SELECT * FROM admin_users WHERE id = ?',
      [userId]
    );

    res.json({ 
      success: true, 
      message: 'User updated successfully',
      user: {
        ...updatedUser[0],
        permissions: JSON.parse(updatedUser[0].permissions || '{}')
      }
    });
  } catch (error) {
    console.error('Error updating admin user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user' 
    });
  }
});


//Deletting user endpoint 
app.delete('/api/admin/users/:id', authenticateAdmin, checkAdminPermissions('users'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const userId = req.params.id;

    // 1. Verify user exists and isn't already deleted
    const [user] = await conn.execute(
      'SELECT id, role FROM admin_users WHERE id = ? AND is_deleted = FALSE',
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found or already deleted' 
      });
    }

    // 2. Prevent deleting super admins unless it's another super admin
    if (user[0].role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only super admins can deactivate other super admins' 
      });
    }

    // 3. Prevent deleting yourself
    if (user[0].id === req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You cannot deactivate your own account' 
      });
    }

    // 4. Soft delete the user
    await conn.execute(
      `UPDATE admin_users 
       SET is_deleted = TRUE, deleted_at = NOW()
       WHERE id = ?`,
      [userId]
    );

    await conn.commit();
    
    res.json({ 
      success: true, 
      message: 'User deactivated successfully' 
    });

  } catch (error) {
    await conn.rollback();
    console.error('Soft delete error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to deactivate user',
      error: error.message 
    });
  } finally {
    conn.release();
  }
});

// Get deleted users endpoint 
app.get('/api/admin/users/deleted', authenticateAdmin, checkAdminPermissions('users'), async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, username, full_name, email, role, 
       DATE_FORMAT(deleted_at, '%Y-%m-%d %H:%i:%s') as deleted_at 
       FROM admin_users 
       WHERE is_deleted = TRUE
       ORDER BY deleted_at DESC`
    );
    
    res.json({ 
      success: true, 
      users: users.map(u => ({
        ...u,
        deleted_at: u.deleted_at ? new Date(u.deleted_at).toISOString() : null
      }))
    });
  } catch (error) {
    console.error('Error fetching deleted users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch deleted users',
      error: error.message 
    });
  }
});

// Restore deactivated user
app.post('/api/admin/users/:id/restore', authenticateAdmin, checkAdminPermissions('users'), async (req, res) => {
  try {
    const [result] = await pool.execute(
      `UPDATE admin_users 
       SET is_deleted = FALSE, deleted_at = NULL
       WHERE id = ? AND is_deleted = TRUE`,
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found or not deleted' });
    }
    
    res.json({ success: true, message: 'User restored successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to restore user' });
  }
});

// This would run daily
app.get('/api/admin/cleanup-users', async (req, res) => {
  try {
    await pool.execute(
      `DELETE FROM admin_users 
       WHERE is_deleted = TRUE 
       AND deleted_at < DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ success: false });
  }
});

// Password reset route
app.post('/api/admin/users/:id/reset-password', authenticateAdmin, checkAdminPermissions('users'), async (req, res) => {
  try {
    const userId = req.params.id;

    // Get user
    const [users] = await pool.execute(
      'SELECT * FROM admin_users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = users[0];

    // Generate new password (username + 123)
    const newPassword = user.username + '123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.execute(
      'UPDATE admin_users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ 
      success: true, 
      message: 'Password reset successfully',
      // Only return password to super admin
      newPassword: req.user.role === 'super_admin' ? newPassword : undefined
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password' 
    });
  }
});

// Get current admin user
app.get('/api/admin/current', authenticateAdmin, async (req, res) => {
  try {
    // Get fresh data from database
    const [users] = await pool.execute(
      'SELECT id, username, full_name, email, role, permissions FROM admin_users WHERE id = ? AND is_deleted = FALSE',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = users[0];
    
    res.json({
      success: true,
      user: {
        ...user,
        permissions: JSON.parse(user.permissions || '{}')
      }
    });
  } catch (error) {
    console.error('Error fetching current admin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user data' 
    });
  }
});

// Get all employee users
app.get('/api/admin/employee-users', authenticateAdmin, checkAdminPermissions('users'), async (req, res) => {
  
  try {
    const [users] = await pool.execute(
      `SELECT id, username, full_name, full_name_ar, department, position, role, 
       is_active, last_login, created_at, status
       FROM employee_app_users 
       WHERE is_deleted = FALSE`
    );
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching employee users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch employee users' });
  }
});

app.get('/api/admin/employee-users/deleted', authenticateAdmin, checkAdminPermissions('users'), async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, username, full_name, full_name_ar, department, position, role, 
       DATE_FORMAT(deleted_at, '%Y-%m-%d %H:%i:%s') as deleted_at 
       FROM employee_app_users 
       WHERE is_deleted = TRUE
       ORDER BY deleted_at DESC`
    );
    res.json({ 
      success: true, 
      users 
    });
  } catch (error) {
    console.error('Error fetching deleted employee users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch deleted employee users' });
  }
});

app.post('/api/admin/employee-users', authenticateAdmin, checkAdminPermissions('users'), async (req, res) => {
  try {
    const { username, full_name, full_name_ar, department, position, password, role } = req.body;

    if (!username || !full_name || !full_name_ar || !department || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM employee_app_users WHERE username = ?',
      [username]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.execute(
      `INSERT INTO employee_app_users 
       (username, full_name, full_name_ar, department, position, password, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [username, full_name, full_name_ar, department, position || null, hashedPassword, role || 'employee']
    );

    const [newUser] = await pool.execute(
      'SELECT * FROM employee_app_users WHERE id = ?',
      [result.insertId]
    );

    res.json({ success: true, message: 'Employee created successfully', user: newUser[0] });
  } catch (error) {
    console.error('Error creating employee user:', error);
    res.status(500).json({ success: false, message: 'Failed to create employee' });
  }
});

// Update employee user
app.put('/api/admin/employee-users/:id', authenticateAdmin, checkAdminPermissions('users'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, full_name, full_name_ar, department, position, password, role } = req.body;

    const [users] = await pool.execute(
      'SELECT * FROM employee_app_users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const updateData = {
      username: username || users[0].username,
      full_name: full_name || users[0].full_name,
      full_name_ar: full_name_ar || users[0].full_name_ar,
      department: department || users[0].department,
      position: position !== undefined ? position : users[0].position,
      role: role || users[0].role
    };

    let passwordUpdate = '';
    let passwordParams = [];
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      passwordUpdate = ', password = ?';
      passwordParams = [hashedPassword];
    }

    await pool.execute(
      `UPDATE employee_app_users SET
       username = ?, full_name = ?, full_name_ar = ?, department = ?,
       position = ?, role = ?${passwordUpdate}
       WHERE id = ?`,
      [
        updateData.username,
        updateData.full_name,
        updateData.full_name_ar,
        updateData.department,
        updateData.position,
        updateData.role,
        ...passwordParams,
        userId
      ]
    );

    const [updatedUser] = await pool.execute(
      'SELECT * FROM employee_app_users WHERE id = ?',
      [userId]
    );

    res.json({ success: true, message: 'Employee updated successfully', employee: updatedUser[0] });
  } catch (error) {
    console.error('Error updating employee user:', error);
    res.status(500).json({ success: false, message: 'Failed to update employee' });
  }
});

// Soft delete employee user
app.delete('/api/admin/employee-users/:id', authenticateAdmin, checkAdminPermissions('users'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const userId = req.params.id;

    const [user] = await conn.execute(
      'SELECT id, role FROM employee_app_users WHERE id = ? AND is_deleted = FALSE',
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found or already deactivated' });
    }

    await conn.execute(
      `UPDATE employee_app_users 
       SET is_deleted = TRUE, deleted_at = NOW()
       WHERE id = ?`,
      [userId]
    );

    await conn.commit();
    
    res.json({ success: true, message: 'Employee deactivated successfully' });
  } catch (error) {
    await conn.rollback();
    console.error('Soft delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to deactivate employee' });
  } finally {
    conn.release();
  }
});

// Restore employee user
app.post('/api/admin/employee-users/:id/restore', authenticateAdmin, checkAdminPermissions('users'), async (req, res) => {
  try {
    const [result] = await pool.execute(
      `UPDATE employee_app_users 
       SET is_deleted = FALSE, deleted_at = NULL
       WHERE id = ? AND is_deleted = TRUE`,
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found or not deactivated' });
    }
    
    res.json({ success: true, message: 'Employee restored successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to restore employee' });
  }
});

// Reset employee password
app.post('/api/admin/employee-users/:id/reset-password', authenticateAdmin, checkAdminPermissions('users'), async (req, res) => {
  try {
    const userId = req.params.id;

    const [users] = await pool.execute(
      'SELECT username FROM employee_app_users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const newPassword = users[0].username + '123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.execute(
      'UPDATE employee_app_users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ 
      success: true, 
      message: 'Password reset successfully',
      newPassword: newPassword
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

// Status mapping object (consistent across all endpoints)
const statusMap = {
  // English to Arabic
  'pending': 'قيد المعالجة',
  'approved': 'تم الموافقة', 
  'rejected': 'تم الرفض',
  'fulfilled': 'تم التسليم',
  // Arabic to Arabic (for consistency)
  'قيد المعالجة': 'قيد المعالجة',
  'تم الموافقة': 'تم الموافقة',
  'تم الرفض': 'تم الرفض',
  'تم التسليم': 'تم التسليم'
};

// Get all orders with enhanced query
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, search } = req.query;
    const offset = (page - 1) * pageSize;
    
    let query = `
      SELECT 
        o.id,
        o.order_number,
        o.requested_by_name,
        o.status,
        DATE_FORMAT(o.order_date, '%Y-%m-%d %H:%i:%s') as order_date,
        COUNT(i.id) as items_count
      FROM employee_office_orders o
      LEFT JOIN order_items i ON o.id = i.order_id
    `;
    
    let countQuery = 'SELECT COUNT(*) as total FROM employee_office_orders o';
    const params = [];
    const countParams = [];
    
    // Add filters
    if (status) {
      query += ' WHERE o.status = ?';
      countQuery += ' WHERE o.status = ?';
      params.push(status);
      countParams.push(status);
    }
    
    if (search) {
      const searchParam = `%${search}%`;
      const whereClause = status ? ' AND' : ' WHERE';
      query += `${whereClause} (o.order_number LIKE ? OR o.requested_by_name LIKE ?)`;
      countQuery += `${whereClause} (o.order_number LIKE ? OR o.requested_by_name LIKE ?)`;
      params.push(searchParam, searchParam);
      countParams.push(searchParam, searchParam);
    }
    
    query += ' GROUP BY o.id ORDER BY o.order_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);
    
    const [[orders], [[count]]] = await Promise.all([
      pool.execute(query, params),
      pool.execute(countQuery, countParams)
    ]);
    
    res.json({
      success: true,
      orders: orders.map(order => ({
        ...order,
        status: statusMap[order.status] || order.status
      })),
      pagination: {
        total: count.total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count.total / pageSize)
      }
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders'
    });
  }
});

// Update order status with enhanced response
app.put('/api/admin/orders/:id/status', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  try {
    // Validate status
    if (!statusMap[status]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const dbStatus = statusMap[status];

    // Update order with transaction for data consistency
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      await conn.execute(
        'UPDATE employee_office_orders SET status = ?, rejection_reason = ? WHERE id = ?',
        [dbStatus, rejectionReason || null, id]
      );

      // Get updated order with all details
      const [updatedOrder] = await conn.execute(
        `SELECT 
          o.*,
          DATE_FORMAT(o.order_date, '%Y-%m-%d %H:%i:%s') AS formatted_date
         FROM employee_office_orders o
         WHERE id = ?`, 
        [id]
      );
      
      const [items] = await conn.execute(
        'SELECT * FROM order_items WHERE order_id = ?',
        [id]
      );

      await conn.commit();

      if (updatedOrder.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found after update' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Order status updated',
        order: {
          ...updatedOrder[0],
          status: dbStatus, // Return the Arabic status
          status_key: Object.keys(statusMap).find(key => statusMap[key] === dbStatus) // Return English key
        },
        items
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order',
      error: error.message 
    });
  }
});

// Get single order details with enhanced query
app.get('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [order] = await pool.execute(
      `SELECT 
        o.*,
        DATE_FORMAT(o.order_date, '%Y-%m-%d %H:%i:%s') AS formatted_date
       FROM employee_office_orders o
       WHERE id = ?`, 
      [id]
    );
    
    if (order.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    const [items] = await pool.execute(
      'SELECT * FROM order_items WHERE order_id = ?',
      [id]
    );

    // Add status key (English) for frontend
    const statusKey = Object.keys(statusMap).find(key => statusMap[key] === order[0].status);
    
    res.json({ 
      success: true, 
      order: {
        ...order[0],
        status_key: statusKey || order[0].status
      },
      items 
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order details',
      error: error.message 
    });
  }
});

// Get all employee ratings with statistics
app.get('/api/admin/ratings', authenticateAdmin, async (req, res) => {
  try {
    const { rating, startDate, endDate, search } = req.query;
    
    // Base query
    let query = 'SELECT * FROM employee_ratings WHERE 1=1';
    const params = [];
    
    // Add filters
    if (rating) {
      query += ' AND rating = ?';
      params.push(rating);
    }
    
    if (startDate && endDate) {
      query += ' AND created_at BETWEEN ? AND ?';
      params.push(startDate, endDate + ' 23:59:59');
    }
    
    if (search) {
      query += ' AND (comment LIKE ? OR ip_address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    // Get filtered ratings
    const [ratings] = await pool.execute(query, params);
    
    // Calculate statistics
    const [stats] = await pool.execute(`
      SELECT 
        AVG(rating) as average,
        COUNT(*) as total,
        SUM(rating = 1) as one_star,
        SUM(rating = 2) as two_star,
        SUM(rating = 3) as three_star,
        SUM(rating = 4) as four_star,
        SUM(rating = 5) as five_star
      FROM employee_ratings
    `);
    
    res.json({
      success: true,
      ratings,
      stats: {
        average: parseFloat(stats[0].average) || 0,
        total: stats[0].total || 0,
        starCounts: [
          stats[0].one_star || 0,
          stats[0].two_star || 0,
          stats[0].three_star || 0,
          stats[0].four_star || 0,
          stats[0].five_star || 0
        ]
      }
    });
    
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch ratings' 
    });
  }
});

// Export ratings as CSV
app.get('/api/admin/ratings/export', authenticateAdmin, async (req, res) => {
  try {
    const [ratings] = await pool.execute(`
      SELECT 
        rating,
        comment,
        ip_address,
        user_agent,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as date
      FROM employee_ratings
      ORDER BY created_at DESC
    `);
    
    // Convert to CSV
    const header = ['Rating', 'Comment', 'IP Address', 'User Agent', 'Date'].join(',');
    const csv = ratings.map(r => 
      `"${r.rating}","${r.comment || ''}","${r.ip_address || ''}","${r.user_agent || ''}","${r.date}"`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=employee_ratings_export.csv');
    res.send(header + '\n' + csv);
    
  } catch (error) {
    console.error('Error exporting ratings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export ratings' 
    });
  }
});

// Get all messages with filters
app.get('/api/admin/messages', authenticateAdmin, async (req, res) => {
  console.log('Messages endpoint accessed'); // Debug log
  try {
    const { status, search, startDate, endDate } = req.query;
    
    let query = 'SELECT * FROM citizen_contact_form WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (search) {
      query += ' AND (full_name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (startDate && endDate) {
      query += ' AND created_at BETWEEN ? AND ?';
      params.push(startDate, endDate + ' 23:59:59');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [messages] = await pool.execute(query, params);
    
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(status = 'new') as new,
        SUM(status = 'pending') as pending,
        SUM(status = 'replied') as replied
      FROM citizen_contact_form
    `);
    
    res.json({
      success: true,
      messages,
      stats: {
        total: stats[0].total || 0,
        new: stats[0].new || 0,
        pending: stats[0].pending || 0,
        replied: stats[0].replied || 0
      }
    });
  } catch (error) {
    console.error('Error in /api/admin/messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch messages',
      error: error.message 
    });
  }
});
// Update message status
app.put('/api/admin/messages/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await pool.execute(
      'UPDATE citizen_contact_form SET status = ? WHERE id = ?',
      [status, id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update status' 
    });
  }
});
    
// email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email template function
const createEmailTemplate = (message, reply, adminName) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; direction: rtl; text-align: right;">
      <h2 style="color: #1a5276;">رد على استفسارك</h2>
      <p>السادة/ ${message.full_name}،</p>
      
      <p>نشكركم على تواصلكم مع منصة العدالة. فيما يلي ردنا على استفساركم:</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-right: 4px solid #1a5276; margin: 15px 0;">
        <p><strong>موضوع الاستفسار:</strong> ${message.subject}</p>
        <p><strong>رسالتكم:</strong></p>
        <p>${message.message}</p>
      </div>
      
      <div style="background: #e8f4fc; padding: 15px; border-right: 4px solid #3498db; margin: 15px 0;">
        <p><strong>ردنا:</strong></p>
        <p>${reply.content}</p>
        <p style="font-size: 0.9em; color: #555;">
          - ${adminName}<br>
          فريق منصة العدالة
        </p>
      </div>
      
      <p>يمكنكم الرد على هذا البريد في حال كان لديكم أي استفسارات إضافية.</p>
      
      <p style="margin-top: 30px; font-size: 0.9em; color: #777;">
        هذا الرد مرسل آلياً، يرجى عدم الرد على هذا البريد الإلكتروني.
      </p>
    </div>
  `;
};

// Send reply to message with email
app.post('/api/admin/messages/:id/reply', authenticateAdmin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const { id } = req.params;
    const { content } = req.body;
    const adminId = req.user.id;
        const [message] = await conn.execute(
      'SELECT * FROM citizen_contact_form WHERE id = ?',
      [id]
    );
    
    if (message.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }
    const [admin] = await conn.execute(
      'SELECT full_name FROM admin_users WHERE id = ?',
      [adminId]
    );
    
    const adminName = admin[0]?.full_name || 'Administrator';
    
    const [replyResult] = await conn.execute(
      `INSERT INTO message_replies 
       (message_id, admin_id, content) 
       VALUES (?, ?, ?)`,
      [id, adminId, content]
    );
    
    await conn.execute(
      'UPDATE citizen_contact_form SET status = "replied" WHERE id = ?',
      [id]
    );
    
    await conn.commit();
    
    // 5. Send email
    try {
      const mailOptions = {
        from: `"منصة العدالة" <${process.env.EMAIL_FROM}>`,
        to: message[0].email,
        subject: `رد على استفسارك: ${message[0].subject}`,
        html: createEmailTemplate(message[0], { content }, adminName)
      };
      
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }
    
    res.json({ 
      success: true,
      message: 'Reply sent successfully'
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error sending reply:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send reply' 
    });
  } finally {
    conn.release();
  }
});

// Inventory management routes
app.get('/inventory', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search, category, status, dateFrom, dateTo } = req.query;
    const offset = (page - 1) * pageSize;

    let query = `
      SELECT * FROM inventory_items 
      WHERE is_deleted = FALSE
    `;
    let countQuery = `SELECT COUNT(*) as total FROM inventory_items WHERE is_deleted = FALSE`;
    const params = [];
    const countParams = [];

    if (search) {
      query += ' AND (name LIKE ? OR barcode LIKE ? OR description LIKE ?)';
      countQuery += ' AND (name LIKE ? OR barcode LIKE ? OR description LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam);
    }

    if (category) {
      query += ' AND category = ?';
      countQuery += ' AND category = ?';
      params.push(category);
      countParams.push(category);
    }

    if (status) {
      query += ' AND status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }

    if (dateFrom && dateTo) {
      query += ' AND updated_at BETWEEN ? AND ?';
      countQuery += ' AND updated_at BETWEEN ? AND ?';
      params.push(dateFrom, dateTo + ' 23:59:59');
      countParams.push(dateFrom, dateTo + ' 23:59:59');
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    const [[inventory], [[count]]] = await Promise.all([
      pool.execute(query, params),
      pool.execute(countQuery, countParams)
    ]);

    res.json({
      success: true,
      inventory,
      total: count.total
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory' });
  }
});

//Get inventory statistics
app.get('/inventory/stats', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as totalItems,
        SUM(price * quantity) as totalValue,
        SUM(CASE WHEN status = 'low_stock' THEN 1 ELSE 0 END) as lowStock,
        SUM(CASE WHEN status = 'out_of_stock' THEN 1 ELSE 0 END) as outOfStock
      FROM inventory_items
      WHERE is_deleted = FALSE
    `);

    res.json({
      success: true,
      stats: {
        totalItems: stats[0].totalItems || 0,
        totalValue: stats[0].totalValue || 0,
        lowStock: stats[0].lowStock || 0,
        outOfStock: stats[0].outOfStock || 0
      }
    });
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

//Get all categories
app.get('/inventory/categories', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT DISTINCT category FROM inventory_items WHERE is_deleted = FALSE ORDER BY category'
    );
    res.json({
      success: true,
      categories: categories.map(c => c.category)
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

//Get all suppliers
app.get('/inventory/suppliers', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  try {
    const [suppliers] = await pool.execute(
      'SELECT DISTINCT supplier FROM inventory_items WHERE supplier IS NOT NULL AND is_deleted = FALSE ORDER BY supplier'
    );
    res.json({
      success: true,
      suppliers: suppliers.map(s => s.supplier).filter(Boolean)
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch suppliers' });
  }
});

//Get single inventory item
app.get('/inventory/:id', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  try {
    const [items] = await pool.execute(
      'SELECT * FROM inventory_items WHERE id = ? AND is_deleted = FALSE',
      [req.params.id]
    );

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({
      success: true,
      item: items[0]
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch item' });
  }
});

//Create new inventory item
app.post('/inventory', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      name, category, barcode = null, quantity,
      price, min_stock_level = 0, location = null,
      status = 'in_stock', supplier = null, description = null
    } = req.body;

    // Validate required fields
    if (!name || !category || quantity === undefined || price === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: name, category, quantity, or price' 
      });
    }

    const [result] = await conn.execute(
      `INSERT INTO inventory_items 
       (name, category, barcode, quantity, price, 
        min_stock_level, location, status, supplier, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, 
        category, 
        barcode, 
        quantity, 
        price,
        min_stock_level, 
        location, 
        status, 
        supplier, 
        description
      ]
    );

    await conn.execute(
      `INSERT INTO inventory_history 
       (item_id, user_id, action, details, new_quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [result.insertId, req.user.id, 'create', 'Item created', quantity]
    );

    await conn.commit();

    res.json({
      success: true,
      message: 'Item created successfully',
      itemId: result.insertId
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error creating inventory item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create item',
      error: error.message 
    });
  } finally {
    conn.release();
  }
});

//Update inventory item
app.put('/inventory/:id', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const itemId = req.params.id;
    const {
      name, category, barcode, quantity,
      price, min_stock_level, location,
      status, supplier, description
    } = req.body;

    // Get current item data
    const [currentItem] = await conn.execute(
      'SELECT * FROM inventory_items WHERE id = ?',
      [itemId]
    );

    if (currentItem.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Update item
    await conn.execute(
      `UPDATE inventory_items SET
       name = ?, category = ?, barcode = ?, quantity = ?,
       price = ?, min_stock_level = ?, location = ?,
       status = ?, supplier = ?, description = ?
       WHERE id = ?`,
      [name, category, barcode, quantity,
       price, min_stock_level, location,
       status, supplier, description, itemId]
    );

    // Log changes
    let changes = [];
    if (currentItem[0].name !== name) changes.push(`name changed from "${currentItem[0].name}" to "${name}"`);
    if (currentItem[0].category !== category) changes.push(`category changed from "${currentItem[0].category}" to "${category}"`);
    if (currentItem[0].quantity !== quantity) changes.push(`quantity changed from ${currentItem[0].quantity} to ${quantity}`);
    if (currentItem[0].price !== price) changes.push(`price changed from ${currentItem[0].price} to ${price}`);

    if (changes.length > 0) {
      await conn.execute(
        `INSERT INTO inventory_history 
         (item_id, user_id, action, details, previous_quantity, new_quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [itemId, req.user.id, 'update', changes.join(', '), currentItem[0].quantity, quantity]
      );
    }

    await conn.commit();

    res.json({
      success: true,
      message: 'Item updated successfully'
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error updating inventory item:', error);
    res.status(500).json({ success: false, message: 'Failed to update item' });
  } finally {
    conn.release();
  }
});

//Delete inventory item (soft delete)
app.delete('/inventory/:id', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const itemId = req.params.id;

    // Get item before deletion
    const [item] = await conn.execute(
      'SELECT * FROM inventory_items WHERE id = ?',
      [itemId]
    );

    if (item.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Soft delete item
    await conn.execute(
      'UPDATE inventory_items SET is_deleted = TRUE WHERE id = ?',
      [itemId]
    );

    // Log deletion
    await conn.execute(
      `INSERT INTO inventory_history 
       (item_id, user_id, action, details, previous_quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [itemId, req.user.id, 'delete', 'Item deleted', item[0].quantity]
    );

    await conn.commit();

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ success: false, message: 'Failed to delete item' });
  } finally {
    conn.release();
  }
});

//Get item history
app.get('/inventory/:id/history', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  try {
    const [history] = await pool.execute(`
      SELECT 
        h.*,
        u.username as user_name
      FROM inventory_history h
      LEFT JOIN admin_users u ON h.user_id = u.id
      WHERE h.item_id = ?
      ORDER BY h.timestamp DESC
      LIMIT 50
    `, [req.params.id]);

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error fetching item history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

//Bulk delete items
app.post('/inventory/bulk-delete', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid item IDs' });
    }

    // Get items before deletion for history
    const [items] = await conn.execute(
      'SELECT * FROM inventory_items WHERE id IN (?)',
      [ids]
    );

    // Soft delete items
    await conn.execute(
      'UPDATE inventory_items SET is_deleted = TRUE WHERE id IN (?)',
      [ids]
    );

    // Log deletions
    for (const item of items) {
      await conn.execute(
        `INSERT INTO inventory_history 
         (item_id, user_id, action, details, previous_quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [item.id, req.user.id, 'delete', 'Bulk deletion', item.quantity]
      );
    }

    await conn.commit();

    res.json({
      success: true,
      message: `${ids.length} items deleted successfully`
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error bulk deleting items:', error);
    res.status(500).json({ success: false, message: 'Failed to delete items' });
  } finally {
    conn.release();
  }
});

//Export to Excel
app.get('/inventory/export/excel', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  try {
    const [inventory] = await pool.execute(`
      SELECT 
        name, category, barcode, quantity, 
        min_stock_level, price, location, 
        status, supplier, description
      FROM inventory_items
      WHERE is_deleted = FALSE
    `);

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Inventory');

    // Add headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Barcode', key: 'barcode', width: 20 },
      { header: 'Quantity', key: 'quantity', width: 15 },
      { header: 'Min Stock Level', key: 'min_stock_level', width: 15 },
      { header: 'Price', key: 'price', width: 15 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Supplier', key: 'supplier', width: 20 },
      { header: 'Description', key: 'description', width: 40 }
    ];

    // Add data
    worksheet.addRows(inventory);

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=inventory_export.xlsx'
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: 'Export failed' });
  }
});

// PDF Export 
app.post('/inventory/export/pdf', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  try {
    const [inventory] = await pool.execute(`
      SELECT name, category, quantity, price, status 
      FROM inventory_items 
      WHERE is_deleted = FALSE
    `);

    // Create PDF document using pdfkit or similar library
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory_export.pdf');
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(20).text('Inventory Report', { align: 'center' });
    doc.moveDown();
    
    inventory.forEach(item => {
      doc.fontSize(12).text(`${item.name} - ${item.category} - ${item.quantity} in stock`);
    });
    
    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ success: false, message: 'PDF export failed' });
  }
});

//Update item status
app.put('/inventory/:id/status', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await pool.execute(
      'UPDATE inventory_items SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    res.json({
      success: true,
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// Add these to your backend routes (index.js)

// GET all catalog items
app.get('/api/supplies/catalog', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  try {
    const [items] = await pool.execute('SELECT * FROM office_supplies_catalog');
    res.json(items);
  } catch (error) {
    console.error('Error fetching catalog:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch catalog' });
  }
});

// POST create new catalog item
app.post('/api/supplies/catalog', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { name_en, name_ar } = req.body;

    const [result] = await conn.execute(
      'INSERT INTO office_supplies_catalog (name_en, name_ar) VALUES (?, ?)',
      [name_en, name_ar]
    );

    await conn.commit();
    res.json({
      success: true,
      message: 'Catalog item created',
      itemId: result.insertId
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error creating catalog item:', error);
    res.status(500).json({ success: false, message: 'Failed to create catalog item' });
  } finally {
    conn.release();
  }
});

// PUT update catalog item
app.put('/api/supplies/catalog/:id', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { name_en, name_ar } = req.body;
    const itemId = req.params.id;

    await conn.execute(
      'UPDATE office_supplies_catalog SET name_en = ?, name_ar = ? WHERE id = ?',
      [name_en, name_ar, itemId]
    );

    await conn.commit();
    res.json({
      success: true,
      message: 'Catalog item updated'
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error updating catalog item:', error);
    res.status(500).json({ success: false, message: 'Failed to update catalog item' });
  } finally {
    conn.release();
  }
});

// DELETE catalog item
app.delete('/api/supplies/catalog/:id', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const itemId = req.params.id;

    await conn.execute(
      'DELETE FROM office_supplies_catalog WHERE id = ?',
      [itemId]
    );

    await conn.commit();
    res.json({
      success: true,
      message: 'Catalog item deleted'
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error deleting catalog item:', error);
    res.status(500).json({ success: false, message: 'Failed to delete catalog item' });
  } finally {
    conn.release();
  }
});

// Admin Dashboard Stats Endpoint
app.get('/api/admin/dashboard/stats', authenticateAdmin, async (req, res) => {
  try {
    // Get all stats in parallel
    const [
      [usersCount],
      [ordersCount],
      [messagesCount],
      [ratingsCount],
      [inventoryStats],
      [employeesCount],
      [pendingOrders],
      [todayActivity],
      [weeklyComparison]
    ] = await Promise.all([
      pool.execute('SELECT COUNT(*) as count FROM admin_users WHERE is_deleted = FALSE'),
      pool.execute('SELECT COUNT(*) as count FROM employee_office_orders'),
      pool.execute('SELECT COUNT(*) as count FROM citizen_contact_form WHERE status = "new"'),
      pool.execute('SELECT COUNT(*) as count FROM employee_ratings'),
      pool.execute(`
        SELECT 
          COUNT(*) as total, 
          SUM(CASE WHEN status = "low_stock" THEN 1 ELSE 0 END) as low_stock,
          SUM(CASE WHEN status = "out_of_stock" THEN 1 ELSE 0 END) as out_of_stock
        FROM inventory_items 
        WHERE is_deleted = FALSE
      `),
      pool.execute('SELECT COUNT(*) as count FROM employee_app_users WHERE is_deleted = FALSE'),
      pool.execute('SELECT COUNT(*) as count FROM employee_office_orders WHERE status = "pending"'),
      pool.execute(`
        SELECT 
          SUM(type = 'orders') as today_orders,
          SUM(type = 'messages') as today_messages,
          SUM(type = 'ratings') as today_ratings
        FROM (
          SELECT 'orders' as type FROM employee_office_orders 
          WHERE DATE(created_at) = CURDATE()
          UNION ALL
          SELECT 'messages' FROM citizen_contact_form 
          WHERE DATE(created_at) = CURDATE()
          UNION ALL
          SELECT 'ratings' FROM employee_ratings 
          WHERE DATE(created_at) = CURDATE()
        ) as today_activity
      `),
      pool.execute(`
        SELECT 
          (SELECT COUNT(*) FROM employee_office_orders 
           WHERE created_at BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW()) as current_week_orders,
          (SELECT COUNT(*) FROM employee_office_orders 
           WHERE created_at BETWEEN DATE_SUB(NOW(), INTERVAL 14 DAY) AND DATE_SUB(NOW(), INTERVAL 7 DAY)) as previous_week_orders,
          (SELECT COUNT(*) FROM citizen_contact_form 
           WHERE created_at BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW()) as current_week_messages,
          (SELECT COUNT(*) FROM citizen_contact_form 
           WHERE created_at BETWEEN DATE_SUB(NOW(), INTERVAL 14 DAY) AND DATE_SUB(NOW(), INTERVAL 7 DAY)) as previous_week_messages
      `)
    ]);

    // Calculate percentage changes
    const weeklyOrdersChange = weeklyComparison[0].previous_week_orders > 0 
      ? ((weeklyComparison[0].current_week_orders - weeklyComparison[0].previous_week_orders) / 
         weeklyComparison[0].previous_week_orders) * 100 
      : 0;

    const weeklyMessagesChange = weeklyComparison[0].previous_week_messages > 0 
      ? ((weeklyComparison[0].current_week_messages - weeklyComparison[0].previous_week_messages) / 
         weeklyComparison[0].previous_week_messages) * 100 
      : 0;

    res.json({
      users: usersCount[0].count,
      orders: ordersCount[0].count,
      pendingOrders: pendingOrders[0].count,
      messages: messagesCount[0].count,
      ratings: ratingsCount[0].count,
      inventoryItems: inventoryStats[0].total,
      lowStock: inventoryStats[0].low_stock,
      outOfStock: inventoryStats[0].out_of_stock,
      employees: employeesCount[0].count,
      todayActivity: {
        orders: todayActivity[0].today_orders,
        messages: todayActivity[0].today_messages,
        ratings: todayActivity[0].today_ratings
      },
      weeklyComparison: {
        ordersChange: weeklyOrdersChange,
        messagesChange: weeklyMessagesChange
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard stats' 
    });
  }
});

// More detailed activity data endpoint
app.get('/api/admin/dashboard/activity', authenticateAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const [activity] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d') as date,
        COUNT(*) as count,
        'orders' as type
      FROM employee_office_orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      
      UNION ALL
      
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d') as date,
        COUNT(*) as count,
        'messages' as type
      FROM citizen_contact_form
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      
      UNION ALL
      
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d') as date,
        COUNT(*) as count,
        'ratings' as type
      FROM employee_ratings
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      
      ORDER BY date ASC
    `, [days, days, days]);

    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch activity data' 
    });
  }
});
// Get recent orders with more details
app.get('/api/admin/dashboard/recent-orders', authenticateAdmin, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const [orders] = await pool.execute(`
      SELECT 
        o.id,
        o.order_number,
        o.requested_by_name,
        o.status,
        DATE_FORMAT(o.order_date, '%Y-%m-%d %H:%i:%s') as order_date,
        COUNT(i.id) as items_count
      FROM employee_office_orders o
      LEFT JOIN order_items i ON o.id = i.order_id
      GROUP BY o.id
      ORDER BY o.order_date DESC
      LIMIT ?
    `, [limit]);

    res.json({
      success: true,
      orders: orders.map(order => ({
        ...order,
        status: statusMap[order.status] || order.status
      }))
    });
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch recent orders' 
    });
  }
});

// Get recent messages with status
app.get('/api/admin/dashboard/recent-messages', authenticateAdmin, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const [messages] = await pool.execute(`
      SELECT 
        id,
        full_name,
        email,
        subject,
        status,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
      FROM citizen_contact_form
      WHERE status = 'new'
      ORDER BY created_at DESC
      LIMIT ?
    `, [limit]);

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch recent messages' 
    });
  }
});
// Get inventory status summary
app.get('/api/admin/dashboard/inventory-status', authenticateAdmin, checkAdminPermissions('inventory'), async (req, res) => {
  try {
    const [status] = await pool.execute(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(price * quantity) as total_value
      FROM inventory_items
      WHERE is_deleted = FALSE
      GROUP BY status
    `);

    const [categories] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as item_count
      FROM inventory_items
      WHERE is_deleted = FALSE
      GROUP BY category
      ORDER BY item_count DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      status,
      categories
    });
  } catch (error) {
    console.error('Error fetching inventory status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch inventory status' 
    });
  }
});
// Enhanced system health endpoint
app.get('/api/admin/dashboard/system-health', authenticateAdmin, async (req, res) => {
  try {
    const [dbStatus] = await pool.execute('SELECT 1');
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    res.json({
      success: true,
      health: {
        database: dbStatus ? 'connected' : 'disconnected',
        memory: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external
        },
        uptime: {
          seconds: uptime,
          humanReadable: new Date(uptime * 1000).toISOString().substr(11, 8)
        },
        websocket: {
          clients: wss.clients.size,
          activeConnections: Array.from(activeClients.values()).length
        }
      }
    });
  } catch (error) {
    console.error('Error checking system health:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check system health' 
    });
  }
});

// Start Server 
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`😋 Server running on http://0.0.0.0:${PORT}`);
  console.log(`😋 WebSocket server running on ws://0.0.0.0:${PORT}`);
  console.log(`Accessible on your local network at: http://${getLocalIPAddress()}:${PORT}`);
});
// Helper function
function getLocalIPAddress() {
  const interfaces = require('os').networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}
