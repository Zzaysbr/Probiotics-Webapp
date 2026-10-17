const jwt = require("jsonwebtoken");
const db = require("../db");
const verifyToken = async (req, res, next) => {
  const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || "");
  if (!match) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อน" });
  let token;
  try {
    token = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    return res
      .status(401)
      .json({ message: "Token ไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่" });
  }
  try {
    const [[user]] = await db.query(
      "SELECT user_id,username,email,full_name,role,token_version FROM users WHERE user_id=?",
      [token.id],
    );
    if (!user || user.token_version !== (token.version || 0))
      return res
        .status(401)
        .json({ message: "Session ถูกยกเลิก กรุณาเข้าสู่ระบบใหม่" });
    req.user = { ...user, id: user.user_id };
    next();
  } catch (error) {
    next(error);
  }
};
const isAdmin = (req, res, next) =>
  req.user?.role === "admin"
    ? next()
    : res.status(403).json({ message: "เฉพาะผู้ดูแลระบบเท่านั้น" });
const isCustomerMember = (req, res, next) =>
  ["admin", "customer"].includes(req.user?.role)
    ? next()
    : res.status(403).json({ message: "กรุณาสมัครสมาชิกก่อน" });
module.exports = { verifyToken, isAdmin, isCustomerMember };
