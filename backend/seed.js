const db = require('./db');
const bcrypt = require('bcryptjs');

async function createTestUsers() {
  try {
    const password = 'Password123!';
    // เข้ารหัส Password จริงด้วย Bcrypt (Cost Factor 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // ลบ User ทดสอบเดิม (ถ้ามี)
    await db.query("DELETE FROM users WHERE username IN ('admin', 'customer1')");

    // 1. เพิ่ม User สิทธิ์ Admin
    await db.query(
      `INSERT INTO users (username, email, password_hash, full_name, phone, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['admin', 'admin@example.com', hashedPassword, 'ผู้ดูแลระบบ', '0812345678', 'admin']
    );

    // 2. เพิ่ม User สิทธิ์ Customer
    await db.query(
      `INSERT INTO users (username, email, password_hash, full_name, phone, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['customer1', 'customer1@example.com', hashedPassword, 'สมชาย ใจดี', '0898765432', 'customer']
    );

    console.log('✅ สร้าง User สำหรับทดสอบเรียบร้อยแล้ว!');
    console.log('-----------------------------------');
    console.log('Username: customer1 หรือ admin');
    console.log('Password: Password123!');
    console.log('-----------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    process.exit(1);
  }
}

createTestUsers();