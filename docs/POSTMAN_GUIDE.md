# คู่มือทดสอบ JWT ด้วย Postman

สำหรับเทียบสไลด์ JWT ของอาจารย์โดยตรง ใช้ [JWT_Lesson.postman_collection.json](JWT_Lesson.postman_collection.json) และอ่าน [ผลตรวจและบทพูด](JWT_LESSON_REVIEW_TH.md) ครบ 6 scenarios ในสไลด์หน้า 17 รวม token หมดอายุจริง การทดสอบอัตโนมัติใช้ `npm.cmd run test:jwt:postman` ใน backend ผลรอบล่าสุด 10 requests / 17 assertions ผ่านทั้งหมด ก่อนส่งข้อ token หมดอายุใน Postman Desktop ต้องเตรียม expiredToken ตามคู่มือ

1. เปิด backend และสร้างบัญชีสาธิตด้วย demo:seed
2. Import `ProbioticShop.postman_collection.json` ใน Postman Desktop
3. ตั้ง collection variable baseUrl = http://localhost:3000/api และ adminUsername/adminPassword เป็นบัญชีที่ใช้ทดสอบ (ค่าเริ่มต้นเป็นบัญชีสาธิต)
4. เปิด Collection Runner แล้ว Run ทั้ง 16 requests ตามลำดับ ค่า customerToken/adminToken/productId/categoryId/brandId ถูกเก็บให้อัตโนมัติ
5. ผลที่ถูกต้องคือ 22 assertions ผ่านทั้งหมด เก็บภาพหน้าจอ Runner และตัวอย่าง request/response แสดง JWT ที่ตัดบางส่วนก่อนนำเสนอ

## สิ่งที่ยืนยัน

- GET สินค้าโดยไม่มี JWT/ใช้ token ผิด: 401
- รหัสผ่านอ่อน: 400
- Register ส่ง role admin แต่ Login ได้ role customer: ป้องกันยกระดับสิทธิ์
- Login ได้ token รูปแบบ JWT และเรียก API ที่ตรวจ token สำเร็จ
- Customer เพิ่มสินค้าหรือดู dashboard Admin: 403
- Admin เพิ่ม แก้ไข ค้นหา ซ่อนสินค้าและดู dashboard: สำเร็จ
- สินค้าที่ซ่อนหายไปจากรายการสำหรับลูกค้า

Collection สร้างบัญชีลูกค้าทดสอบและสินค้า 1 รายการที่ถูกซ่อนเมื่อจบ จึงควรใช้ฐานข้อมูลสาธิต หากต้องการรันโดยไม่กระทบฐานข้อมูลใช้งาน ให้ใช้ `npm run test:postman` ซึ่งสร้างและลบ DB ทดสอบเฉพาะรอบนั้น

## หลักฐานที่รันไว้

`POSTMAN_RESULTS.json` เป็นผลจาก **Newman (Postman Runtime)**: 16 requests, 22 assertions, 0 failures ไม่ได้อ้างว่าเป็นภาพหน้าจอจากโปรแกรม Postman Desktop ผู้จัดทำสามารถ import collection แล้วเปิด Runner เพื่อแสดงต่ออาจารย์ได้

## ทดสอบ reset ผ่าน Postman แบบใช้กล่องอีเมลจริง

1. สมัครสมาชิกด้วยอีเมลที่รับได้จริง
2. POST /api/auth/forgot-password ด้วย body `{"email":"อีเมลที่ลงทะเบียน"}`
3. รับลิงก์ทางอีเมลแล้วคัดลอก token จาก URL (public API ไม่คืน token)
4. POST /api/auth/reset-password ด้วย body `{"email":"อีเมลที่ลงทะเบียน","token":"token จากอีเมล","newPassword":"NewPassword123!"}`
5. Token เดิมใช้ซ้ำต้องได้ 400, login ด้วยรหัสเดิมต้องได้ 401, login ด้วยรหัสใหม่ต้องได้ 200 และ JWT เก่าเข้าถึง API ไม่ได้

คำขอ reset พร้อมกัน วันหมดอายุและ session revocation มี integration tests เพิ่มเติม ไม่ต้องตั้งค่าเปิดเผย resetTokenForTesting


## ชุดทดสอบลืมรหัสผ่านที่เพิ่มหลังแก้ไข

Import `PasswordReset.postman_collection.json` แล้วตั้ง baseUrl, resetEmail, newPassword ใน Variables โดยเก็บรหัสผ่านเป็นค่าภายในเครื่อง ไม่ export เผยแพร่

1. กด Send เฉพาะ **1 Request reset link by email**
2. เปิดอีเมลที่ได้รับ คัดลอก token จากลิงก์มาใส่ resetToken (หรือเปิดลิงก์แล้วตั้งรหัสผ่านผ่านเว็บโดยตรง)
3. กด **2 Reset using token FROM EMAIL** จากนั้น **3 Login with new password** และ **4 Used token must be refused**
4. อย่ารันข้อ 1 ซ้ำก่อนใช้ token ที่คัดลอก เพราะคำขอใหม่จะยกเลิก token เดิม

ทดสอบอัตโนมัติที่ไม่เปลี่ยนบัญชีจริง: `npm.cmd run test:reset:postman` ใน backend ผลอยู่ `PASSWORD_RESET_RESULTS.json`: 11 requests / 13 assertions ผ่านครบ โดยใช้ Nodemailer ส่งผ่าน SMTP จริงเข้า receiver ภายในเครื่อง แล้วนำ token จากอีเมลนั้นมาทดสอบ reset, token ใช้ซ้ำ, รหัสเดิม และ JWT เดิม ไม่ mock ฟังก์ชันส่งอีเมล

แก้การรอ SMTP ให้มีขอบเขตเวลารวม 25 วินาที และหน้า forgot รอได้ 35 วินาทีแทน 20 วินาที เซิร์ฟเวอร์ต้องอนุญาต network ไปยังผู้ให้บริการ SMTP หากทำงานใน sandbox ที่บล็อก network ต้องเปิด backend ด้วยสิทธิ์ network ที่เหมาะสม ห้ามเปิดเซิร์ฟเวอร์ซ้ำพอร์ต 3000

## API หลังอัปเดต 20 ตุลาคม 2569

PUT สินค้าต้องส่ง expected_version จาก version ที่อ่านล่าสุด หาก 409 ให้โหลดใหม่ก่อนแก้ ห้าม retry ค่า stock เดิมทับข้อมูลล่าสุด ส่วน POST orders ต้องมี expected_total และ items[].expected_unit_price ตามยอดที่ผู้ซื้อยืนยัน Backend ยังคำนวณราคาจริงจาก DB เสมอ
