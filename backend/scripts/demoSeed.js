const db = require("../db");
const bcrypt = require("bcryptjs");
async function seed(db) {
  for (const name of ["แบบแคปซูล", "แบบผงหรือซอง", "แบบเม็ดเคี้ยว"])
    await db.query("INSERT IGNORE INTO categories (category_name) VALUES (?)", [
      name,
    ]);
  for (const name of ["BioCare", "Probio Plus", "Healthy Gut"])
    await db.query("INSERT IGNORE INTO brands (brand_name) VALUES (?)", [name]);
  const [[{ n }]] = await db.query("SELECT COUNT(*) AS n FROM products");
  if (!n) {
    const [categories] = await db.query(
      "SELECT * FROM categories ORDER BY category_id",
    );
    const [brands] = await db.query("SELECT * FROM brands ORDER BY brand_id");
    for (let i = 0; i < 3; i++)
      await db.query(
        "INSERT INTO products (category_id,brand_id,sku,product_name,description,price,stock_qty) VALUES (?,?,?,?,?,?,?)",
        [
          categories[i].category_id,
          brands[i].brand_id,
          "PB00" + (i + 1),
          [
            "Probiotic Daily Balance",
            "Probiotic Powder Plus",
            "Probiotic Chewable",
          ][i],
          [
            "โปรไบโอติกแบบแคปซูล 30 แคปซูล ควรเก็บในที่แห้งและเย็น",
            "โปรไบโอติกชนิดผง 15 ซอง ละลายน้ำตามคำแนะนำบนฉลาก",
            "โปรไบโอติกชนิดเม็ดเคี้ยว 30 เม็ด",
          ][i],
          [590, 450, 490][i],
          [50, 40, 10][i],
        ],
      );
  }
  const hash = await bcrypt.hash("DemoShop123!", 10);
  for (const [username, role, name] of [
    ["admin-demo", "admin", "ผู้ดูแลสาธิต"],
    ["member-demo", "customer", "สมาชิกสาธิต"],
  ]) {
    const [[exists]] = await db.query(
      "SELECT user_id FROM users WHERE username=?",
      [username],
    );
    if (!exists)
      await db.query(
        "INSERT INTO users (username,email,password_hash,full_name,phone,role) VALUES (?,?,?,?,?,?)",
        [
          username,
          username + "@example.invalid",
          hash,
          name,
          "0000000000",
          role,
        ],
      );
  }
}
if (require.main === module)
  seed(db)
    .then(() =>
      console.log(
        "Demo accounts ready (existing accounts unchanged): admin-demo / member-demo; initial password: DemoShop123!",
      ),
    )
    .catch((e) => {
      console.error(e.message);
      process.exitCode = 1;
    })
    .finally(() => db.end());
module.exports = seed;
