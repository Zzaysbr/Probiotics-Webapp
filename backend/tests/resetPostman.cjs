const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mysql = require("mysql2/promise");
const assert = require("node:assert/strict");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
  quiet: true,
});
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = crypto.randomBytes(48).toString("hex");
process.env.DB_NAME = "probiotic_shop_reset_postman_" + process.pid;
let control, db, server, smtp;
(async () => {
  try {
    const cache = path.join(__dirname, "../.npm-cache/_npx");
    let newman;
    try {
      newman = require("newman");
    } catch {
      const root = fs
        .readdirSync(cache)
        .map((n) => path.join(cache, n, "node_modules/newman"))
        .find((p) => fs.existsSync(path.join(p, "package.json")));
      if (!root)
        throw new Error("Install Newman using the command in POSTMAN_GUIDE.md");
      newman = require(root);
    }
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
    smtp = await require("./smtpFixture.cjs")();
    Object.assign(process.env, {
      SMTP_HOST: "127.0.0.1",
      SMTP_PORT: String(smtp.port),
      SMTP_USER: "smtp-test@example.invalid",
      SMTP_PASS: "local-test-only",
    });
    server = require("../app").listen(0, "127.0.0.1");
    await new Promise((r) => server.once("listening", r));
    const base = "http://127.0.0.1:" + server.address().port + "/api";
    const email = "reset-postman@example.invalid",
      oldPassword = "ResetOld123!",
      newPassword = "ResetNew456!";
    function request(name, route, body, status, tests = [], token) {
      return {
        name,
        request: {
          method: body ? "POST" : "GET",
          header: [
            { key: "Content-Type", value: "application/json" },
            ...(token
              ? [{ key: "Authorization", value: "Bearer {{" + token + "}}" }]
              : []),
          ],
          url: base + route,
          ...(body ? { body: { mode: "raw", raw: JSON.stringify(body) } } : {}),
        },
        event: [
          {
            listen: "test",
            script: {
              exec: [
                `pm.test('HTTP ${status}',()=>pm.response.to.have.status(${status}));`,
                ...tests,
              ],
            },
          },
        ],
      };
    }
    const results = [];
    async function run(name, items) {
      const summary = await new Promise((resolve, reject) =>
        newman.run(
          {
            collection: {
              info: {
                name,
                schema:
                  "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
              },
              item: items,
            },
            reporters: "cli",
            timeoutRequest: 35000,
          },
          (e, s) => (e ? reject(e) : resolve(s)),
        ),
      );
      results.push({
        name,
        requests: summary.run.stats.requests,
        assertions: summary.run.stats.assertions,
        failures: summary.run.failures.map((f) => ({
          name: f.source?.name,
          message: f.error?.message,
        })),
      });
      assert.equal(summary.run.failures.length, 0);
    }
    await run("Password reset — actual SMTP delivery to local test receiver", [
      request(
        "Create isolated test account",
        "/auth/register",
        {
          username: "reset-postman",
          email,
          password: oldPassword,
          full_name: "Reset test",
        },
        201,
      ),
      request(
        "Invalid email rejected",
        "/auth/forgot-password",
        { email: "not-an-email" },
        400,
      ),
      request(
        "Unknown email does not reveal existence",
        "/auth/forgot-password",
        { email: "not-registered@example.invalid" },
        200,
      ),
      request(
        "Request email through actual Nodemailer + SMTP",
        "/auth/forgot-password",
        { email },
        200,
        [
          "pm.test('No public reset token',()=>pm.expect(pm.response.json()).not.to.have.property('resetTokenForTesting'));",
        ],
      ),
    ]);
    assert.equal(smtp.messages.length, 1);
    assert.equal(smtp.messages[0].recipient, email);
    const token = smtp.messages[0].token;
    assert.match(token, /^[a-f0-9]{64}$/);
    await run("Password reset — use the token received via SMTP", [
      request(
        "Login before reset",
        "/auth/login",
        { username: email, password: oldPassword },
        200,
        ["pm.collectionVariables.set('oldToken',pm.response.json().token);"],
      ),
      request(
        "Reset using token from SMTP email",
        "/auth/reset-password",
        { email, token, newPassword },
        200,
      ),
      request(
        "Used token rejected",
        "/auth/reset-password",
        { email, token, newPassword },
        400,
      ),
      request(
        "Old password rejected",
        "/auth/login",
        { username: email, password: oldPassword },
        401,
      ),
      request(
        "New password works",
        "/auth/login",
        { username: email, password: newPassword },
        200,
        ["pm.collectionVariables.set('newToken',pm.response.json().token);"],
      ),
      request("Old JWT revoked", "/me", null, 401, [], "oldToken"),
      request(
        "New JWT accesses own profile",
        "/me",
        null,
        200,
        [
          "pm.test('Correct account',()=>pm.expect(pm.response.json().user.username).to.eql('reset-postman'));",
        ],
        "newToken",
      ),
    ]);
    fs.writeFileSync(
      path.join(__dirname, "../../docs/PASSWORD_RESET_RESULTS.json"),
      JSON.stringify(
        {
          runner: "Newman (Postman Runtime)",
          date: new Date().toISOString(),
          emailTransport:
            "Actual Nodemailer SMTP conversation with a loopback-only test receiver; no mocking and no external recipients",
          smtpMessages: smtp.messages.length,
          runs: results,
        },
        null,
        2,
      ),
    );
    console.log(
      "PASS: reset email received over SMTP, reset successful, reuse refused, old password and old JWT rejected.",
    );
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    if (server) await new Promise((r) => server.close(r));
    if (smtp) await smtp.close();
    if (db) await db.end();
    if (control) {
      if (!/^probiotic_shop_reset_postman_\d+$/.test(process.env.DB_NAME))
        throw new Error("Unsafe cleanup");
      await control.query("DROP DATABASE `" + process.env.DB_NAME + "`");
      await control.end();
    }
  }
})();
