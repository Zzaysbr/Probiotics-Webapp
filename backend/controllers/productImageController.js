const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const { products } = require("../utils/mediaPaths");
const { HttpError } = require("../utils/http");
exports.upload = async (req, res) => {
  if (!req.file) throw new HttpError(400, "กรุณาเลือกรูปสินค้า JPG หรือ PNG");
  const b = req.file.buffer;
  let ext;
  if (b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    ext = "png";
  else if (b[0] === 255 && b[1] === 216 && b[2] === 255) ext = "jpg";
  else throw new HttpError(400, "รองรับเฉพาะรูป JPG หรือ PNG ที่ถูกต้อง");
  try {
    const doc = new PDFDocument({ autoFirstPage: false });
    doc.on("data", () => {});
    const image = doc.openImage(b);
    if (
      image.width < 1 ||
      image.height < 1 ||
      image.width > 10000 ||
      image.height > 10000 ||
      image.width * image.height > 25000000
    )
      throw Error("dimensions");
    doc.end();
  } catch {
    throw new HttpError(400, "รูปภาพไม่ถูกต้อง หรือมีขนาดเกิน 25 ล้านพิกเซล");
  }
  const filename = crypto.randomUUID() + "." + ext;
  await fs.writeFile(path.join(products, filename), b, { flag: "wx" });
  res
    .status(201)
    .json({
      image_path: "/image/pdimages/" + filename,
      message: "อัปโหลดรูปแล้ว กดบันทึกสินค้าเพื่อใช้งานรูปนี้",
    });
};
