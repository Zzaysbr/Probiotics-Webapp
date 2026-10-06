const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validatePasswordPolicy = require('../utils/passwordValidator');
const { sendResetPasswordEmail } = require('../utils/emailService');

const RESET_TOKEN_TTL_MINUTES = Number(process.env.RESET_TOKEN_TTL_MINUTES || 15);

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// 6.6.4 & 6.6.6 สมัครสมาชิก
exports.register = async (req, res) => {
  const { username, email, password, full_name, phone, role } = req.body;

  try {
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
    }

    const passwordCheck = validatePasswordPolicy(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ message: passwordCheck.message });
    }

    const [existingUser] = await db.query(
      'SELECT user_id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Username หรือ Email นี้ถูกใช้งานแล้ว' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
    }

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
      token,
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
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const genericMessage = 'หาก Email นี้มีในระบบ ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้';

  try {
    if (!email) {
      return res.status(400).json({ message: 'กรุณากรอก Email' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const [users] = await db.query(
      'SELECT user_id, email FROM users WHERE LOWER(email) = ?',
      [normalizedEmail]
    );

    // ไม่บอกว่าอีเมลมีอยู่ในระบบหรือไม่ เพื่อป้องกันการเดาบัญชีผู้ใช้
    if (users.length === 0) {
      return res.status(200).json({ message: genericMessage });
    }

    const userId = users[0].user_id;
    const userEmail = users[0].email;

    // Token จริงถูกส่งทางอีเมล ส่วนในฐานข้อมูลเก็บเฉพาะ SHA-256 hash
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(resetToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    // ปิด token เก่าที่ยังไม่เคยใช้ เพื่อให้ token ล่าสุดเป็นตัวที่ใช้งานได้
    await db.query(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
      [userId]
    );

    const [insertResult] = await db.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [userId, tokenHash, expiresAt]
    );

    try {
      await sendResetPasswordEmail(userEmail, resetToken, RESET_TOKEN_TTL_MINUTES);
    } catch (mailErr) {
      // ถ้าส่งอีเมลไม่สำเร็จ ให้ปิด token ที่เพิ่งสร้างไว้ด้วย
      await db.query(
        'UPDATE password_reset_tokens SET used_at = NOW() WHERE reset_id = ?',
        [insertResult.insertId]
      );
      console.error('Reset email error:', mailErr);
      return res.status(500).json({
        message: 'ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้ กรุณาตรวจสอบการตั้งค่า SMTP แล้วลองใหม่อีกครั้ง'
      });
    }

    const response = { message: genericMessage };

    // ใช้เฉพาะตอนสาธิตผ่าน Postman เท่านั้น และต้องเปิดเองใน .env
    if (String(process.env.RESET_TOKEN_TEST_MODE).toLowerCase() === 'true') {
      response.resetTokenForTesting = resetToken;
      response.note = 'RESET_TOKEN_TEST_MODE เปิดอยู่ ควรปิดก่อนใช้งานจริง';
    }

    return res.status(200).json(response);
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

    const passwordCheck = validatePasswordPolicy(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({ message: passwordCheck.message });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const [users] = await db.query(
      'SELECT user_id FROM users WHERE LOWER(email) = ?',
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุแล้ว' });
    }

    const userId = users[0].user_id;
    const tokenHash = hashResetToken(String(token).trim());

    const [records] = await db.query(
      `SELECT reset_id
       FROM password_reset_tokens
       WHERE user_id = ?
         AND token_hash = ?
         AND expires_at > NOW()
         AND used_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, tokenHash]
    );

    if (records.length === 0) {
      return res.status(400).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุแล้ว' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        'UPDATE users SET password_hash = ? WHERE user_id = ?',
        [hashedPassword, userId]
      );

      // เก็บประวัติการใช้ token ให้ตรงกับ Data Dictionary (used_at)
      await connection.query(
        'UPDATE password_reset_tokens SET used_at = NOW() WHERE reset_id = ?',
        [records[0].reset_id]
      );

      // ปิด token อื่นของ user นี้ที่ยังค้างอยู่ทั้งหมด
      await connection.query(
        'UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
        [userId]
      );

      await connection.commit();
    } catch (transactionError) {
      await connection.rollback();
      throw transactionError;
    } finally {
      connection.release();
    }

    return res.status(200).json({
      message: 'เปลี่ยนรหัสผ่านใหม่สำเร็จแล้ว สามารถ Login ด้วยรหัสผ่านใหม่ได้ทันที'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', error: error.message });
  }
};
