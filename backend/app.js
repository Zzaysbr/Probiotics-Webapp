require("dotenv").config({
  quiet: true,
  path: require("path").join(__dirname, ".env"),
});
const express = require("express");
const cors = require("cors");
const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => {
  req.body ??= {};
  next();
});
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  next();
});
app.get("/", (req, res) => res.json({ message: "Probiotic Shop API" }));
app.get("/api/shop", (req, res) => res.json(require("./shopConfig")));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api", require("./routes/shopRoutes"));
app.use((req, res) =>
  res.status(404).json({ message: "ไม่พบเส้นทางที่ร้องขอ" }),
);
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  let status = error.status || 500,
    message = error.message;
  if (error.code === "ER_DUP_ENTRY") {
    status = 409;
    message = "ข้อมูลซ้ำกับรายการที่มีอยู่แล้ว";
  }
  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    status = 400;
    message = "ไม่พบข้อมูลอ้างอิงที่เลือก";
  }
  if (error.code === "LIMIT_FILE_SIZE") {
    status = 400;
    message = "ไฟล์หลักฐานต้องมีขนาดไม่เกิน 5 MB";
  }
  if (status >= 500) {
    console.error(error);
    message = "ระบบขัดข้อง กรุณาลองใหม่หรือติดต่อผู้ดูแล";
  }
  res.status(status).json({ message });
});
module.exports = app;
