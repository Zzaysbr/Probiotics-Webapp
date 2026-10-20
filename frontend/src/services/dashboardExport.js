function safeCell(value) {
  let text = String(value ?? "");
  // Spreadsheet applications must treat product names as text, never formulas.
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function dashboardCsv(data) {
  const rows = [
    [
      "ประเภทรายงาน",
      "ตั้งแต่วันที่",
      "ถึงวันที่",
      "วันที่ / รายการ",
      "จำนวน",
      "จำนวนเงิน (บาท)",
    ],
    [
      "สรุป",
      data.start,
      data.end,
      "ยอดขายรวมที่อนุมัติ",
      data.summary.paid_orders,
      data.summary.revenue,
    ],
    [
      "สรุป",
      data.start,
      data.end,
      "หลักฐานรอตรวจทั้งหมด ณ เวลา export",
      data.summary.pending_payments,
      "",
    ],
    ...data.daily.map((d) => [
      "ยอดขายรายวัน",
      data.start,
      data.end,
      d.day,
      d.orders,
      d.revenue,
    ]),
    ...data.top.map((p) => [
      "สินค้าขายดี 5 อันดับ",
      data.start,
      data.end,
      p.name,
      p.quantity,
      p.revenue,
    ]),
    ...data.low_stock.map((p) => [
      "สต็อกปัจจุบัน ไม่จำกัดช่วงวันที่",
      "",
      "",
      p.product_name,
      p.stock_qty,
      "",
    ]),
  ];
  return "\uFEFF" + rows.map((row) => row.map(safeCell).join(",")).join("\r\n");
}
export function exportDashboard(data, format) {
  const json = format === "json";
  const content = json
    ? JSON.stringify(
        {
          exported_at: new Date().toISOString(),
          time_zone: "Asia/Bangkok",
          ...data,
        },
        null,
        2,
      )
    : dashboardCsv(data);
  const url = URL.createObjectURL(
    new Blob([content], {
      type: json ? "application/json;charset=utf-8" : "text/csv;charset=utf-8",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `dashboard-${data.start}-to-${data.end}.${json ? "json" : "csv"}`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
