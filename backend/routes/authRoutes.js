const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const attempts = new Map();
const cleanup = setInterval(() => {
  for (const [key, e] of attempts)
    if (e.until < Date.now()) attempts.delete(key);
}, 60000);
cleanup.unref();
router.use((req, res, next) => {
  if (process.env.NODE_ENV === "test") return next();
  const key = `${req.ip}:${req.path}`;
  let e = attempts.get(key);
  if (!e || e.until < Date.now()) {
    e = { count: 0, until: Date.now() + 15 * 60000 };
    attempts.set(key, e);
  }
  if (++e.count > (req.path === "/forgot-password" ? 5 : 30)) {
    res.set("Retry-After", String(Math.ceil((e.until - Date.now()) / 1000)));
    return res
      .status(429)
      .json({ message: "ส่งคำขอบ่อยเกินไป กรุณาลองใหม่ภายหลัง" });
  }
  next();
});

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
