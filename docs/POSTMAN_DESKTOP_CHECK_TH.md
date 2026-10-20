# ผลตรวจผ่าน Postman Desktop

ตรวจวันที่ 20 ตุลาคม 2569

นำเข้า Collection ชื่อ Probiotic Shop — JWT ตามบทเรียนอาจารย์ ใน Default workspace ของ Postman Desktop แล้ว ตั้ง baseUrl เป็น http://localhost:3000/api ใช้บัญชีสาธิต member-demo และ admin-demo

ผล Collection Runner รอบสำเร็จ: 10 requests, 17 assertions ผ่าน, 0 failed, 0 skipped, 0 errors ยืนยันจากหน้าผลของ Postman Desktop ไม่ใช่เพียง Newman

ครอบคลุม Login สำเร็จ/รหัสผ่านผิด, ไม่มี JWT, JWT มั่ว, JWT ถูกต้องดูสินค้าและโปรไฟล์, Customer ถูกปฏิเสธ DELETE, Admin ดู Dashboard และ JWT หมดอายุ

expiredToken ในเครื่องนี้ตั้งเป็น fixture ที่ลงลายเซ็นด้วย secret ของ backend ปัจจุบัน แต่หมดอายุแล้วและใช้ id=0 ซึ่งไม่มีสิทธิ์ผู้ใช้ ใช้สำหรับทดสอบเท่านั้น ไม่ได้ส่ง JWT_SECRET เข้า Postman ค่าทดสอบตั้งผ่านสคริปต์ชั่วคราวใน Postman แล้วคืนสคริปต์ request เป็นแบบเดิม หลังจากนั้น Runner ใช้ค่าเฉพาะเครื่องและรันผ่านทั้งชุด หากเปลี่ยน JWT_SECRET ต้องเตรียม fixture ใหม่ หรือใช้ token ที่ backend ออกจริงแล้วรอหมดอายุตามคู่มือ JWT_LESSON_REVIEW_TH.md

การรันครั้งนี้ไม่มีการส่งอีเมลหรือเปลี่ยนข้อมูลสินค้า DELETE ใช้รหัส 0 และ Customer จึงถูกปฏิเสธด้วย 403 ก่อน controller ส่วน Collection PRESENTATION เดิมยังอยู่

รันซ้ำ: เปิด Collection ใหม่นี้ กด Run เลือกครบ 10 requests แล้ว Start run โดยเปิด backend พอร์ต 3000 ไว้ ค่า memberToken/adminToken ถูกสร้างใหม่จาก Login ในแต่ละรอบ
