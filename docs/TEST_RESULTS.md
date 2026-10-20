# ผลการทดสอบล่าสุด

20 ตุลาคม 2569 หลังแก้ครบ — รายละเอียดดู FINAL_FIXES_TH.md

| การตรวจ | ผล |
| --- | --- |
| Clean install + Backend integration | ผ่าน 9 tests ใช้ SQL ของโปรเจกต์ตามปกติ ไม่ใช้ preload |
| Frontend production build | ผ่าน 112 modules |
| CSV unit tests | ผ่าน 2 tests |
| Edge browser workflow | ผ่าน รวมรูปสินค้า/ราคาเปลี่ยน/สต็อกเก่า/จัดส่ง/reset/export/ธีม/ตัวอักษรใหญ่/มือถือ |
| JavaScript page errors | 0 |
| Newman JWT/Admin | 16 requests / 22 assertions / 0 failures |
| Newman reset ผ่าน SMTP loopback | 11 requests / 13 assertions / 0 failures |
| SMTP provider verify | ผ่าน ไม่ส่งอีเมล |
| รายงาน PDF/ใบเสร็จภาษาไทย | render และตรวจภาพ |

ทดสอบ DB แยกและลบเฉพาะ DB รอบทดสอบ ไม่เปลี่ยนบัญชีหรือออร์เดอร์ร้านเดิม ครอบคลุมสิทธิ์ JWT, CRUD, version ป้องกัน lost update, ราคาที่ยืนยัน, idempotency payload, การแย่งชิ้นสุดท้าย, ยกเลิก/หมดอายุคืนสต็อกครั้งเดียว, payment review, เอกสารส่วนตัว, รูปสินค้าและไฟล์ปลอม, pagination, เลขพัสดุ/completed และ token/session revocation

SMTP reset ใช้การสนทนา SMTP จริงกับ receiver ที่รับเฉพาะ loopback ไม่ส่งให้บุคคลจริง ยังไม่ได้ยืนยันการรับจดหมายใน inbox ภายนอก ทดสอบ Edge หลายขนาดรวม 320/390/768px ไม่ใช่การรับรองทุกอุปกรณ์หรือ usability กับผู้สูงอายุจริง ไฟล์ failure-0.png เก่าไม่ใช่ผลรอบล่าสุด ให้ดู result.json
