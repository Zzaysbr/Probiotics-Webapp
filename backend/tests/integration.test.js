const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
  quiet: true,
});
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = crypto.randomBytes(48).toString("hex");
const testDatabase = "probiotic_shop_test_" + process.pid;
process.env.DB_NAME = testDatabase;
let control,
  db,
  server,
  base,
  customer,
  admin,
  other,
  pid,
  orderId,
  paymentId,
  captured;
const pass = "TestShop123!",
  slips = [];
async function request(
  url,
  { token, body, method = "GET", headers = {} } = {},
) {
  const response = await fetch(base + url, {
    method,
    headers: {
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(body && !(body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...headers,
    },
    body: body
      ? body instanceof FormData
        ? body
        : JSON.stringify(body)
      : undefined,
  });
  const data = response.headers
    .get("content-type")
    ?.includes("application/json")
    ? await response.json()
    : Buffer.from(await response.arrayBuffer());
  return { status: response.status, data };
}
const post = (url, body, token, headers) =>
  request(url, { method: "POST", body, token, headers });
async function login(username, password = pass) {
  const r = await post("/auth/login", { username, password });
  assert.equal(r.status, 200);
  return r.data.token;
}
async function payment(order, token = customer, amount = "1180.00") {
  const form = new FormData();
  form.append("amount", amount);
  const [[clock]] = await db.query(
    "SELECT DATE_FORMAT(NOW(),'%Y-%m-%dT%H:%i:%s') AS time",
  );
  form.append("transferred_at", clock.time);
  form.append(
    "slip",
    new Blob(
      [
        Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jDk0AAAAASUVORK5CYII=",
          "base64",
        ),
      ],
      { type: "image/png" },
    ),
    "sample.png",
  );
  const result = await post("/orders/" + order + "/payments", form, token);
  if (result.status === 201) {
    const [[row]] = await db.query(
      "SELECT slip_path FROM payments WHERE payment_id=?",
      [result.data.payment_id],
    );
    slips.push(path.join(__dirname, "../storage/slips", row.slip_path));
  }
  return result;
}
before(async () => {
  control = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
  });
  await control.query(
    "CREATE DATABASE `" +
      testDatabase +
      "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
  );
  db = require("../db");
  await require("../scripts/migrate")(db);
  await require("../scripts/demoSeed")(db);
  const email = require("../utils/emailService");
  email.sendResetPasswordEmail = async (to, token) => {
    captured = { to, token };
  };
  server = require("../app").listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = "http://127.0.0.1:" + server.address().port + "/api";
  const bcrypt = require("bcryptjs");
  await db.query("UPDATE users SET password_hash=?", [
    await bcrypt.hash(pass, 10),
  ]);
  admin = await login("admin-demo");
  for (const username of ["buyer", "other"]) {
    const r = await post("/auth/register", {
      username,
      email: username + "@example.invalid",
      full_name: "ผู้ซื้อทดสอบ",
      phone: "0000000000",
      password: pass,
      role: "admin",
    });
    assert.equal(r.status, 201);
  }
  customer = await login("buyer");
  other = await login("other");
  const [[p]] = await db.query("SELECT product_id FROM products WHERE sku=?", [
    "PB001",
  ]);
  pid = p.product_id;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  for (const file of slips) await fs.promises.unlink(file).catch(() => {});
  if (db) await db.end();
  if (control) {
    if (!/^probiotic_shop_test_\d+$/.test(testDatabase))
      throw new Error("Unsafe cleanup target");
    await control.query("DROP DATABASE `" + testDatabase + "`");
    await control.end();
  }
});
test("Full shop workflow with real isolated MySQL database", async (t) => {
  await t.test("JWT, role injection and password validation", async () => {
    const profile = await request("/me", { token: customer });
    assert.equal(profile.status, 200);
    assert.equal(profile.data.user.username, "buyer");
    assert.equal(profile.data.user.phone, "0000000000");
    assert.ok(profile.data.user.created_at);
    assert.deepEqual(
      Object.keys(profile.data.user).sort(),
      [
        "id",
        "username",
        "full_name",
        "email",
        "phone",
        "role",
        "created_at",
      ].sort(),
    );
    assert.equal((await request("/me")).status, 401);
    assert.equal(
      (await request("/me", { token: customer })).data.user.role,
      "customer",
    );
    assert.equal((await request("/products")).status, 401);
    assert.equal(
      (await request("/products", { token: "invalid" })).status,
      401,
    );
    assert.equal((await post("/products", {}, customer)).status, 403);
    const jwt = require("jsonwebtoken");
    assert.equal(
      (
        await request("/products", {
          token: jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: -1 }),
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await post("/auth/register", {
          username: "weak",
          email: "weak@example.invalid",
          full_name: "weak",
          password: "weak",
        })
      ).status,
      400,
    );
    assert.equal(
      (await post("/auth/login", { username: "buyer", password: "wrong" }))
        .status,
      401,
    );
  });
  await t.test(
    "Admin CRUD, search, categories, validation and soft delete",
    async () => {
      const cat = await post(
        "/catalog/categories",
        { name: "หมวดทดสอบ" },
        admin,
      );
      const brand = await post(
        "/catalog/brands",
        { name: "แบรนด์ทดสอบ" },
        admin,
      );
      const body = {
        sku: "AUDIT",
        product_name: "สินค้าทดสอบ",
        description: "คำอธิบาย",
        price: "100.25",
        stock_qty: 2,
        category_id: cat.data.id,
        brand_id: brand.data.id,
      };
      const created = await post("/products", body, admin);
      assert.equal(created.status, 201);
      const productId = created.data.product_id;
      let found = await request(
        "/products?search=" + encodeURIComponent("หมวดทดสอบ"),
        { token: customer },
      );
      assert.equal(found.data.total, 1);
      assert.equal(found.data.data[0].category_name, "หมวดทดสอบ");
      const edited = await request("/products/" + productId, {
        method: "PUT",
        token: admin,
        body: { ...body, price: "99.99" },
      });
      assert.equal(edited.status, 200);
      assert.equal(
        (await post("/products", { ...body, sku: "BAD", price: -1 }, admin))
          .status,
        400,
      );
      assert.equal(
        (
          await post(
            "/products",
            { ...body, sku: "BAD", stock_qty: 0.5 },
            admin,
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await request("/products/" + productId, {
            method: "DELETE",
            token: admin,
          })
        ).status,
        200,
      );
      assert.equal(
        (await request("/products?search=AUDIT", { token: customer })).data
          .total,
        0,
      );
      assert.equal(
        (await request("/products?all=1&search=AUDIT", { token: admin })).data
          .total,
        1,
      );
    },
  );
  const orderBody = () => ({
    recipient_name: "ผู้ซื้อ ทดสอบ",
    recipient_phone: "0000000000",
    shipping_address: "มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี\nคลองหก ปทุมธานี",
    items: [{ product_id: pid, quantity: 2, price: 1 }],
    total_amount: 1,
  });
  await t.test(
    "Create order from server prices, reserve stock, idempotent retry and privacy",
    async () => {
      const key = crypto.randomUUID();
      const r = await post("/orders", orderBody(), customer, {
        "Idempotency-Key": key,
      });
      assert.equal(r.status, 201);
      orderId = r.data.order_id;
      const retry = await post("/orders", orderBody(), customer, {
        "Idempotency-Key": key,
      });
      assert.equal(retry.status, 200);
      assert.equal(retry.data.order_id, orderId);
      const details = await request("/orders/" + orderId, { token: customer });
      assert.equal(details.data.order.total_amount, "1180.00");
      assert.equal(details.data.items[0].quantity, 2);
      const [[p]] = await db.query(
        "SELECT stock_qty FROM products WHERE product_id=?",
        [pid],
      );
      assert.equal(p.stock_qty, 48);
      assert.equal(
        (await request("/orders/" + orderId, { token: other })).status,
        404,
      );
      assert.equal(
        (
          await post(
            "/orders",
            { ...orderBody(), items: [{ product_id: pid, quantity: 0 }] },
            customer,
            { "Idempotency-Key": crypto.randomUUID() },
          )
        ).status,
        400,
      );
    },
  );
  await t.test(
    "Payment validation, rejection, resubmission, approval, receipt and dashboard",
    async () => {
      assert.equal((await payment(orderId, customer, "1.00")).status, 400);
      const r = await payment(orderId);
      assert.equal(r.status, 201);
      paymentId = r.data.payment_id;
      assert.equal((await payment(orderId)).status, 409);
      assert.equal(
        (await request("/payments/" + paymentId + "/slip", { token: other }))
          .status,
        404,
      );
      assert.equal(
        (await request("/payments/" + paymentId + "/slip", { token: admin }))
          .status,
        200,
      );
      assert.equal(
        (
          await request("/orders/" + orderId + "/receipt", { token: customer })
        ).data
          .subarray(0, 5)
          .toString(),
        "%PDF-",
      );
      assert.equal(
        (await request("/admin/dashboard", { token: customer })).status,
        403,
      );
      assert.equal(
        (await request("/admin/dashboard", { token: admin })).data.summary
          .revenue,
        "0.00",
      );
      assert.equal(
        (
          await post(
            "/admin/payments/" + paymentId + "/review",
            { status: "rejected", reason: "หลักฐานตัวอย่างไม่ชัด" },
            admin,
          )
        ).status,
        200,
      );
      const again = await payment(orderId);
      assert.equal(again.status, 201);
      paymentId = again.data.payment_id;
      assert.equal(
        (
          await post(
            "/admin/payments/" + paymentId + "/review",
            { status: "approved" },
            admin,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await post(
            "/admin/payments/" + paymentId + "/review",
            { status: "approved" },
            admin,
          )
        ).status,
        409,
      );
      const receipt = await request("/orders/" + orderId + "/receipt", {
        token: customer,
      });
      assert.equal(receipt.status, 200);
      assert.equal(receipt.data.subarray(0, 5).toString(), "%PDF-");
      const out = path.resolve(__dirname, "../../output/pdf");
      fs.mkdirSync(out, { recursive: true });
      fs.writeFileSync(path.join(out, "sample-receipt.pdf"), receipt.data);
      const dashboard = await request("/admin/dashboard", { token: admin });
      assert.equal(dashboard.data.summary.revenue, "1180.00");
      assert.equal(dashboard.data.summary.paid_orders, 1);
      assert.equal(dashboard.data.daily.length, 1);
      assert.equal(
        (await post("/orders/" + orderId + "/cancel", {}, customer)).status,
        409,
      );
    },
  );
  await t.test(
    "Cancellation restores stock exactly once; concurrent orders cannot oversell",
    async () => {
      const r = await post("/orders", orderBody(), customer, {
        "Idempotency-Key": crypto.randomUUID(),
      });
      assert.equal(r.status, 201);
      assert.equal(
        (await post("/orders/" + r.data.order_id + "/cancel", {}, customer))
          .status,
        200,
      );
      assert.equal(
        (await post("/orders/" + r.data.order_id + "/cancel", {}, customer))
          .status,
        409,
      );
      await db.query("UPDATE products SET stock_qty=1 WHERE product_id=?", [
        pid,
      ]);
      const body = {
        ...orderBody(),
        items: [{ product_id: pid, quantity: 1 }],
      };
      const results = await Promise.all([
        post("/orders", body, customer, {
          "Idempotency-Key": crypto.randomUUID(),
        }),
        post("/orders", body, other, {
          "Idempotency-Key": crypto.randomUUID(),
        }),
      ]);
      assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
      const [[p]] = await db.query(
        "SELECT stock_qty FROM products WHERE product_id=?",
        [pid],
      );
      assert.equal(p.stock_qty, 0);
    },
  );
  await t.test(
    "Password reset delivery contract, one use under concurrency, session revocation",
    async () => {
      const unknown = await post("/auth/forgot-password", {
        email: "none@example.invalid",
      });
      const known = await post("/auth/forgot-password", {
        email: "buyer@example.invalid",
      });
      assert.equal(known.status, 200);
      assert.equal(known.data.message, unknown.data.message);
      assert.equal(captured.to, "buyer@example.invalid");
      assert.ok(captured.token);
      assert.equal(known.data.resetTokenForTesting, undefined);
      const body = {
        email: "buyer@example.invalid",
        token: captured.token,
        newPassword: "NewTest123!",
      };
      const results = await Promise.all([
        post("/auth/reset-password", body),
        post("/auth/reset-password", body),
      ]);
      assert.deepEqual(results.map((r) => r.status).sort(), [200, 400]);
      assert.equal((await request("/me", { token: customer })).status, 401);
      assert.equal(
        (await post("/auth/login", { username: "buyer", password: pass }))
          .status,
        401,
      );
      assert.ok(await login("buyer", "NewTest123!"));
      await post("/auth/forgot-password", { email: "buyer@example.invalid" });
      await db.query(
        "UPDATE password_reset_tokens SET expires_at=DATE_SUB(NOW(),INTERVAL 1 MINUTE) WHERE used_at IS NULL",
      );
      assert.equal(
        (await post("/auth/reset-password", { ...body, token: captured.token }))
          .status,
        400,
      );
    },
  );
});
