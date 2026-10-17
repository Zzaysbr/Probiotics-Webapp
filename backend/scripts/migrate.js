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
