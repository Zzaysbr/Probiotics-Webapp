const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const validatePasswordPolicy = require("../utils/passwordValidator");
const { text, HttpError } = require("../utils/http");
const emailService = require("../utils/emailService");
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
function email(value) {
  const result = text(value, "อีเมล", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result))
    throw new HttpError(400, "รูปแบบอีเมลไม่ถูกต้อง");
  return result;
}
function password(value) {
  if (typeof value !== "string" || Buffer.byteLength(value) > 72)
    throw new HttpError(400, "รหัสผ่านต้องเป็นข้อความและไม่เกิน 72 bytes");
  const result = validatePasswordPolicy(value);
  if (!result.valid) throw new HttpError(400, result.message);
  return value;
}
exports.register = async (req, res) => {
  const username = text(req.body.username, "ชื่อผู้ใช้", 50),
    address = email(req.body.email),
    fullName = text(req.body.full_name, "ชื่อและนามสกุล", 150),
    phone = text(req.body.phone || "", "เบอร์โทร", 20, false);
  const hashed = await bcrypt.hash(password(req.body.password), 10);
  await db.query(
    "INSERT INTO users (username,email,password_hash,full_name,phone,role) VALUES (?,?,?,?,?,?)",
    [username, address, hashed, fullName, phone || null, "customer"],
  );
  res.status(201).json({ message: "สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ" });
};
exports.login = async (req, res) => {
  const username = text(req.body.username, "ชื่อผู้ใช้หรืออีเมล", 254);
  if (
    typeof req.body.password !== "string" ||
    !req.body.password ||
    req.body.password.length > 200
  )
    throw new HttpError(400, "กรุณากรอกรหัสผ่าน");
  const [[user]] = await db.query(
    "SELECT * FROM users WHERE username=? OR email=?",
    [username, username.toLowerCase()],
  );
  if (!user || !(await bcrypt.compare(req.body.password, user.password_hash)))
    throw new HttpError(401, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  const token = jwt.sign(
    { id: user.user_id, role: user.role, version: user.token_version },
    process.env.JWT_SECRET,
    { algorithm: "HS256", expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  );
  res.json({
    token,
    user: {
      id: user.user_id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    message: "เข้าสู่ระบบสำเร็จ",
  });
};
exports.forgotPassword = async (req, res) => {
  const address = email(req.body.email);
  const [[user]] = await db.query("SELECT user_id FROM users WHERE email=?", [
    address,
  ]);
  const message =
    "หากอีเมลนี้มีในระบบ ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านให้ กรุณาตรวจกล่องจดหมายและสแปม";
  if (!user) return res.json({ message });
  const token = crypto.randomBytes(32).toString("hex"),
    connection = await db.getConnection();
  let resetId;
  try {
    await connection.beginTransaction();
    await connection.query(
      "SELECT user_id FROM users WHERE user_id=? FOR UPDATE",
      [user.user_id],
    );
    await connection.query(
      "UPDATE password_reset_tokens SET used_at=NOW() WHERE user_id=? AND used_at IS NULL",
      [user.user_id],
    );
    const [result] = await connection.query(
      "INSERT INTO password_reset_tokens (user_id,token_hash,expires_at) VALUES (?,?,DATE_ADD(NOW(),INTERVAL 15 MINUTE))",
      [user.user_id, hash(token)],
    );
    resetId = result.insertId;
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  try {
    const delivery = await emailService.sendResetPasswordEmail(
      address,
      token,
      15,
    );
    if (delivery?.accepted?.length)
      console.info("Reset email accepted by SMTP", {
        accepted: delivery.accepted.length,
      });
  } catch (error) {
    await db.query(
      "UPDATE password_reset_tokens SET used_at=NOW() WHERE reset_id=?",
      [resetId],
    );
    console.error("SMTP failed:", error.code || "mail error");
  }
  res.json({ message });
};
exports.resetPassword = async (req, res) => {
  const address = email(req.body.email),
    token = text(req.body.token, "รหัสยืนยัน", 64);
  if (!/^[a-f0-9]{64}$/.test(token))
    throw new HttpError(400, "Token ไม่ถูกต้องหรือหมดอายุแล้ว");
  const hashed = await bcrypt.hash(password(req.body.newPassword), 10),
    connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [[user]] = await connection.query(
      "SELECT user_id FROM users WHERE email=? FOR UPDATE",
      [address],
    );
    if (!user) throw new HttpError(400, "Token ไม่ถูกต้องหรือหมดอายุแล้ว");
    const [[record]] = await connection.query(
      "SELECT reset_id FROM password_reset_tokens WHERE user_id=? AND token_hash=? AND expires_at>NOW() AND used_at IS NULL FOR UPDATE",
      [user.user_id, hash(token)],
    );
    if (!record) throw new HttpError(400, "Token ไม่ถูกต้องหรือหมดอายุแล้ว");
    await connection.query(
      "UPDATE users SET password_hash=?,token_version=token_version+1 WHERE user_id=?",
      [hashed, user.user_id],
    );
    await connection.query(
      "UPDATE password_reset_tokens SET used_at=NOW() WHERE user_id=? AND used_at IS NULL",
      [user.user_id],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  res.json({
    message: "เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่",
  });
};
