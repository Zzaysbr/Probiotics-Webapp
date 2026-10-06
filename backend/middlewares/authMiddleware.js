const jwt = require('jsonwebtoken');

// ตรวจสอบ JWT Token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // รูปแบบ Bearer <TOKEN>

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: ไม่พบ Token ยืนยันตัวตน' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, email, role }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
};

// 🟢 แก้ไขตรงนี้: ตรวจสอบสิทธิ์ Admin ให้รองรับทั้งตัวพิมพ์เล็กและตัวพิมพ์ใหญ่
const isAdmin = (req, res, next) => {
  const userRole = String(req.user?.role || '').toUpperCase();
  
  if (req.user && (userRole === 'ADMIN' || userRole === 'ADMINISTRATOR')) {
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden: เฉพาะ Admin เท่านั้นที่เข้าถึงได้' });
  }
};

// ตรวจสอบสิทธิ์ Customer Member หรือ Admin (6.6.3)
const isCustomerMember = (req, res, next) => {
  const userRole = String(req.user?.role || '').toLowerCase();
  
  if (req.user && (userRole === 'customer' || userRole === 'admin')) {
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden: กรุณาสมัครสมาชิกและเข้าสู่ระบบก่อน' });
  }
};

module.exports = { verifyToken, isAdmin, isCustomerMember };