# Probiotic Shop

เว็บขายผลิตภัณฑ์โปรไบโอติกสำหรับโครงงาน Database Web Application ตามโจทย์ส่วนที่ 1–2 ใช้ Vue.js, Node.js/Express และ MySQL/MariaDB

## เปิดโปรเจกต์นี้

โค้ดที่แก้ไขอยู่ใน **Desktop/probiotic-shop** สำเนาใน Downloads ไม่ได้ถูกแก้ตามอัตโนมัติ

ติดตั้ง Node.js ตามเงื่อนไข frontend/package.json และ MySQL 8 หรือ MariaDB 10.4+ (เครื่องนี้ใช้ MariaDB) เปิดบริการฐานข้อมูลก่อน จากนั้นเปิด terminal ที่โฟลเดอร์นี้:

```powershell
cd backend
npm.cmd ci
# เครื่องใหม่: คัดลอก .env.example เป็น .env และกรอกค่าจริง
# ถ้ามี .env อยู่แล้ว ให้ใช้ไฟล์เดิม ไม่ต้องเขียนทับ
npm.cmd run db:setup
npm.cmd run demo:seed
npm.cmd start
```

เปิด terminal อีกหน้าต่าง:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

เปิด http://localhost:5173 (API http://localhost:3000) เครื่องปัจจุบันติดตั้ง dependencies, อัปเดตโครงสร้าง DB และเพิ่มบัญชีสาธิตให้แล้ว การเปิดครั้งถัดไปใช้เพียง `npm.cmd start` ใน backend และ `npm.cmd run dev` ใน frontend

| บัญชีสาธิต | ชื่อผู้ใช้ | รหัสผ่านเริ่มต้น |
| --- | --- | --- |
| Admin | admin-demo | DemoShop123! |
| Customer | member-demo | DemoShop123! |

ข้อมูลสาธิตเท่านั้น บัญชี Admin เดิมและสินค้าเดิมยังอยู่ สคริปต์ demo:seed ไม่ลบหรือเปลี่ยนรหัสผ่านบัญชีที่มีอยู่แล้ว หากเคยเปลี่ยนรหัสผ่าน demo ให้ใช้รหัสผ่านล่าสุด

## การใช้งาน

หน้าต่าง ๆ ใช้ธีมม่วง–ชมพูและรองรับมือถือ คลิก username บนแถบเมนูเพื่อเปิด `/profile` ดูข้อมูลบัญชีของตนเองและเข้าสู่ขั้นตอนรีเซ็ตรหัสผ่านได้

1. ผู้เยี่ยมชมดู Home/Contact และสมัครสมาชิกได้ หน้า Products/Cart/Orders ต้องเข้าสู่ระบบ
2. ลูกค้าค้นหาชื่อ SKU หมวดหมู่ หรือแบรนด์ เลือกสินค้า กำหนดจำนวนในตะกร้า ระบุชื่อ/โทรศัพท์/ที่อยู่ และยืนยันคำสั่งซื้อ
3. ระบบคำนวณราคาจาก DB และจองสต็อก แสดง order ก่อนชำระ กรอกเวลาและแนบ JPG/PNG/PDF ไม่เกิน 5 MB ยอดแจ้งต้องตรงออร์เดอร์
4. หลังส่งข้อมูลสำเร็จดาวน์โหลดใบรับแจ้งชำระ PDF ได้ สถานะยังรอตรวจสอบ
5. Admin เปิด “ตรวจชำระ” ดาวน์โหลดหลักฐาน ตรวจแล้วอนุมัติหรือส่งกลับพร้อมเหตุผล ลูกค้าจะแจ้งใหม่ได้เมื่อถูกปฏิเสธ
6. เมื่ออนุมัติ ลูกค้าอัปเดตสถานะและดาวน์โหลดใบเสร็จภาษาไทย PDF ได้ Dashboard นับยอดเฉพาะที่อนุมัติแล้ว
7. ยกเลิกรายการที่รอชำระได้เพื่อคืนสต็อก ไม่อนุญาตยกเลิกหลังส่งหลักฐาน/ชำระแล้ว
8. Admin เพิ่ม/แก้ไข/ค้นหา/ซ่อนสินค้าและเปิดขายกลับได้ เลือก category_id/brand_id จริง เพิ่มหมวดหมู่หรือแบรนด์ได้จากส่วนด้านล่าง

บัญชีธนาคาร `DEMO-PROBIOTIC-0001` เป็นข้อมูลสมมติที่ตั้งใจให้โอนไม่ได้ ไม่มีการเรียกเก็บเงินจริง ชื่อบัญชี Probiotic Shop ที่อยู่และเบอร์โทรเป็นข้อมูลอ้างอิงกองประชาสัมพันธ์ มทร.ธัญบุรีตามคำขอ ไม่ใช่ช่องทางขายสินค้าของมหาวิทยาลัย

## ค่า environment

Backend อ่าน `backend/.env` โดยไม่เผยแพร่ค่า secret:

- DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME: การเชื่อมต่อ DB
- JWT_SECRET: ค่าสุ่มอย่างน้อย 32 ตัวอักษร; JWT_EXPIRES_IN ค่าเริ่มต้น 1d
- CLIENT_URL: origin ของ frontend สำหรับ CORS และลิงก์ reset (ค่าเริ่มต้น http://localhost:5173)
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS: ผู้ให้บริการอีเมล (587 STARTTLS หรือ 465 TLS)
- RECEIPT_FONT_PATH: ไฟล์ TTF ภาษาไทย Windows ใช้ C:/Windows/Fonts/tahoma.ttf อัตโนมัติ เครื่องอื่นต้องระบุ TTF ที่รองรับภาษาไทย
- SHOP_NAME, SHOP_ADDRESS, SHOP_PHONE, SHOP_EMAIL, BANK_NAME, BANK_ACCOUNT, BANK_OWNER: ปรับข้อมูลร้านได้ ปล่อยว่างใช้ข้อมูลสาธิต
- DEMO_MODE=true: แสดงข้อความระบบสาธิต

Frontend อ่าน `frontend/.env` ตัวแปร `VITE_API_BASE_URL` ค่าเริ่มต้น http://localhost:3000/api ทุกหน้าใช้ API service เดียวกัน เมื่อเปลี่ยนค่าต้อง restart Vite หรือ build ใหม่

ไฟล์หลักฐานเก็บใน `backend/storage/slips` ไม่เปิดเป็น static public และไม่ commit ใน Git ต้องสำรองโฟลเดอร์นี้ควบคู่ฐานข้อมูล

## ลืมรหัสผ่านและ SMTP

ใช้หน้า `/forgot-password` กรอกอีเมลที่ลงทะเบียนและรับจดหมายได้จริง ลิงก์มีอายุ 15 นาที ใช้ครั้งเดียว เปลี่ยนแล้ว JWT เดิมถูกยกเลิก บัญชีสาธิตใช้โดเมน example.invalid จึงไม่ใช่กล่องจดหมายจริง ให้สมัครด้วยอีเมลของตนเมื่อต้องการทดสอบรับอีเมล

```powershell
cd backend
npm.cmd run smtp:check
```

คำสั่งนี้ตรวจการเชื่อมต่อ/ยืนยันตัวตน SMTP โดยไม่ส่งอีเมล หากไม่ผ่านให้ตั้งค่าผู้ให้บริการจริง (เช่น app password ตามที่ผู้ให้บริการกำหนด) Public API ตอบข้อความเดียวกันไม่ว่าจะพบอีเมลหรือไม่และไม่คืน reset token เพื่อป้องกันการเดาบัญชี ตรวจข้อผิดพลาดส่งเมลได้จาก backend console

## ฐานข้อมูล

ใช้โครงสร้างเดิมจากไฟล์ SQL ที่ได้รับ เพิ่มเฉพาะ token_version และ request_key/unique index การรัน db:setup ซ้ำไม่ลบข้อมูล

สำหรับฐานข้อมูลใหม่เลือกได้สองวิธี:

- แนะนำ: ตั้ง `.env` แล้ว `npm.cmd run db:setup` และ `npm.cmd run demo:seed`
- phpMyAdmin: สร้าง/เลือกฐานข้อมูลใหม่แล้ว import `backend/database/probiotic_shop_complete.sql` จากนั้น `npm.cmd run demo:seed` เพื่อเพิ่มบัญชีสาธิต ไฟล์ SQL ไม่รวมบัญชีส่วนตัว รหัสผ่าน หรือ reset tokens ของผู้ใช้เดิม

## ทดสอบ

```powershell
cd backend
npm.cmd test
npm.cmd run test:browser
npm.cmd exec --yes --package=newman --cache .npm-cache -- newman --version
npm.cmd run test:postman
cd ../frontend
npm.cmd run build
```

ชุดทดสอบสร้าง DB แยก `probiotic_shop_test_*`, `probiotic_shop_browser_*`, `probiotic_shop_postman_*` แล้วลบเฉพาะ DB ของรอบทดสอบเมื่อจบ บัญชี DB ที่ใช้ทดสอบต้องสร้าง/ลบ database ได้ ห้ามกำหนด DB ทดสอบเองให้ชี้ข้อมูลจริง ชุดทดสอบอีเมลใช้ mock ไม่ส่งหาบุคคลจริง

Browser test ใช้ Microsoft Edge ที่ติดตั้งใน Windows ผ่าน Playwright และเปิด Vite ที่ port 5174 (ต้องว่าง) หลักฐานหน้าจอ/ตัวอย่าง PDF อยู่ `output/` ไม่รวมใน Git ส่วน Postman collection สามารถ import ใช้ใน Postman Desktop ได้โดยตรง ดูคู่มือด้านล่าง

## เอกสารส่งงาน

- [รายงาน PDF พร้อม ER Diagram และ Data Dictionary](docs/PROJECT_REPORT.pdf)
- [รายงานฉบับแก้ไขได้](docs/PROJECT_REPORT.md)
- [Data Dictionary ครบทุกคอลัมน์](docs/DATA_DICTIONARY.md)
- [คู่มือ Postman และการทดสอบ JWT](docs/POSTMAN_GUIDE.md)
- [Postman collection](docs/ProbioticShop.postman_collection.json)
- [ผล Postman Runtime](docs/POSTMAN_RESULTS.json)
- [ผลการทดสอบและข้อจำกัด](docs/TEST_RESULTS.md)

รายงานก่อนแก้ใน CODE_REVIEW_TH.md เก็บไว้เป็นประวัติ ไม่ใช่สถานะปัจจุบันของแอป
