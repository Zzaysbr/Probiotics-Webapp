const db = require("../db");
const { text, id, cents, HttpError } = require("../utils/http");
exports.getAllProducts = async (req, res) => {
  const params = [];
  let sql =
    "SELECT p.*,c.category_name,b.brand_name FROM products p JOIN categories c USING(category_id) JOIN brands b USING(brand_id) WHERE 1=1";
  if (!(req.user.role === "admin" && req.query.all === "1"))
    sql += " AND p.is_active=1";
  if (req.query.search) {
    const q = `%${String(req.query.search).slice(0, 200)}%`;
    sql +=
      " AND (p.product_name LIKE ? OR p.sku LIKE ? OR p.description LIKE ? OR c.category_name LIKE ? OR b.brand_name LIKE ?)";
    params.push(q, q, q, q, q);
  }
  for (const key of ["category_id", "brand_id"])
    if (req.query[key]) {
      sql += ` AND p.${key}=?`;
      params.push(id(req.query[key]));
    }
  const [data] = await db.query(sql + " ORDER BY p.product_id DESC", params);
  res.json({ data, total: data.length });
};
function fields(body) {
  const stock = Number(body.stock_qty);
  if (!Number.isSafeInteger(stock) || stock < 0 || stock > 2147483647)
    throw new HttpError(400, "สต็อกต้องเป็นจำนวนเต็มตั้งแต่ 0");
  const active = body.is_active === undefined ? 1 : Number(body.is_active);
  if (![0, 1].includes(active))
    throw new HttpError(400, "สถานะสินค้าไม่ถูกต้อง");
  const image = text(body.image_path || "", "URL รูปสินค้า", 255, false);
  if (image && !/^https?:\/\//.test(image))
    throw new HttpError(400, "รูปสินค้าต้องเป็น URL http หรือ https");
  return [
    id(body.category_id),
    id(body.brand_id),
    text(body.sku, "SKU", 50),
    text(body.product_name, "ชื่อสินค้า", 200),
    text(body.description || "", "รายละเอียด", 5000, false),
    (cents(body.price) / 100).toFixed(2),
    stock,
    image || null,
    active,
  ];
}
exports.createProduct = async (req, res) => {
  const [result] = await db.query(
    "INSERT INTO products (category_id,brand_id,sku,product_name,description,price,stock_qty,image_path,is_active) VALUES (?,?,?,?,?,?,?,?,?)",
    fields(req.body),
  );
  res
    .status(201)
    .json({ message: "เพิ่มสินค้าสำเร็จ", product_id: result.insertId });
};
exports.updateProduct = async (req, res) => {
  const [result] = await db.query(
    "UPDATE products SET category_id=?,brand_id=?,sku=?,product_name=?,description=?,price=?,stock_qty=?,image_path=?,is_active=? WHERE product_id=?",
    [...fields(req.body), id(req.params.id)],
  );
  if (!result.affectedRows) throw new HttpError(404, "ไม่พบสินค้า");
  res.json({ message: "แก้ไขสินค้าสำเร็จ" });
};
exports.deleteProduct = async (req, res) => {
  const [result] = await db.query(
    "UPDATE products SET is_active=0 WHERE product_id=?",
    [id(req.params.id)],
  );
  if (!result.affectedRows) throw new HttpError(404, "ไม่พบสินค้า");
  res.json({ message: "ซ่อนสินค้าสำเร็จ ประวัติคำสั่งซื้อยังคงอยู่" });
};
