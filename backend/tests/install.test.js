const { test } = require("node:test");
const assert = require("node:assert/strict");
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
  quiet: true,
});
test("Clean SQL import, repeatable migrations/seeding, constraints and new schema", async () => {
  const name = "probiotic_shop_install_" + process.pid;
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    multipleStatements: true,
  });
  try {
    await c.query(
      "CREATE DATABASE `" +
        name +
        "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    );
    await c.query("USE `" + name + "`");
    await c.query(
      fs.readFileSync(
        path.join(__dirname, "../database/probiotic_shop_complete.sql"),
        "utf8",
      ),
    );
    const migrate = require("../scripts/migrate");
    await migrate(c);
    await migrate(c);
    const [[empty]] = await c.query("SELECT COUNT(*) AS n FROM users");
    assert.equal(empty.n, 0);
    const seed = require("../scripts/demoSeed");
    await seed(c);
    await seed(c);
    const [[users]] = await c.query("SELECT COUNT(*) AS n FROM users");
    assert.equal(users.n, 2);
    const [[p]] = await c.query(
      "SELECT * FROM products ORDER BY product_id LIMIT 1",
    );
    assert.equal(p.version, 0);
    await assert.rejects(
      c.query("UPDATE products SET stock_qty=-1 WHERE product_id=?", [
        p.product_id,
      ]),
    );
    const [columns] = await c.query("SHOW COLUMNS FROM orders");
    assert.ok(columns.some((c) => c.Field === "expires_at"));
    assert.ok(columns.some((c) => c.Field === "carrier"));
  } finally {
    if (!/^probiotic_shop_install_\d+$/.test(name))
      throw Error("Unsafe database cleanup");
    await c.query("DROP DATABASE IF EXISTS `" + name + "`");
    await c.end();
    await require("../db").end();
  }
});
