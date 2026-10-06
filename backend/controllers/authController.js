const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validatePasswordPolicy = require('../utils/passwordValidator');
const { sendResetPasswordEmail } = require('../utils/emailService');

// 6.6.4 & 6.6.6 สมัครสมาชิก
exports.register = async (req, res) => {
  const { username, email, password, full_name, phone, role } = req.body;

  try {
    // 1. ตรวจสอบข้อมูลเบื้องต้น
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
    }

    // 2. ตรวจสอบ Password Policy (6.6.6)
    const passwordCheck = validatePasswordPolicy(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ message: passwordCheck.message });
    }

    // 3. ตรวจสอบ Username / Email ซ้ำ (ใช้ user_id ตาม Schema)
    const [existingUser] = await db.query(
      'SELECT user_id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Username หรือ Email นี้ถูกใช้งานแล้ว' });
    }

    // 4. เข้ารหัส Password ด้วย bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. บันทึกลงฐานข้อมูล (ใช้ password_hash และ phone_number)
    const userRole = role === 'ADMIN' || role === 'admin' ? 'admin' : 'customer';
    await db.query(
      'INSERT INTO users (username, email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name, phone || null, userRole]
    );

    return res.status(201).json({ message: 'ลงทะเบียนสำเร็จเรียบร้อยแล้ว' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์', error: error.message });
  }
};

// 6.6.1 เข้าสู่ระบบและสร้าง JWT Token
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: 'กรุณากรอก Username และ Password' });
    }

    // ค้นหาผู้ใช้จาก Username หรือ Email
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
    }

    const user = users[0];

    // ตรวจสอบ Password กับ password_hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
    }

    // สร้าง JWT Token (อ้างอิง user_id)
    const payload = {
      id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });

    return res.status(200).json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token: token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', error: error.message });
  }
};

// 6.6.5 ขอรีเซ็ตรหัสผ่าน (Forgot Password)
// 6.6.5 ขอรีเซ็ตรหัสผ่าน (Forgot Password)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'กรุณากรอก Email' });
    }

    // 1. ค้นหา user_id จาก email ในตาราง users
    const [users] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(200).json({ message: 'หาก Email นี้มีในระบบ ระบบจะทำการส่งลิงก์รีเซ็ตรหัสผ่านไปให้' });
    }

    const userId = users[0].user_id;

    // 2. สร้าง Random Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // หมดอายุใน 15 นาที

    // 3. บันทึกลงตาราง password_reset_tokens (ใช้ user_id และ token_hash)
    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [userId, resetToken, expiresAt]
    );

    // 4. ส่ง Email
    try {
      await sendResetPasswordEmail(email, resetToken);
    } catch (mailErr) {
      console.log('Email Send Mock/Error:', mailErr.message);
    }

    return res.status(200).json({
      message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยัง Email เรียบร้อยแล้ว (โปรดตรวจสอบในกล่องข้อความ)',
      resetTokenForTesting: resetToken
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการส่งคำขอรีเซ็ต', error: error.message });
  }
};

// 6.6.5 ตั้งรหัสผ่านใหม่ (Reset Password)
exports.resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // 1. ตรวจสอบ Password Policy (6.6.6)
    const passwordCheck = validatePasswordPolicy(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({ message: passwordCheck.message });
    }

    // 2. ค้นหา user_id จาก email
    const [users] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'ไม่พบผู้ใช้นี้ในระบบ' });
    }

    const userId = users[0].user_id;

    // 3. ตรวจสอบ Token ในตาราง password_reset_tokens โดยใช้ user_id และ token_hash
    const [records] = await db.query(
      'SELECT * FROM password_reset_tokens WHERE user_id = ? AND token_hash = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [userId, token]
    );

    if (records.length === 0) {
      return res.status(400).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุแล้ว' });
    }

    // 4. Hashing รหัสผ่านใหม่
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 5. อัปเดตรหัสผ่านใหม่ลงคอลัมน์ password_hash
    await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [hashedPassword, userId]);

    // 6. ลบ Token ที่ใช้งานแล้ว
    await db.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [userId]);

    return res.status(200).json({ message: 'เปลี่ยนรหัสผ่านใหม่สำเร็จแล้ว สามารถ Login ด้วยรหัสผ่านใหม่ได้ทันที' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', error: error.message });
  }
};