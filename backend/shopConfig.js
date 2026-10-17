module.exports = {
  name: process.env.SHOP_NAME || "Probiotic Shop",
  address:
    process.env.SHOP_ADDRESS ||
    "มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี 39 หมู่ 1 ตำบลคลองหก อำเภอคลองหลวง จังหวัดปทุมธานี 12120",
  phone: process.env.SHOP_PHONE || "02 549 4990-2",
  email: process.env.SHOP_EMAIL || "probiotic-shop@example.invalid",
  bank_name: process.env.BANK_NAME || "ธนาคารสาธิต (ไม่มีอยู่จริง)",
  bank_account: process.env.BANK_ACCOUNT || "DEMO-PROBIOTIC-0001",
  bank_owner: process.env.BANK_OWNER || "Probiotic Shop",
  demo: process.env.DEMO_MODE !== "false",
};
