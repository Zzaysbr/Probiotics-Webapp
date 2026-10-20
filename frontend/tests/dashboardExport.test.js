import { test } from "node:test";
import assert from "node:assert/strict";
import { dashboardCsv } from "../src/services/dashboardExport.js";

test("CSV preserves Thai, exact displayed dates/totals, quoting and spreadsheet-safe names", () => {
  const csv = dashboardCsv({
    start: "2026-10-01",
    end: "2026-10-20",
    summary: { paid_orders: 2, revenue: "1180.00", pending_payments: 3 },
    daily: [{ day: "2026-10-20", orders: 2, revenue: "1180.00" }],
    top: [
      { name: '=HYPERLINK("bad"),ชื่อสินค้า', quantity: 2, revenue: "1180.00" },
    ],
    low_stock: [{ product_name: "โปรไบโอติก\nแบบผง", stock_qty: 4 }],
  });
  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.ok(csv.includes('"2026-10-01","2026-10-20"'));
  assert.ok(csv.includes('"2026-10-20","2","1180.00"'));
  assert.ok(csv.includes(`"'=HYPERLINK(""bad""),ชื่อสินค้า"`));
  assert.ok(
    csv.includes(
      '"สต็อกปัจจุบัน ไม่จำกัดช่วงวันที่","","","โปรไบโอติก\nแบบผง","4",""',
    ),
  );
});
test("empty reports still export the summary and columns", () => {
  const csv = dashboardCsv({
    start: "2026-10-01",
    end: "2026-10-20",
    summary: { paid_orders: 0, revenue: "0.00", pending_payments: 0 },
    daily: [],
    top: [],
    low_stock: [],
  });
  assert.equal(csv.split("\r\n").length, 3);
  assert.ok(csv.includes('"0","0.00"'));
});
