const fs = require("fs");
const path = require("path");
async function migrate(db) {
  const schema = fs.readFileSync(
    path.join(__dirname, "../database/schema.sql"),
    "utf8",
  );
  for (const sql of schema
    .replace(/^--.*$/gm, "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean))
    await db.query(sql);
  const [[u]] = await db.query(
    "SELECT COUNT(*) AS n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND COLUMN_NAME='token_version'",
  );
  if (!u.n)
    await db.query(
      "ALTER TABLE users ADD COLUMN token_version INT NOT NULL DEFAULT 0",
    );
  const [[o]] = await db.query(
    "SELECT COUNT(*) AS n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='request_key'",
  );
  if (!o.n)
    await db.query(
      "ALTER TABLE orders ADD COLUMN request_key VARCHAR(64) DEFAULT NULL, ADD UNIQUE KEY uq_order_request (user_id,request_key)",
    );
  const additions = {
    products: {
      version: "INT NOT NULL DEFAULT 0",
      package_size: "VARCHAR(200) DEFAULT NULL",
      usage_instructions: "TEXT DEFAULT NULL",
      storage_instructions: "TEXT DEFAULT NULL",
      caution: "TEXT DEFAULT NULL",
    },
    orders: {
      expires_at: "DATETIME DEFAULT NULL",
      carrier: "VARCHAR(100) DEFAULT NULL",
      shipped_at: "DATETIME DEFAULT NULL",
      delivered_at: "DATETIME DEFAULT NULL",
      request_hash: "CHAR(64) DEFAULT NULL",
    },
  };
  for (const [table, columns] of Object.entries(additions)) {
    const [existing] = await db.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?",
      [table],
    );
    const names = new Set(existing.map((row) => row.COLUMN_NAME));
    for (const [column, type] of Object.entries(columns))
      if (!names.has(column))
        await db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
  // Existing unpaid orders receive a grace period; never expire them immediately during upgrade.
  const [[expiryIndex]] = await db.query(
    "SELECT COUNT(*) AS n FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND INDEX_NAME='idx_orders_expiry'",
  );
  if (!expiryIndex.n)
    await db.query(
      "ALTER TABLE orders ADD KEY idx_orders_expiry (order_status,expires_at,order_id)",
    );
  await db.query(
    "UPDATE orders SET expires_at=DATE_ADD(NOW(),INTERVAL 24 HOUR) WHERE order_status='awaiting_payment' AND expires_at IS NULL",
  );
  for (const [table, name, expression] of [
    ["products", "chk_products_price", "price>=0"],
    ["products", "chk_products_stock", "stock_qty>=0"],
    ["order_items", "chk_order_items_quantity", "quantity>0"],
    ["order_items", "chk_order_items_price", "unit_price>=0"],
    ["payments", "chk_payments_amount", "amount>=0"],
  ]) {
    const [[exists]] = await db.query(
      "SELECT COUNT(*) AS n FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME=? AND CONSTRAINT_NAME=?",
      [table, name],
    );
    if (!exists.n)
      await db.query(
        `ALTER TABLE ${table} ADD CONSTRAINT ${name} CHECK (${expression})`,
      );
  }
  for (const table of ["products", "order_items"]) {
    const [[info]] = await db.query(
      "SELECT ENGINE,TABLE_COLLATION FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?",
      [table],
    );
    if (
      info.ENGINE !== "InnoDB" ||
      info.TABLE_COLLATION !== "utf8mb4_unicode_ci"
    )
      await db.query(
        `ALTER TABLE ${table} ENGINE=InnoDB, CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
  }
}
if (require.main === module) {
  const mysql = require("mysql2/promise");
  require("dotenv").config({
    quiet: true,
    path: require("path").join(__dirname, "../.env"),
  });
  (async () => {
    const name = process.env.DB_NAME || "probiotic_shop";
    if (!/^[a-zA-Z0-9_]+$/.test(name)) throw new Error("Invalid database name");
    const c = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
    });
    await c.query(
      "CREATE DATABASE IF NOT EXISTS `" +
        name +
        "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    );
    await c.end();
    const db = require("../db");
    try {
      await migrate(db);
      console.log("Database schema ready; existing data preserved.");
    } finally {
      await db.end();
    }
  })().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
}
module.exports = migrate;
