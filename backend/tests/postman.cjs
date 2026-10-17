const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mysql = require("mysql2/promise");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
  quiet: true,
});
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = crypto.randomBytes(48).toString("hex");
process.env.DB_NAME = "probiotic_shop_postman_" + process.pid;
let control, db, server;
(async () => {
  try {
    const cache = path.join(__dirname, "../.npm-cache/_npx");
    const root = fs.existsSync(cache)
      ? fs
          .readdirSync(cache)
          .map((n) => path.join(cache, n, "node_modules/newman"))
          .find((p) => fs.existsSync(path.join(p, "package.json")))
      : null;
    let newman;
    try {
      newman = require("newman");
    } catch {
      if (!root)
        throw new Error(
          "Install Newman first: npm exec --yes --package=newman --cache .npm-cache -- newman --version",
        );
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
    await require("../scripts/demoSeed")(db);
    server = require("../app").listen(0, "127.0.0.1");
    await new Promise((r) => server.once("listening", r));
    const collection = JSON.parse(
      fs.readFileSync(
        path.join(
          __dirname,
          "../../docs/ProbioticShop.postman_collection.json",
        ),
        "utf8",
      ),
    );
    const summary = await new Promise((resolve, reject) =>
      newman.run(
        {
          collection,
          envVar: [
            {
              key: "baseUrl",
              value: "http://127.0.0.1:" + server.address().port + "/api",
            },
          ],
          reporters: "cli",
        },
        (e, s) => (e ? reject(e) : resolve(s)),
      ),
    );
    const safe = {
      runner: "Newman (Postman Runtime)",
      date: new Date().toISOString(),
      requests: summary.run.stats.requests,
      assertions: summary.run.stats.assertions,
      failures: summary.run.failures.map((f) => ({
        name: f.source?.name,
        message: f.error?.message,
      })),
    };
    fs.writeFileSync(
      path.join(__dirname, "../../docs/POSTMAN_RESULTS.json"),
      JSON.stringify(safe, null, 2),
    );
    if (safe.failures.length) throw new Error("Postman assertions failed");
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    if (server) await new Promise((r) => server.close(r));
    if (db) await db.end();
    if (control) {
      if (!/^probiotic_shop_postman_\d+$/.test(process.env.DB_NAME))
        throw new Error("Unsafe cleanup");
      await control.query("DROP DATABASE `" + process.env.DB_NAME + "`");
      await control.end();
    }
  }
})();
