const PDFDocument = require("pdfkit");
const fs = require("fs");
const shop = require("../shopConfig");
const { HttpError } = require("./http");
module.exports = async function receipt(res, order, items, payment) {
  const font = [
    process.env.RECEIPT_FONT_PATH,
    "C:/Windows/Fonts/tahoma.ttf",
    "/usr/share/fonts/truetype/noto/NotoSansThai-Regular.ttf",
  ].find((p) => p && fs.existsSync(p));
  if (!font)
    throw new HttpError(
      503,
      "ไม่พบฟอนต์ภาษาไทย กรุณาตั้งค่า RECEIPT_FONT_PATH เป็นไฟล์ TTF ที่รองรับภาษาไทย",
    );
  const doc = new PDFDocument({
    size: "A4",
    margin: 48,
    bufferPages: true,
    info: {
      Title: "Probiotic Shop " + (order.receipt_no || order.order_no),
      Author: shop.name,
    },
  });
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="receipt-${order.order_id}.pdf"`,
  });
  doc.on("error", (error) => res.destroy(error));
  doc.pipe(res);
  doc.font(font);
  const money = (n) =>
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " THB";
  const heading = () => {
    doc.fillColor("#315f45").fontSize(20).text(shop.name);
    doc
      .fillColor("#555")
      .fontSize(9)
      .text(shop.address)
      .text("โทรศัพท์ " + shop.phone);
    doc.moveDown();
  };
  heading();
  doc
    .fillColor("#222")
    .fontSize(17)
    .text(
      payment.status === "approved"
        ? "ใบเสร็จรับเงิน / RECEIPT"
        : "ใบรับแจ้งชำระเงิน / PAYMENT SUBMITTED",
    );
  doc
    .fontSize(10)
    .text("เลขที่: " + (order.receipt_no || "SUB-" + payment.payment_id))
    .text("คำสั่งซื้อ: " + order.order_no)
    .text("วันที่: " + (order.receipt_issued_at || payment.created_at));
  doc
    .moveDown()
    .text("ผู้ซื้อ / ผู้รับ: " + order.recipient_name)
    .text("โทรศัพท์: " + order.recipient_phone)
    .text("ที่อยู่จัดส่ง: " + order.shipping_address, { width: 490 });
  doc
    .moveDown()
    .fillColor("#315f45")
    .text(
      payment.status === "approved"
        ? "สถานะ: ยืนยันรับชำระเงินแล้ว"
        : "สถานะ: ส่งข้อมูลสำเร็จ รอผู้ดูแลตรวจสอบ ยังไม่ใช่หลักฐานยืนยันรับเงิน",
    );
  doc.moveDown();
  function tableHead() {
    const y = doc.y;
    doc.rect(48, y, 499, 25).fill("#eaf2ec");
    doc
      .fillColor("#222")
      .fontSize(10)
      .text("สินค้า / Product", 56, y + 6, { width: 250 })
      .text("จำนวน", 315, y + 6, { width: 50, align: "right" })
      .text("ราคา/ชิ้น", 369, y + 6, { width: 80, align: "right" })
      .text("รวม", 453, y + 6, { width: 86, align: "right" });
    doc.y = y + 32;
  }
  if (doc.y > 650) {
    doc.addPage();
    heading();
  }
  tableHead();
  for (const item of items) {
    doc.fontSize(10);
    const h = Math.max(
      34,
      doc.heightOfString(
        item.product_name_snapshot + "\n" + item.sku_snapshot,
        { width: 250 },
      ) + 12,
    );
    if (doc.y + h > 735) {
      doc.addPage();
      heading();
      tableHead();
    }
    const y = doc.y;
    doc
      .fillColor("#222")
      .text(item.product_name_snapshot + "\n" + item.sku_snapshot, 56, y, {
        width: 250,
      })
      .text(String(item.quantity), 315, y, { width: 50, align: "right" })
      .text(money(item.unit_price), 369, y, { width: 80, align: "right" })
      .text(money(Number(item.unit_price) * item.quantity), 453, y, {
        width: 86,
        align: "right",
      });
    doc
      .moveTo(48, y + h - 5)
      .lineTo(547, y + h - 5)
      .strokeColor("#dce3dc")
      .stroke();
    doc.y = y + h;
  }
  if (doc.y > 620) {
    doc.addPage();
    heading();
  }
  doc
    .moveDown()
    .fillColor("#222")
    .fontSize(11)
    .text("ยอดสินค้า: " + money(order.subtotal), 48, doc.y, {
      width: 499,
      align: "right",
    })
    .text("ค่าจัดส่ง: " + money(order.shipping_fee), { align: "right" })
    .fontSize(14)
    .fillColor("#315f45")
    .text("ยอดรวมสุทธิ: " + money(order.total_amount), { align: "right" });
  doc
    .moveDown()
    .fontSize(9)
    .fillColor("#555")
    .text(
      "วิธีชำระ: โอนเงิน | วันเวลาโอน: " + payment.transferred_at,
      48,
      doc.y,
      { width: 499, align: "left" },
    )
    .text("เอกสารนี้ไม่ใช่ใบกำกับภาษี");
  if (shop.demo) doc.text("ระบบสาธิตสำหรับโครงงาน ไม่มีการโอนเงินจริง");
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .fillColor("#777")
      .text(`Probiotic Shop | ${i + 1} / ${range.count}`, 48, 780, {
        lineBreak: false,
      });
  }
  doc.end();
};
