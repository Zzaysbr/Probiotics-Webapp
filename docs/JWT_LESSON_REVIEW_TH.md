# ตรวจ JWT และ Postman เทียบกับบทเรียนอาจารย์

ตรวจวันที่ 20 ตุลาคม 2569 จาก JWT_Authentication.pptx ทั้ง 17 สไลด์ ภาพ Postman ที่แนบ และซอร์สใน Desktop/probiotic-shop เอกสารประกอบเป็นเกณฑ์สำหรับเปรียบเทียบ ไม่ใช่คำสั่งให้รันโค้ดในสไลด์

## ข้อสรุป

เว็บใช้หลักการตามบทเรียน: ตรวจ username/password ด้วย bcrypt, ออก JWT ด้วย jwt.sign, ส่ง Authorization: Bearer, ตรวจ jwt.verify และจำกัดสิทธิ์ Customer/Admin ที่ backend ทั้งนี้ชื่อ endpoint และรายละเอียดบางส่วนต่างจากตัวอย่าง

| บทเรียน | เว็บนี้ | ผลตรวจ |
| --- | --- | --- |
| POST /auth รับ username/password แล้วคืน token | POST /api/auth/login | มี |
| GET /profile ต้องมี token และแสดงข้อมูลตนเอง | GET /api/me (หน้าเว็บ /profile) | มี |
| GET /products สำหรับสมาชิก | GET /api/products | มี |
| POST/PUT/DELETE /products เฉพาะ Admin | /api/products และ /api/products/:id | มี |
| รหัสผ่านผ่าน bcrypt ก่อนเก็บ | ใช้ bcryptjs.hash และ bcryptjs.compare | หลักการเดียวกัน ใช้คนละแพ็กเกจ |
| JWT_SECRET อยู่ฝั่ง server | อ่าน environment และกำหนด HS256 | มี ไม่ต้องใส่ secret ใน Postman |
| ตัวอย่าง token อายุ 1h | JWT_EXPIRES_IN ค่าเริ่มต้น 1d | ตั้งค่าได้ ไม่ใช่ข้อผิดพลาด |
| middleware ตรวจลายเซ็นแล้วอ่าน role จาก payload | ตรวจลายเซ็นและอายุ แล้วโหลด user/role/token_version จาก DB | มีการตรวจเพิ่มเพื่อใช้ role ปัจจุบันและเพิกถอน JWT หลัง reset |

เว็บนี้มี JWT แต่ยังอ่าน DB เพื่อตรวจผู้ใช้ทุก protected request จึงไม่ควรพูดว่า “ใช้ JWT แล้วไม่แตะฐานข้อมูลอีกเลย” หรือ “stateless ทั้งหมด” การ decode token ใน Vue ใช้ช่วยเปลี่ยนหน้า ส่วนการยืนยันลายเซ็นและสิทธิ์จริงอยู่ที่ backend

DELETE สินค้าของร้านเป็น soft delete: เปลี่ยน is_active เพื่อซ่อนสินค้าและคงประวัติออร์เดอร์ ไม่ได้ลบแถวถาวร

## สิ่งที่ขาดใน Collection เดิม

ProbioticShop.postman_collection.json เดิมทดสอบ 16 requests / 22 assertions ผ่าน แต่ยังไม่มี request สำหรับ login รหัสผ่านผิด, token หมดอายุ, protected profile และ Customer ใช้ DELETE โดยตรง ส่วน Presentation.postman_collection.json มี profile แล้ว แต่ยังไม่ครบ 6 scenarios ในสไลด์หน้า 17

จึงเพิ่ม JWT_Lesson.postman_collection.json เป็นชุดแยก 10 requests ครบทั้ง 6 scenarios และตัวอย่าง protected profile/Admin โดยไม่แก้พฤติกรรม API

| กรณีในสไลด์หน้า 17 | ข้อใน Collection ใหม่ | คาดหวัง |
| --- | --- | --- |
| 1 Login สำเร็จ | 01 | 200 และ JWT |
| 2 Login รหัสผ่านผิด | 02 | 401 |
| 3 ไม่ส่ง token | 03 | 401 |
| 4 ส่ง token มั่ว | 04 | 401 |
| 5 ส่ง token หมดอายุ | 10 | 401 |
| 6 Customer พยายามลบสินค้า | 07 | 403 |

ข้อ 05 ดูสินค้าด้วย JWT ได้ 200, ข้อ 06 ดูโปรไฟล์ตนเองได้ 200, ข้อ 08–09 แสดง Admin login และเข้าถึง Dashboard

ข้อ 07 ใช้ /products/0 เพื่อทดสอบด่านสิทธิ์ก่อน controller โดยไม่แตะสินค้าจริง หากส่ง Customer token ต้องได้ 403 แม้รหัสสินค้าจะไม่ถูกต้อง ถ้าตั้งบัญชีผิดเป็น Admin จะถึง controller แล้วได้ 400 แทน จึงไม่ใช่การสาธิตลบสินค้าจริง การสาธิต Admin CRUD ใช้ Collection เดิมบนข้อมูลสาธิต

## นำเข้า Postman

1. เปิด backend ที่พอร์ต 3000
2. Import docs/JWT_Lesson.postman_collection.json
3. ตั้ง Variables: baseUrl = http://localhost:3000/api, memberUsername/memberPassword และ adminUsername/adminPassword ให้ตรงกับบัญชีที่มีจริง ค่าเริ่มต้นเป็นบัญชีสาธิตจาก demo:seed
4. ส่งข้อ 01–09 ตามลำดับ สคริปต์จะเก็บ memberToken/adminToken อัตโนมัติ แท็บ Authorization ใช้ Bearer Token = {{memberToken}} หรือ {{adminToken}}
5. เตรียม expiredToken ก่อนข้อ 10 ตามหัวข้อถัดไป หากปล่อยว่างสคริปต์จะเตือนและไม่ถือว่าทดสอบผ่าน

รหัสผ่านสาธิตในไฟล์คือ DemoShop123! ถ้าเคยเปลี่ยนรหัสผ่านบัญชีเหล่านี้ ต้องใส่ค่าปัจจุบัน ห้ามนำ JWT_SECRET ไปใส่ใน Postman และล้าง token/รหัสผ่านส่วนตัวก่อน export แชร์

## เตรียม JWT หมดอายุจริงสำหรับสาธิตด้วยมือ

token ที่ถูกแก้ exp เองจะทำให้ลายเซ็นผิด จึงไม่พิสูจน์กรณีหมดอายุ ให้ใช้ token ที่ server ออกให้แล้วรอจนหมดอายุ

ทางเลือกที่ไม่ต้องรอนาน ใช้เฉพาะเครื่อง/ฐานข้อมูลสาธิต:

1. หยุด backend เดิมด้วย Ctrl+C ใน terminal ที่เปิด server อย่าเปิดซ้ำบนพอร์ต 3000
2. เปิด PowerShell ที่ backend ตั้งอายุชั่วคราวเฉพาะ process แล้วเริ่ม server:

```powershell
$env:JWT_EXPIRES_IN = "10s"
npm.cmd start
```

3. ส่ง Login ข้อ 01 แล้วคัดลอก token จาก response ไปใส่ expiredToken ทันที จากนั้นรออย่างน้อย 12 วินาทีแล้วส่งข้อ 10 จะได้ 401
4. หากต้องการสาธิต request ที่ต้องสำเร็จหลังจากนั้น ให้ Login ใหม่ก่อน เพราะ token ใหม่ในโหมดนี้มีอายุเพียง 10 วินาที
5. หลังสาธิต หยุด server ลบตัวแปรชั่วคราวแล้วเริ่มใหม่ เพื่อกลับไปใช้ค่าใน .env หรือค่าเริ่มต้น:

```powershell
Remove-Item Env:JWT_EXPIRES_IN
npm.cmd start
```

การเปลี่ยนค่าอายุมีผลเฉพาะ token ที่ออกใหม่ ไม่ทำให้ token อายุ 1 วันซึ่งออกก่อนหน้าเปลี่ยนอายุตาม

## คำพูดประกอบการนำเสนอ

“Postman เป็นเครื่องมือส่งคำขอไปทดสอบ API โดยตรงค่ะ/ครับ ทำให้ตรวจได้ว่า backend ทำงานถูกต้องแม้ไม่ผ่านหน้าจอเว็บ ด้านบนเราเลือก Method และ URL ส่วน Body เป็นข้อมูล JSON ที่ส่งเข้า server และด้านล่างเป็นสถานะ HTTP กับข้อมูลตอบกลับ”

“เริ่มจาก POST /api/auth/login ส่ง username กับ password เมื่อข้อมูลถูกต้อง server จะตรวจรหัสผ่านกับ hash ในฐานข้อมูล แล้วออก JWT กลับมา จากนั้นใช้ token นี้ใน Authorization แบบ Bearer Token เพื่อเรียก API ที่ป้องกันไว้ เช่น GET /api/me และ GET /api/products”

“JWT มี Header, Payload และ Signature ค่าข้างใน payload อ่านได้ จึงไม่ใส่รหัสผ่านไว้ใน token ระบบใช้ลายเซ็นและวันหมดอายุตรวจว่า token ใช้งานได้หรือไม่”

“ถ้าไม่มี token, token ผิด หรือหมดอายุ ระบบตอบ 401 แต่ถ้าเข้าสู่ระบบเป็น Customer แล้วพยายามลบสินค้า ระบบตอบ 403 เพราะยืนยันตัวตนได้แล้วแต่ไม่มีสิทธิ์ การซ่อนปุ่มในหน้าเว็บจึงมี backend ตรวจสิทธิ์รองรับด้วย”

“เว็บของหนู/ผมตรวจ role ปัจจุบันและ token_version จากฐานข้อมูลเพิ่มด้วย เมื่อเปลี่ยนรหัสผ่าน JWT เก่าจึงใช้งานต่อไม่ได้ ส่วนหน้าเว็บส่ง Bearer Token ผ่าน Axios ไปยัง API ชุดเดียวกับที่เราทดสอบใน Postman”

## อธิบายภาพ forgot-password ที่แนบ

- Method: POST
- URL: http://localhost:3000/api/auth/forgot-password
- Body → raw → JSON: ส่ง email ของบัญชีที่ต้องการขอลิงก์
- 200 OK: API รับและประมวลผลคำขอแล้ว แต่ภาพนี้เพียงอย่างเดียวไม่ยืนยันว่ามีอีเมลถึงกล่องจดหมาย
- โค้ดจงใจตอบข้อความกลางเหมือนกันทั้งกรณีพบและไม่พบอีเมล และยังตอบข้อความกลางหากส่ง SMTP ล้มเหลว เพื่อลดการเปิดเผยว่าบัญชีใดมีอยู่ ต้องเปิดอีเมลและทดสอบลิงก์ต่อจึงยืนยันขั้นตอนครบ
- endpoint นี้ไม่ต้องใช้ JWT เพราะผู้ใช้ที่ลืมรหัสผ่านอาจยังเข้าสู่ระบบไม่ได้
- reset token ใช้ crypto.randomBytes(32) ไม่ใช่ JWT สำหรับ login มีอายุ 15 นาที ใช้ครั้งเดียว และเก็บเฉพาะ SHA-256 hash ของ token ใน DB

ตัวอย่างคำพูด: “คำขอนี้เป็นการขอลิงก์ตั้งรหัสผ่านใหม่ค่ะ/ครับ โดยส่งอีเมลใน JSON ระบบตอบข้อความกลางเพื่อไม่เปิดเผยว่ามีบัญชีนี้หรือไม่ จากนั้นต้องเปิดอีเมลจริงและใช้ลิงก์ภายใน 15 นาที ภาพนี้แสดงว่า API ตอบคำขอแล้ว แต่ต้องทดสอบอีเมลต่อเพื่อยืนยันว่าส่งถึงค่ะ/ครับ”

## ตำแหน่งโค้ดสำหรับเปิดให้อาจารย์ดู

- backend/controllers/authController.js: bcrypt, jwt.sign, forgot/reset
- backend/middlewares/authMiddleware.js: jwt.verify, token_version, isAdmin
- backend/routes/productRoutes.js: จำกัด GET/POST/PUT/DELETE ตามสิทธิ์
- backend/routes/shopRoutes.js: GET /me และ Admin API
- frontend/src/services/api.js: Axios แนบ Bearer Token และจัดการ 401
- frontend/src/services/auth.js: เก็บ/ล้าง session ใน localStorage
- frontend/src/router/index.js: เปลี่ยนหน้าเมื่อยังไม่ login หรือ token หมดอายุ

## ทดสอบอัตโนมัติโดยไม่ใช้ข้อมูลร้านจริง

ที่ backend รัน npm.cmd run test:jwt:postman ชุดทดสอบสร้าง DB ชั่วคราว secret ชั่วคราว และ JWT ที่ลงลายเซ็นถูกต้องแต่หมดอายุเพื่อทดสอบผ่าน Postman Runtime ไม่มีการส่งอีเมล ไม่มี secret ใน Collection และลบเฉพาะ DB ของรอบทดสอบเมื่อเสร็จ

ผลรอบตรวจนี้: ชุดใหม่ 10 requests / 17 assertions ผ่านทั้งหมด; ชุดเดิม 16 requests / 22 assertions ผ่านทั้งหมด; integration tests 8 tests ผ่าน และ browser workflow ผ่าน ผลชุดใหม่ดู JWT_LESSON_RESULTS.json ผลชุดเดิมดู POSTMAN_RESULTS.json การรัน Collection นี้เป็น Newman (Postman Runtime) ไม่ใช่ภาพหลักฐานจาก Postman Desktop ให้ import แล้ว Send เพื่อแสดงหน้าจอต่ออาจารย์

Logout ปัจจุบันล้าง session/token ใน browser ส่วน JWT ที่ถูกคัดลอกไว้อาจยังใช้ได้จนหมดอายุ การ reset รหัสผ่านต่างออกไป เพราะเพิ่ม token_version ใน DB เพื่อให้ JWT เก่าถูกปฏิเสธด้วย
