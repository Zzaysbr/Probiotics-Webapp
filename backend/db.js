const mysql = require("mysql2/promise");
require("dotenv").config({
  quiet: true,
  path: require("path").join(__dirname, ".env"),
});
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "probiotic_shop",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  charset: "utf8mb4",
});
pool.on("connection", (connection) =>
  connection.query("SET time_zone='+07:00'"),
);
module.exports = pool;
