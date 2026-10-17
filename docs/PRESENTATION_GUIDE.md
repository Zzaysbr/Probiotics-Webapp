# ลำดับนำเสนอด้วย Postman

เปิด backend ที่พอร์ต 3000 และ frontend ที่ 5173 ก่อน ใช้ Collection **Probiotic Shop — PRESENTATION**

## ช่วง JWT ที่ควรแสดงก่อน (ประมาณ 3 นาที)

1. หมวด 01 ข้อ 01: GET /products ไม่มี Authorization → Send ได้ 401
2. ข้อ 02: เปิด Body → raw JSON ให้ดู username/password บัญชีสาธิต → Send ได้ 200 และ JWT ใน Response
3. เปิด Scripts → Post-response ให้ดูโค้ดที่เก็บ token ลง memberToken อัตโนมัติ
4. ข้อ 03: เปิด Authorization → Bearer Token = {{memberToken}} → Send ได้ 200 พร้อมสินค้าจาก MySQL
5. ข้อ 04: มี token customer แต่ POST เพิ่มสินค้า → 403 เพื่อยืนยันการแบ่งสิทธิ์
6. ข้อ 05: Login Admin → ได้ adminToken จากนั้นใช้จัดการสินค้าในหมวด 02

## ควรเปิดแท็บไหนให้อาจารย์ดู

| แท็บ | สิ่งที่แสดง |
| --- | --- |
| URL + Method ด้านบน | เส้นทางและชนิดคำขอ เช่น POST /api/auth/login |
| Body → raw → JSON | ข้อมูลที่ส่งไปยัง Node.js ไม่ใช่โค้ด backend |
| Authorization | JWT แบบ Bearer Token |
| Scripts → Post-response | โค้ด JavaScript ทดสอบสถานะ/เก็บ token |
| Response ด้านล่าง | JSON, สถานะ HTTP และเวลาตอบกลับ |
| Documentation / Description ของ request | ตำแหน่งและตัวอย่างโค้ด Node.js ที่จัดเตรียมให้ |

Postman ไม่ได้เปิดซอร์ส Node.js ทั้งโครงการเหมือน VS Code โค้ดจริงอยู่ในไฟล์ด้านล่าง; Request Description มีตัวอย่างส่วนที่เกี่ยวข้องให้เปิดอธิบายใน Postman

## แผนที่โค้ดจริง

| ส่วน | ไฟล์ |
| --- | --- |
| mount /api/auth และ /api/products | backend/app.js |
| register/login/forgot/reset routes | backend/routes/authRoutes.js |
| bcrypt, ออก JWT และ reset token | backend/controllers/authController.js |
| ตรวจ JWT/role | backend/middlewares/authMiddleware.js |
| routes CRUD สินค้า | backend/routes/productRoutes.js |
| SQL ค้นหา/เพิ่ม/แก้ไข/ซ่อนสินค้า | backend/controllers/productController.js |
| ออร์เดอร์ ชำระเงิน Dashboard | backend/routes/shopRoutes.js |
| ส่งอีเมล | backend/utils/emailService.js |
| ใบเสร็จ PDF | backend/utils/receipt.js |
| เชื่อม MySQL | backend/db.js |

## ต่อด้วยการสั่งซื้อ

หมวด 03 เรียกสร้างออร์เดอร์ → เปิดรายละเอียด → form-data เลือกหลักฐานตัวอย่าง → แจ้งชำระ หมวด 04 เปิดรายการ payment → ดาวน์โหลดหลักฐาน → อนุมัติ → เปิดใบเสร็จและ dashboard เลือกอนุมัติหรือปฏิเสธอย่างใดอย่างหนึ่ง อย่ากด Run ทั้งชุด เพราะบาง request เป็นทางเลือกแทนกัน

## รีเซ็ตรหัสผ่าน

หมวด 05 ตั้ง resetEmail → ส่งคำขอ → เปิดอีเมล → คัดลอก token มาใส่ resetToken และตั้ง newPassword → reset → login ด้วยรหัสใหม่ อย่ากดขออีเมลใหม่หลังคัดลอก token เพราะ token เดิมจะถูกยกเลิก

Collection นี้ไม่มีรหัสผ่านจริงของบุคคล ไม่เก็บ JWT_SECRET หรือ DB_PASS และไม่ได้เปลี่ยนสิทธิ์แชร์ Workspace ของคุณ
