const fs = require("fs");
const path = require("path");
const db = require("../db");
const docs = path.resolve(__dirname, "../../docs");
const descriptions = {
  version:
    "เวอร์ชันข้อมูลสินค้า เพิ่มเมื่อแก้ไข/จอง/คืนสต็อก ป้องกันฟอร์มเก่าเขียนทับ",
  package_size: "ขนาดบรรจุตามฉลากสินค้า",
  usage_instructions: "วิธีใช้ตามข้อมูลสินค้า",
  storage_instructions: "วิธีเก็บรักษา",
  caution: "ข้อควรระวัง",
  request_hash:
    "SHA-256 ของข้อมูลคำสั่งซื้อที่ยืนยัน ตรวจการใช้ request key กับข้อมูลอื่น",
  expires_at: "เวลาหมดอายุ (เวลาไทย UTC+7)",
  carrier: "บริษัทขนส่ง",
  shipped_at: "เวลาบันทึกจัดส่ง",
  delivered_at: "เวลาที่ Admin ยืนยันรายการสำเร็จ",
};
(async () => {
  const previous = fs.readFileSync(
    path.join(docs, "DATA_DICTIONARY.md"),
    "utf8",
  );
  const old = {};
  let section = "";
  for (const line of previous.split("\n")) {
    if (line.startsWith("## ")) section = line.slice(3).trim();
    const cells = line.split("|").map((s) => s.trim());
    if (cells.length >= 8 && !["Field", "---"].includes(cells[1]))
      old[section + "." + cells[1]] = cells[6];
  }
  let result =
    "# Data Dictionary\n\nปรับปรุง 20 ตุลาคม 2569 จาก metadata ของฐานข้อมูลหลัง migration เวลา DATETIME ใช้ UTC+7 ราคาเก็บ DECIMAL\n\n";
  for (const table of [
    "users",
    "categories",
    "brands",
    "products",
    "orders",
    "order_items",
    "payments",
    "password_reset_tokens",
  ]) {
    const [columns] = await db.query("SHOW COLUMNS FROM " + table);
    result +=
      "## " +
      table +
      "\n\n| Field | Type | Null | Key | Default | ความหมาย |\n| --- | --- | --- | --- | --- | --- |\n";
    for (const c of columns)
      result += `| ${c.Field} | ${c.Type} | ${c.Null} | ${c.Key || "-"} | ${c.Default ?? "NULL"} | ${descriptions[c.Field] || old[table + "." + c.Field] || c.Field} |\n`;
    const [keys] = await db.query(
      "SELECT COLUMN_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND REFERENCED_TABLE_NAME IS NOT NULL",
      [table],
    );
    for (const k of keys)
      result += `\nFK: \`${k.COLUMN_NAME}\` → \`${k.REFERENCED_TABLE_NAME}.${k.REFERENCED_COLUMN_NAME}\`.\n`;
    result += "\n";
  }
  fs.writeFileSync(
    path.join(docs, "DATA_DICTIONARY.md"),
    result.trimEnd() + "\n",
  );
  console.log("Updated dictionary for 8 tables; no account data exported.");
})()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => db.end());
