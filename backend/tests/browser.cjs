const mysql = require("mysql2/promise");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const assert = require("assert/strict");
const { chromium } = require("playwright");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
  quiet: true,
});
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = crypto.randomBytes(48).toString("hex");
process.env.DB_NAME = "probiotic_shop_browser_" + process.pid;
process.env.CLIENT_URL = "http://127.0.0.1:5174";
let control, db, server, vite, browser;
const errors = [],
  files = [];
const out = path.resolve(__dirname, "../../output/browser");
fs.mkdirSync(out, { recursive: true });
(async () => {
  try {
    control = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
    });
    await control.query(
      "CREATE DATABASE `" +
        process.env.DB_NAME +
        "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    );
    db = require("../db");
    await require("../scripts/migrate")(db);
    await require("../scripts/demoSeed")(db);
    server = require("../app").listen(0, "127.0.0.1");
    await new Promise((r) => server.once("listening", r));
    vite = spawn(
      process.execPath,
      [
        path.resolve(__dirname, "../../frontend/node_modules/vite/bin/vite.js"),
        "--host",
        "127.0.0.1",
        "--port",
        "5174",
        "--strictPort",
      ],
      {
        cwd: path.resolve(__dirname, "../../frontend"),
        env: {
          ...process.env,
          VITE_API_BASE_URL:
            "http://127.0.0.1:" + server.address().port + "/api",
        },
        stdio: "pipe",
        windowsHide: true,
      },
    );
    await new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Vite startup timeout")),
        20000,
      );
      vite.stdout.on("data", (b) => {
        if (b.toString().includes("5174")) {
          clearTimeout(timer);
          resolve();
        }
      });
      vite.on("exit", (code) => reject(new Error("Vite exit " + code)));
    });
    browser = await chromium.launch({ headless: true, channel: "msedge" });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      acceptDownloads: true,
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    const base = "http://127.0.0.1:5174";
    await page.goto(base + "/register");
    await page
      .getByLabel("ชื่อ-นามสกุล", { exact: true })
      .fill("สมาชิกทดสอบหน้าจอ");
    await page.getByLabel("เบอร์โทรศัพท์", { exact: true }).fill("0000000000");
    await page.getByLabel("Username", { exact: true }).fill("ui-buyer");
    await page
      .getByLabel("Email", { exact: true })
      .fill("ui-buyer@example.invalid");
    await page.getByLabel("Password", { exact: true }).fill("Browser123!");
    await page.getByLabel("ยืนยันรหัสผ่าน", { exact: true }).fill("Browser123!");
    await page
      .getByRole("button", { name: "สมัครสมาชิก", exact: true })
      .click();
    await page.waitForURL("**/login");
    await page.getByLabel("Username หรือ Email").fill("ui-buyer");
    await page.getByLabel("Password", { exact: true }).fill("Browser123!");
    await page
      .getByRole("button", { name: "เข้าสู่ระบบ", exact: true })
      .click();
    await page.waitForURL("**/products");
    await page
      .getByRole("heading", { name: "Probiotic Daily Balance", exact: true })
      .waitFor();
    await page.screenshot({
      path: path.join(out, "products-desktop.png"),
      fullPage: true,
    });
    await page
      .getByRole("link", { name: "ดูโปรไฟล์ของฉัน", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "ข้อมูลส่วนตัว", exact: true })
      .waitFor();
    assert.ok(
      (await page.locator(".profile-fields").innerText()).includes("ui-buyer"),
    );
    assert.ok(
      (await page.locator(".profile-fields").innerText()).includes(
        "ui-buyer@example.invalid",
      ),
    );
    await page.goto(base + "/products");
    await page
      .getByRole("heading", { name: "Probiotic Daily Balance", exact: true })
      .waitFor();
    await page
      .getByLabel("ค้นหาสินค้า", { exact: true })
      .fill("does-not-exist");
    await page.getByRole("button", { name: "ค้นหา", exact: true }).click();
    await page.getByText("ไม่พบสินค้าที่ค้นหา", { exact: true }).waitFor();
    await page.getByLabel("ค้นหาสินค้า", { exact: true }).fill("PB001");
    await page.getByRole("button", { name: "ค้นหา", exact: true }).click();
    await page
      .getByRole("heading", { name: "Probiotic Daily Balance", exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "เพิ่มในตะกร้า", exact: true })
      .click();
    await page
      .getByRole("link", { name: "ดูตะกร้าสินค้า →", exact: true })
      .click();
    await page
      .getByLabel("ที่อยู่จัดส่ง", { exact: true })
      .fill("39 หมู่ 1 คลองหก ปทุมธานี 12120");
    await page
      .getByRole("button", {
        name: "ยืนยันคำสั่งซื้อและไปชำระเงิน",
        exact: true,
      })
      .click();
    await page.waitForURL(/\/orders\/\d+$/);
    await page
      .getByRole("heading", { name: "ชำระเงิน / แจ้งโอน", exact: true })
      .waitFor();
    const orderURL = page.url();
    const [[clock]] = await db.query(
      "SELECT DATE_FORMAT(NOW(),'%Y-%m-%dT%H:%i') AS time",
    );
    await page.getByLabel("วันเวลาโอน (เวลาไทย)").fill(clock.time);
    await page
      .getByLabel("หลักฐาน JPG, PNG หรือ PDF ไม่เกิน 5 MB")
      .setInputFiles({
        name: "demo-slip.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jDk0AAAAASUVORK5CYII=",
          "base64",
        ),
      });
    await page
      .getByRole("button", { name: "ยืนยันข้อมูลการชำระเงิน", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "แจ้งชำระเงินสำเร็จ", exact: true })
      .waitFor();
    await page.screenshot({
      path: path.join(out, "payment-submitted.png"),
      fullPage: true,
    });
    const adminContext = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const admin = await adminContext.newPage();
    admin.on("pageerror", (e) => errors.push(e.message));
    await admin.goto(base + "/login");
    await admin.getByLabel("Username หรือ Email").fill("admin-demo");
    await admin.getByLabel("Password", { exact: true }).fill("DemoShop123!");
    await admin
      .getByRole("button", { name: "เข้าสู่ระบบ", exact: true })
      .click();
    await admin.waitForURL("**/admin");
    await admin
      .getByRole("heading", { name: "จัดการสินค้า", exact: true })
      .waitFor();
    await admin
      .getByRole("button", { name: "+ เพิ่มสินค้า", exact: true })
      .click();
    await admin.getByLabel("SKU", { exact: true }).fill("UI-SKU");
    await admin
      .getByLabel("ชื่อสินค้า", { exact: true })
      .fill("สินค้าจากการทดสอบหน้าจอ");
    await admin
      .getByLabel("หมวดหมู่", { exact: true })
      .selectOption({ label: "แบบผงหรือซอง" });
    await admin
      .getByLabel("แบรนด์", { exact: true })
      .selectOption({ label: "BioCare" });
    await admin.getByLabel("ราคา (บาท)", { exact: true }).fill("199.50");
    await admin.getByLabel("จำนวนคงเหลือ", { exact: true }).fill("10");
    await admin
      .getByRole("button", { name: "บันทึกสินค้า", exact: true })
      .click();
    await admin.getByText("บันทึกสินค้าสำเร็จ", { exact: true }).waitFor();
    await admin.getByLabel("ค้นหาสินค้า", { exact: true }).fill("UI-SKU");
    await admin.getByRole("button", { name: "ค้นหา", exact: true }).click();
    await admin
      .getByRole("cell", { name: "สินค้าจากการทดสอบหน้าจอ", exact: true })
      .waitFor();
    await admin.getByRole("link", { name: "ตรวจชำระ", exact: true }).click();
    await admin
      .getByRole("button", { name: "ยืนยันรับชำระ", exact: true })
      .click();
    await admin.getByText("ยืนยันรับชำระเงินแล้ว", { exact: true }).waitFor();
    await admin.getByRole("link", { name: "Dashboard", exact: true }).click();
    await admin
      .getByRole("heading", { name: "Dashboard ยอดขาย", exact: true })
      .waitFor();
    await admin.getByText("฿590.00", { exact: true }).first().waitFor();
    await admin.screenshot({
      path: path.join(out, "dashboard.png"),
      fullPage: true,
    });
    await page.goto(orderURL);
    await page
      .getByRole("heading", { name: "ชำระเงินเรียบร้อยแล้ว", exact: true })
      .waitFor();
    const downloaded = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "ดาวน์โหลดใบเสร็จ PDF", exact: true })
      .click();
    const pdf = await downloaded;
    await pdf.saveAs(path.join(out, "browser-receipt.pdf"));
    assert.equal(
      fs
        .readFileSync(path.join(out, "browser-receipt.pdf"))
        .subarray(0, 5)
        .toString(),
      "%PDF-",
    );
    const mobile = await context.newPage();
    await mobile.setViewportSize({ width: 390, height: 844 });
    await mobile.goto(base + "/products");
    await mobile
      .getByRole("heading", { name: "สินค้าทั้งหมด", exact: true })
      .waitFor();
    await mobile
      .getByRole("button", { name: "เปิดปิดเมนู", exact: true })
      .click();
    await mobile
      .getByRole("link", { name: "คำสั่งซื้อ", exact: true })
      .waitFor({ state: "visible" });
    await mobile
      .getByRole("button", { name: "เปิดปิดเมนู", exact: true })
      .click();
    await mobile.screenshot({
      path: path.join(out, "products-mobile.png"),
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    console.log(
      "PASS: browser registration/login, product search, cart/order/payment, Admin CRUD/search/review, dashboard, PDF download, mobile menu.",
    );
    fs.writeFileSync(
      path.join(out, "result.json"),
      JSON.stringify(
        {
          passed: true,
          checks: [
            "registration/login",
            "authenticated own profile",
            "product search",
            "cart checkout",
            "payment upload",
            "admin product creation and search",
            "payment approval",
            "dashboard total",
            "PDF download",
            "mobile navigation",
          ],
          pageErrors: errors,
        },
        null,
        2,
      ),
    );
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
    if (browser) {
      const contexts = browser.contexts();
      for (let i = 0; i < contexts.length; i++) {
        const pages = contexts[i].pages();
        if (pages[0])
          await pages[0]
            .screenshot({
              path: path.join(out, "failure-" + i + ".png"),
              fullPage: true,
            })
            .catch(() => {});
      }
    }
  } finally {
    if (browser) await browser.close();
    if (vite) vite.kill();
    if (server) await new Promise((r) => server.close(r));
    if (db) {
      const [rows] = await db.query("SELECT slip_path FROM payments");
      for (const row of rows)
        await fs.promises
          .unlink(
            path.join(
              __dirname,
              "../storage/slips",
              path.basename(row.slip_path),
            ),
          )
          .catch(() => {});
      await db.end();
    }
    if (control) {
      if (!/^probiotic_shop_browser_\d+$/.test(process.env.DB_NAME))
        throw new Error("Unsafe DB cleanup");
      await control.query("DROP DATABASE `" + process.env.DB_NAME + "`");
      await control.end();
    }
  }
})();
