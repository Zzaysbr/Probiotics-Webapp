const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  verifyToken,
  isAdmin,
  isCustomerMember,
} = require("../middlewares/authMiddleware");
const { text, id, cents, HttpError } = require("../utils/http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const uploads = path.resolve(__dirname, "../storage/slips");
fs.mkdirSync(uploads, { recursive: true });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 5 },
}).single("slip");
router.use(verifyToken, isCustomerMember);
router.get("/me", async (req, res) => {
  const [[user]] = await db.query(
    "SELECT user_id AS id, username, full_name, email, phone, role, created_at FROM users WHERE user_id = ?",
    [req.user.id],
  );
  if (!user) throw new HttpError(401, "ไม่พบบัญชีผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
  res.json({ user });
});
router.get("/catalog", async (req, res) => {
  const [categories] = await db.query(
    "SELECT * FROM categories ORDER BY category_name",
  );
  const [brands] = await db.query("SELECT * FROM brands ORDER BY brand_name");
  res.json({ categories, brands });
});
router.post("/catalog/:kind", isAdmin, async (req, res) => {
  const [table, key] =
    req.params.kind === "categories"
      ? ["categories", "category_name"]
      : req.params.kind === "brands"
        ? ["brands", "brand_name"]
        : [];
  if (!table) throw new HttpError(404, "ไม่พบประเภทข้อมูล");
  const name = text(req.body.name, "ชื่อ", 100);
  const [r] = await db.query(`INSERT INTO ${table} (${key}) VALUES (?)`, [
    name,
  ]);
  res.status(201).json({ id: r.insertId, message: "เพิ่มข้อมูลสำเร็จ" });
});
async function transaction(fn) {
  const c = await db.getConnection();
  try {
    await c.beginTransaction();
    const result = await fn(c);
    await c.commit();
    return result;
  } catch (e) {
    await c.rollback();
    throw e;
  } finally {
    c.release();
  }
}
async function orderFor(c, orderId, user, lock = false) {
  const [[o]] = await c.query(
    "SELECT * FROM orders WHERE order_id=?" + (lock ? " FOR UPDATE" : ""),
    [id(orderId)],
  );
  if (!o || (user.role !== "admin" && o.user_id !== user.id))
    throw new HttpError(404, "ไม่พบคำสั่งซื้อ");
  return o;
}
router.post("/orders", async (req, res) => {
  const recipient = text(req.body.recipient_name, "ชื่อผู้รับ", 150),
    phone = text(req.body.recipient_phone, "เบอร์โทรผู้รับ", 20),
    address = text(req.body.shipping_address, "ที่อยู่จัดส่ง", 2000);
  if (!/^[0-9+() -]{8,20}$/.test(phone))
    throw new HttpError(400, "เบอร์โทรผู้รับไม่ถูกต้อง");
  const key = text(req.headers["idempotency-key"], "รหัสคำขอ", 64);
  if (!/^[a-zA-Z0-9-]{8,64}$/.test(key))
    throw new HttpError(400, "รหัสคำขอไม่ถูกต้อง");
  if (
    !Array.isArray(req.body.items) ||
    !req.body.items.length ||
    req.body.items.length > 100
  )
    throw new HttpError(400, "กรุณาเลือกสินค้า 1–100 รายการ");
  const quantities = new Map();
  for (const item of req.body.items) {
    const pid = id(item.product_id),
      q = Number(item.quantity);
    if (!Number.isSafeInteger(q) || q <= 0 || q > 999)
      throw new HttpError(400, "จำนวนสินค้าต้องเป็นจำนวนเต็ม 1–999");
    quantities.set(pid, (quantities.get(pid) || 0) + q);
    if (quantities.get(pid) > 999)
      throw new HttpError(400, "สินค้าชนิดเดียวกันไม่เกิน 999 ชิ้น");
  }
  const result = await transaction(async (c) => {
    // Serialize requests from this customer, including retries of the same checkout.
    await c.query("SELECT user_id FROM users WHERE user_id=? FOR UPDATE", [
      req.user.id,
    ]);
    const [[previous]] = await c.query(
      "SELECT order_id FROM orders WHERE user_id=? AND request_key=?",
      [req.user.id, key],
    );
    if (previous) return { order_id: previous.order_id, reused: true };
    const lines = [];
    let subtotal = 0;
    for (const [pid, q] of [...quantities].sort((a, b) => a[0] - b[0])) {
      const [[p]] = await c.query(
        "SELECT * FROM products WHERE product_id=? FOR UPDATE",
        [pid],
      );
      if (!p || !p.is_active)
        throw new HttpError(
          409,
          "มีสินค้าที่ไม่พร้อมจำหน่าย กรุณาตรวจตะกร้าใหม่",
        );
      if (p.stock_qty < q)
        throw new HttpError(409, `${p.product_name} เหลือ ${p.stock_qty} ชิ้น`);
      const cost = cents(p.price);
      subtotal += cost * q;
      if (subtotal > 9999999999)
        throw new HttpError(400, "ยอดรวมเกินวงเงินคำสั่งซื้อ");
      lines.push({ p, q, cost });
    }
    const orderNo =
      "ORD-" + crypto.randomUUID().replaceAll("-", "").slice(0, 20);
    const [r] = await c.query(
      "INSERT INTO orders (user_id,order_no,recipient_name,recipient_phone,shipping_address,subtotal,shipping_fee,total_amount,request_key) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        req.user.id,
        orderNo,
        recipient,
        phone,
        address,
        (subtotal / 100).toFixed(2),
        "0.00",
        (subtotal / 100).toFixed(2),
        key,
      ],
    );
    for (const { p, q, cost } of lines) {
      await c.query(
        "INSERT INTO order_items (order_id,product_id,product_name_snapshot,sku_snapshot,quantity,unit_price) VALUES (?,?,?,?,?,?)",
        [
          r.insertId,
          p.product_id,
          p.product_name,
          p.sku,
          q,
          (cost / 100).toFixed(2),
        ],
      );
      await c.query(
        "UPDATE products SET stock_qty=stock_qty-? WHERE product_id=?",
        [q, p.product_id],
      );
    }
    return { order_id: r.insertId };
  });
  res.status(result.reused ? 200 : 201).json(result);
});
router.get("/orders", async (req, res) => {
  const [data] = await db.query(
    "SELECT * FROM orders WHERE user_id=? ORDER BY order_id DESC",
    [req.user.id],
  );
  res.json({ data });
});
router.get("/orders/:id", async (req, res) => {
  const order = await orderFor(db, req.params.id, req.user);
  const [items] = await db.query("SELECT * FROM order_items WHERE order_id=?", [
    order.order_id,
  ]);
  const [payments] = await db.query(
    "SELECT payment_id,amount,payment_method,transferred_at,status,reviewed_at,rejection_reason,created_at FROM payments WHERE order_id=? ORDER BY payment_id DESC",
    [order.order_id],
  );
  res.json({ order, items, payments });
});
router.post("/orders/:id/cancel", async (req, res) => {
  await transaction(async (c) => {
    const o = await orderFor(c, req.params.id, req.user, true);
    if (o.order_status !== "awaiting_payment")
      throw new HttpError(409, "ยกเลิกได้เฉพาะคำสั่งซื้อที่รอชำระเงิน");
    const [items] = await c.query(
      "SELECT product_id,quantity FROM order_items WHERE order_id=? ORDER BY product_id",
      [o.order_id],
    );
    for (const item of items)
      await c.query(
        "UPDATE products SET stock_qty=stock_qty+? WHERE product_id=?",
        [item.quantity, item.product_id],
      );
    await c.query(
      "UPDATE orders SET order_status='cancelled' WHERE order_id=?",
      [o.order_id],
    );
  });
  res.json({ message: "ยกเลิกคำสั่งซื้อและคืนสต็อกแล้ว" });
});
router.post("/orders/:id/payments", upload, async (req, res) => {
  if (!req.file) throw new HttpError(400, "กรุณาแนบหลักฐานการชำระเงิน");
  const b = req.file.buffer;
  let ext;
  if (
    b.length > 8 &&
    b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    ext = "png";
  else if (b.length > 3 && b[0] === 255 && b[1] === 216 && b[2] === 255)
    ext = "jpg";
  else if (b.subarray(0, 5).toString() === "%PDF-") ext = "pdf";
  else throw new HttpError(400, "รองรับเฉพาะไฟล์ JPG, PNG หรือ PDF ที่ถูกต้อง");
  const amount = cents(req.body.amount);
  const transferred = text(
    req.body.transferred_at,
    "วันและเวลาโอน",
    19,
  ).replace("T", " ");
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(transferred))
    throw new HttpError(400, "วันเวลาโอนไม่ถูกต้อง");
  const stamp = new Date(
    transferred.replace(" ", "T") +
      (transferred.length === 16 ? ":00" : "") +
      "+07:00",
  );
  if (
    !Number.isFinite(stamp.getTime()) ||
    stamp.getTime() > Date.now() + 300000
  )
    throw new HttpError(400, "วันเวลาโอนต้องไม่เป็นอนาคต");
  const filename = crypto.randomUUID() + "." + ext,
    full = path.join(uploads, filename);
  await fs.promises.writeFile(full, b, { flag: "wx" });
  try {
    const payment = await transaction(async (c) => {
      const o = await orderFor(c, req.params.id, req.user, true);
      if (o.order_status !== "awaiting_payment")
        throw new HttpError(409, "รายการนี้แจ้งชำระแล้วหรือไม่เปิดรับชำระ");
      if (
        stamp.getTime() <
        new Date(o.created_at.replace(" ", "T") + "+07:00").getTime() - 60000
      )
        throw new HttpError(400, "วันเวลาโอนต้องไม่ก่อนวันที่สั่งซื้อ");
      if (amount !== cents(o.total_amount))
        throw new HttpError(400, "ยอดโอนต้องตรงกับยอดชำระสุทธิ");
      const [r] = await c.query(
        "INSERT INTO payments (order_id,amount,payment_method,transferred_at,slip_path,status) VALUES (?,?,'bank_transfer',?,?,'pending')",
        [o.order_id, (amount / 100).toFixed(2), transferred, filename],
      );
      await c.query(
        "UPDATE orders SET order_status='pending_review' WHERE order_id=?",
        [o.order_id],
      );
      return r.insertId;
    });
    res.status(201).json({
      message: "ส่งข้อมูลการชำระเงินสำเร็จ รอผู้ดูแลตรวจสอบ",
      payment_id: payment,
    });
  } catch (e) {
    await fs.promises.unlink(full).catch(() => {});
    throw e;
  }
});
router.get("/payments/:id/slip", async (req, res) => {
  const [[payment]] = await db.query(
    "SELECT * FROM payments WHERE payment_id=?",
    [id(req.params.id)],
  );
  if (!payment) throw new HttpError(404, "ไม่พบหลักฐาน");
  await orderFor(db, payment.order_id, req.user);
  const full = path.join(uploads, path.basename(payment.slip_path));
  if (!fs.existsSync(full)) throw new HttpError(404, "ไม่พบไฟล์หลักฐาน");
  res.download(full, "payment-" + payment.payment_id + path.extname(full));
});
router.get("/orders/:id/receipt", async (req, res) => {
  const o = await orderFor(db, req.params.id, req.user);
  const [[payment]] = await db.query(
    "SELECT * FROM payments WHERE order_id=? AND status IN ('pending','approved') ORDER BY payment_id DESC LIMIT 1",
    [o.order_id],
  );
  if (!payment) throw new HttpError(409, "กรุณาแจ้งชำระเงินก่อนออกเอกสาร");
  const [items] = await db.query(
    "SELECT * FROM order_items WHERE order_id=? ORDER BY order_item_id",
    [o.order_id],
  );
  await require("../utils/receipt")(res, o, items, payment);
});
router.get("/admin/orders", isAdmin, async (req, res) => {
  const [data] = await db.query(
    "SELECT o.*,u.username FROM orders o JOIN users u USING(user_id) ORDER BY o.order_id DESC",
  );
  res.json({ data });
});
router.get("/admin/payments", isAdmin, async (req, res) => {
  const [data] = await db.query(
    "SELECT p.*,o.order_no,o.recipient_name FROM payments p JOIN orders o USING(order_id) ORDER BY p.payment_id DESC",
  );
  res.json({ data });
});
router.post("/admin/payments/:id/review", isAdmin, async (req, res) => {
  const status = req.body.status;
  if (!["approved", "rejected"].includes(status))
    throw new HttpError(400, "สถานะตรวจสอบไม่ถูกต้อง");
  const reason =
    status === "rejected"
      ? text(req.body.reason, "เหตุผลที่ไม่อนุมัติ", 1000)
      : null;
  const [[lookup]] = await db.query(
    "SELECT order_id FROM payments WHERE payment_id=?",
    [id(req.params.id)],
  );
  if (!lookup) throw new HttpError(404, "ไม่พบการชำระเงิน");
  await transaction(async (c) => {
    const o = await orderFor(c, lookup.order_id, req.user, true);
    const [[p]] = await c.query(
      "SELECT * FROM payments WHERE payment_id=? FOR UPDATE",
      [id(req.params.id)],
    );
    if (p.status !== "pending" || o.order_status !== "pending_review")
      throw new HttpError(409, "รายการนี้ตรวจสอบไปแล้ว");
    await c.query(
      "UPDATE payments SET status=?,reviewed_by=?,reviewed_at=NOW(),rejection_reason=? WHERE payment_id=?",
      [status, req.user.id, reason, p.payment_id],
    );
    if (status === "approved") {
      await c.query(
        "UPDATE orders SET order_status='paid',receipt_no=?,receipt_issued_at=NOW() WHERE order_id=?",
        ["RC-" + crypto.randomUUID().slice(0, 20), o.order_id],
      );
    } else
      await c.query(
        "UPDATE orders SET order_status='awaiting_payment' WHERE order_id=?",
        [o.order_id],
      );
  });
  res.json({
    message:
      status === "approved"
        ? "ยืนยันรับชำระเงินแล้ว"
        : "ส่งกลับให้ลูกค้าแจ้งชำระใหม่แล้ว",
  });
});
router.get("/admin/dashboard", isAdmin, async (req, res) => {
  const valid = (v) =>
    typeof v === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    Number.isFinite(Date.parse(v)) &&
    new Date(v).toISOString().slice(0, 10) === v;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const end = req.query.end || today,
    start = req.query.start || today.slice(0, 8) + "01";
  if (
    !valid(start) ||
    !valid(end) ||
    start > end ||
    Date.parse(end) - Date.parse(start) > 366 * 86400000
  )
    throw new HttpError(400, "ช่วงวันที่ต้องถูกต้องและไม่เกิน 1 ปี");
  const args = [start, end];
  const [daily] = await db.query(
    "SELECT DATE_FORMAT(reviewed_at,'%Y-%m-%d') AS day,SUM(amount) AS revenue,COUNT(*) AS orders FROM payments WHERE status='approved' AND reviewed_at>=? AND reviewed_at<DATE_ADD(?,INTERVAL 1 DAY) GROUP BY DATE_FORMAT(reviewed_at,'%Y-%m-%d') ORDER BY day",
    args,
  );
  const [[summary]] = await db.query(
    "SELECT COALESCE(SUM(amount),0) AS revenue,COUNT(*) AS paid_orders FROM payments WHERE status='approved' AND reviewed_at>=? AND reviewed_at<DATE_ADD(?,INTERVAL 1 DAY)",
    args,
  );
  const [[pending]] = await db.query(
    "SELECT COUNT(*) AS pending_payments FROM payments WHERE status='pending'",
  );
  const [top] = await db.query(
    "SELECT i.product_name_snapshot AS name,SUM(i.quantity) AS quantity,SUM(i.quantity*i.unit_price) AS revenue FROM order_items i JOIN payments p USING(order_id) WHERE p.status='approved' AND p.reviewed_at>=? AND p.reviewed_at<DATE_ADD(?,INTERVAL 1 DAY) GROUP BY i.product_id,i.product_name_snapshot ORDER BY revenue DESC LIMIT 5",
    args,
  );
  const [low_stock] = await db.query(
    "SELECT product_name,stock_qty FROM products WHERE is_active=1 AND stock_qty<=5 ORDER BY stock_qty",
  );
  res.json({
    start,
    end,
    summary: { ...summary, ...pending },
    daily,
    top,
    low_stock,
  });
});
module.exports = router;
