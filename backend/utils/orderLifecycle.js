const db = require("../db");
const { HttpError } = require("./http");
const hours = Number(process.env.ORDER_PAYMENT_HOURS || 24);
if (!Number.isInteger(hours) || hours < 1 || hours > 168)
  throw new Error("ORDER_PAYMENT_HOURS ต้องเป็นจำนวนเต็ม 1–168");
async function releaseOrder(c, order, status) {
  const [items] = await c.query(
    "SELECT product_id,quantity FROM order_items WHERE order_id=? ORDER BY product_id",
    [order.order_id],
  );
  for (const item of items)
    await c.query(
      "UPDATE products SET stock_qty=stock_qty+?,version=version+1 WHERE product_id=?",
      [item.quantity, item.product_id],
    );
  await c.query("UPDATE orders SET order_status=? WHERE order_id=?", [
    status,
    order.order_id,
  ]);
}
let running;
async function runExpiry() {
  const [orders] = await db.query(
    "SELECT order_id FROM orders WHERE order_status='awaiting_payment' AND expires_at IS NOT NULL AND expires_at<=NOW() ORDER BY order_id LIMIT 100",
  );
  let expired = 0;
  for (const row of orders) {
    const c = await db.getConnection();
    try {
      await c.beginTransaction();
      const [[o]] = await c.query(
        "SELECT *,expires_at<=NOW() AS overdue FROM orders WHERE order_id=? FOR UPDATE",
        [row.order_id],
      );
      if (o.order_status === "awaiting_payment" && o.overdue) {
        await releaseOrder(c, o, "expired");
        expired++;
      }
      await c.commit();
    } catch (error) {
      await c.rollback();
      throw error;
    } finally {
      c.release();
    }
  }
  return expired;
}
function expireOrders() {
  if (!running)
    running = runExpiry().finally(() => {
      running = null;
    });
  return running;
}
function ensurePayable(order) {
  if (
    order.expires_at &&
    new Date(order.expires_at.replace(" ", "T") + "+07:00").getTime() <=
      Date.now()
  )
    throw new HttpError(409, "คำสั่งซื้อหมดเวลาชำระแล้ว กรุณาสร้างรายการใหม่");
}
module.exports = { hours, releaseOrder, expireOrders, ensurePayable };
