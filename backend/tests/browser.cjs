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
      colorScheme: "light",
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
    await page.getByLabel("ชื่อผู้ใช้", { exact: true }).fill("ui-buyer");
    await page
      .getByLabel("อีเมล", { exact: true })
      .fill("ui-buyer@example.invalid");
    await page.getByLabel("รหัสผ่าน", { exact: true }).fill("Browser123!");
    await page
      .getByLabel("ยืนยันรหัสผ่าน", { exact: true })
      .fill("Browser123!");
    await page
      .getByRole("button", { name: "สมัครสมาชิก", exact: true })
      .click();
    await page.waitForURL("**/login");
    await page.getByLabel("ชื่อผู้ใช้หรืออีเมล").fill("ui-buyer");
    await page.getByLabel("รหัสผ่าน", { exact: true }).fill("Browser123!");
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
    const cartRefresh = page.waitForResponse((r) =>
      r.url().endsWith("/cart/refresh"),
    );
    await page
      .getByRole("link", { name: "ดูตะกร้าสินค้า →", exact: true })
      .click();
    await cartRefresh;
    await page
      .getByLabel("ที่อยู่จัดส่ง", { exact: true })
      .fill("39 หมู่ 1 คลองหก ปทุมธานี 12120");
    await db.query(
      "UPDATE products SET price=600,version=version+1 WHERE sku='PB001'",
    );
    const checkoutButton = page.getByRole("button", {
      name: "ยืนยันคำสั่งซื้อและไปชำระเงิน",
      exact: true,
    });
    await checkoutButton.click();
    await page
      .getByText(
        "ราคา/สต็อกเปลี่ยนแปลง กรุณาตรวจสอบข้อมูลใหม่ แล้วกดยืนยันอีกครั้ง",
        { exact: true },
      )
      .waitFor();
    assert.ok(page.url().endsWith("/cart"));
    await page.getByText("฿600.00", { exact: true }).first().waitFor();
    await db.query(
      "UPDATE products SET price=590,version=version+1 WHERE sku='PB001'",
    );
    await checkoutButton.click();
    await page.getByText("฿590.00", { exact: true }).first().waitFor();
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
      colorScheme: "light",
      viewport: { width: 1440, height: 1000 },
    });
    const admin = await adminContext.newPage();
    admin.on("pageerror", (e) => errors.push(e.message));
    await admin.goto(base + "/login");
    await admin.getByLabel("ชื่อผู้ใช้หรืออีเมล").fill("admin-demo");
    await admin.getByLabel("รหัสผ่าน", { exact: true }).fill("DemoShop123!");
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
      .getByLabel("อัปโหลดรูปสินค้า JPG หรือ PNG ไม่เกิน 5 MB", { exact: true })
      .setInputFiles({
        name: "product.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jDk0AAAAASUVORK5CYII=",
          "base64",
        ),
      });
    await admin.getByLabel("ขนาดบรรจุ", { exact: true }).fill("15 ซอง");
    await admin
      .getByLabel("วิธีใช้", { exact: true })
      .fill("อ่านวิธีใช้บนฉลากผลิตภัณฑ์");
    await admin.screenshot({
      path: path.join(out, "admin-product-upload.png"),
      fullPage: true,
    });

    await admin
      .getByRole("button", { name: "บันทึกสินค้า", exact: true })
      .click();
    await admin.getByText("บันทึกสินค้าสำเร็จ", { exact: true }).waitFor();
    await admin.getByLabel("ค้นหาสินค้า", { exact: true }).fill("UI-SKU");
    await admin.getByRole("button", { name: "ค้นหา", exact: true }).click();
    await admin
      .getByRole("cell", { name: "สินค้าจากการทดสอบหน้าจอ", exact: true })
      .waitFor();
    const [[uploadedProduct]] = await db.query(
      "SELECT * FROM products WHERE sku='UI-SKU'",
    );
    assert.ok(
      fs.existsSync(
        path.join(
          require("../utils/mediaPaths").products,
          path.basename(uploadedProduct.image_path),
        ),
      ),
    );
    await admin
      .getByRole("row")
      .filter({ hasText: "UI-SKU" })
      .getByRole("button", { name: "แก้ไข", exact: true })
      .click();
    await db.query(
      "UPDATE products SET stock_qty=9,version=version+1 WHERE sku='UI-SKU'",
    );
    await admin
      .getByRole("button", { name: "บันทึกสินค้า", exact: true })
      .click();
    await admin
      .getByText("สินค้าเปลี่ยนแปลงระหว่างแก้ไข", { exact: false })
      .waitFor();
    await admin
      .getByRole("button", { name: "ปิดฟอร์มและโหลดข้อมูลล่าสุด", exact: true })
      .click();
    await admin
      .getByRole("row")
      .filter({ hasText: "UI-SKU" })
      .getByRole("button", { name: "แก้ไข", exact: true })
      .click();
    await admin
      .getByLabel("รายละเอียดสินค้า", { exact: true })
      .fill("แก้เฉพาะรายละเอียดโดยคงรูปและสต็อกล่าสุด");
    await admin
      .getByRole("button", { name: "บันทึกสินค้า", exact: true })
      .click();
    await admin.getByText("บันทึกสินค้าสำเร็จ", { exact: true }).waitFor();
    const [[preserved]] = await db.query(
      "SELECT stock_qty,image_path FROM products WHERE sku='UI-SKU'",
    );
    assert.equal(preserved.stock_qty, 9);
    assert.equal(preserved.image_path, uploadedProduct.image_path);
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
    const csvEvent = admin.waitForEvent("download");
    await admin
      .getByRole("button", { name: "ดาวน์โหลดข้อมูล", exact: true })
      .click();
    const csvFile = await csvEvent;
    await csvFile.saveAs(path.join(out, "dashboard.csv"));
    assert.ok(
      fs
        .readFileSync(path.join(out, "dashboard.csv"), "utf8")
        .includes('"590.00"'),
    );
    await admin.getByLabel("รูปแบบไฟล์", { exact: true }).selectOption("json");
    const jsonEvent = admin.waitForEvent("download");
    await admin
      .getByRole("button", { name: "ดาวน์โหลดข้อมูล", exact: true })
      .click();
    await (await jsonEvent).saveAs(path.join(out, "dashboard.json"));
    const exported = JSON.parse(
      fs.readFileSync(path.join(out, "dashboard.json"), "utf8"),
    );
    assert.equal(Number(exported.summary.revenue), 590);
    assert.equal(exported.time_zone, "Asia/Bangkok");
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
    await admin.goto(orderURL);
    await admin.getByLabel("บริษัทขนส่ง", { exact: true }).fill("ขนส่งทดสอบ");
    await admin.getByLabel("เลขพัสดุ", { exact: true }).fill("TEST-TRACK-001");
    await admin
      .getByRole("button", { name: "บันทึกข้อมูลจัดส่ง", exact: true })
      .click();
    await admin.getByText("บันทึกข้อมูลจัดส่งแล้ว", { exact: true }).waitFor();
    await page.goto(orderURL);
    await page.getByText("TEST-TRACK-001", { exact: true }).waitFor();
    await admin
      .getByRole("button", { name: "ยืนยันจัดส่งสำเร็จ", exact: true })
      .click();
    await admin
      .getByText("บันทึกคำสั่งซื้อสำเร็จแล้ว", { exact: true })
      .waitFor();
    await admin.goto(base + "/admin/dashboard");
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
    await page.getByRole("button", { name: "โหมดสว่าง", exact: false }).click();
    await page.reload();
    assert.equal(
      await page.locator("html").getAttribute("data-bs-theme"),
      "dark",
    );
    await page
      .getByRole("button", { name: "ตัวอักษรใหญ่", exact: false })
      .click();
    await page.reload();
    assert.equal(
      await page.locator("html").getAttribute("data-large-text"),
      "true",
    );
    for (const route of [
      "/",
      "/contact",
      "/profile",
      "/products",
      "/cart",
      "/orders",
      new URL(orderURL).pathname,
    ]) {
      await page.goto(base + route);
      await page.locator("main").waitFor();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        "Desktop overflow: " + route,
      );
    }
    await page.screenshot({
      path: path.join(out, "order-dark-large.png"),
      fullPage: true,
    });
    await page.goto(
      base +
        "/reset-password?email=ui-buyer%40example.invalid&token=" +
        "a".repeat(64),
    );
    await page.getByLabel("รหัสผ่านใหม่", { exact: true }).fill("Browser123!");
    assert.equal(await page.locator("#reset-rules .rule-met").count(), 6);
    await page
      .getByLabel("ยืนยันรหัสผ่านใหม่", { exact: true })
      .fill("NotSame123!");
    await page
      .getByRole("button", { name: "ตั้งรหัสผ่านใหม่", exact: true })
      .click();
    await page
      .getByText("รหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ต้องตรงกัน", { exact: true })
      .waitFor();
    await page.evaluate(() => {
      document.activeElement.blur();
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await page.waitForFunction(() => scrollY === 0);
    await page.screenshot({
      path: path.join(out, "reset-dark.png"),
      fullPage: true,
    });
    await page.getByRole("button", { name: "โหมดมืด", exact: false }).click();
    await page.evaluate(() => {
      document.activeElement.blur();
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await page.screenshot({
      path: path.join(out, "reset-light.png"),
      fullPage: true,
    });
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of [
        "/",
        "/contact",
        "/profile",
        "/products",
        "/cart",
        "/orders",
      ]) {
        await page.goto(base + route);
        await page.locator("main").waitFor();
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          `Large-text overflow: ${width} ${route}`,
        );
      }
    }
    await page.getByRole("button", { name: "โหมดสว่าง", exact: false }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + "/products");
    await page.screenshot({
      path: path.join(out, "products-dark-large-mobile.png"),
      fullPage: true,
    });
    await admin
      .getByRole("button", { name: "โหมดสว่าง", exact: false })
      .click();
    await admin.reload();
    await admin
      .getByRole("heading", { name: "Dashboard ยอดขาย", exact: true })
      .waitFor();
    await admin.getByText("฿590.00", { exact: true }).first().waitFor();
    await admin.screenshot({
      path: path.join(out, "dashboard-dark.png"),
      fullPage: true,
    });
    for (const route of ["/admin", "/admin/payments"]) {
      await admin.goto(base + route);
      await admin.locator("main").waitFor();
      assert.ok(
        await admin.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        "Admin overflow: " + route,
      );
    }
    // Exercise a real successful reset without sending an external email.
    const resetToken = crypto.randomBytes(32).toString("hex");
    const [[buyer]] = await db.query(
      "SELECT user_id FROM users WHERE username='ui-buyer'",
    );
    await db.query(
      "INSERT INTO password_reset_tokens (user_id,token_hash,expires_at) VALUES (?,?,DATE_ADD(NOW(),INTERVAL 15 MINUTE))",
      [
        buyer.user_id,
        crypto.createHash("sha256").update(resetToken).digest("hex"),
      ],
    );
    await page.goto(
      base +
        "/reset-password?email=ui-buyer%40example.invalid&token=" +
        resetToken,
    );
    await page
      .getByLabel("รหัสผ่านใหม่", { exact: true })
      .fill("NewBrowser123!");
    await page
      .getByLabel("ยืนยันรหัสผ่านใหม่", { exact: true })
      .fill("NewBrowser123!");
    await page
      .getByRole("button", { name: "ตั้งรหัสผ่านใหม่", exact: true })
      .click();
    await page.waitForURL("**/login?reset=success");
    await page.getByLabel("ชื่อผู้ใช้หรืออีเมล").fill("ui-buyer");
    await page.getByLabel("รหัสผ่าน", { exact: true }).fill("NewBrowser123!");
    await page
      .getByRole("button", { name: "เข้าสู่ระบบ", exact: true })
      .click();
    await page.waitForURL("**/products");
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
            "product image upload and preservation on edit",
            "stale Admin stock save rejected",
            "changed cart price requires confirmation",
            "shipping tracking and completion",
            "CSV and JSON downloads with actual sales totals",
            "theme and large-text persistence after reload",
            "password rules and reset confirmation",
            "large-text layout at 320, 390 and 768px",
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
              require("../utils/mediaPaths").slips,
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
