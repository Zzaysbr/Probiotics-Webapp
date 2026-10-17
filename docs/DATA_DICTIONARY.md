# Data Dictionary

อ้างอิงโครงสร้างฐานข้อมูลหลัง migration; เวลา DATETIME ใช้ UTC+7 ราคาทั้งหมดเก็บเป็น DECIMAL เพื่อหลีกเลี่ยงความคลาดเคลื่อนของ floating point

## users

| Field | Type | Null | Key | Default | ความหมาย |
| --- | --- | --- | --- | --- | --- |
| user_id | int(11) | NO | PRI | NULL | รหัสสมาชิก |
| username | varchar(50) | NO | UNI | NULL | ชื่อผู้ใช้ |
| email | varchar(254) | NO | UNI | NULL | อีเมล |
| password_hash | varchar(255) | NO | - | NULL | รหัสผ่านที่เข้ารหัส bcrypt |
| full_name | varchar(150) | NO | - | NULL | ชื่อและนามสกุล |
| phone | varchar(20) | YES | - | NULL | โทรศัพท์ |
| role | enum('admin','customer') | NO | - | customer | สิทธิ์ admin/customer |
| created_at | datetime | NO | - | current_timestamp() | เวลาสร้าง (เวลาไทย) |
| token_version | int(11) | NO | - | 0 | เวอร์ชันยกเลิก JWT หลังเปลี่ยนรหัสผ่าน |

## categories

| Field | Type | Null | Key | Default | ความหมาย |
| --- | --- | --- | --- | --- | --- |
| category_id | int(11) | NO | PRI | NULL | รหัสหมวดหมู่ |
| category_name | varchar(100) | NO | UNI | NULL | ชื่อหมวดหมู่ |

## brands

| Field | Type | Null | Key | Default | ความหมาย |
| --- | --- | --- | --- | --- | --- |
| brand_id | int(11) | NO | PRI | NULL | รหัสแบรนด์ |
| brand_name | varchar(100) | NO | UNI | NULL | ชื่อแบรนด์ |

## products

| Field | Type | Null | Key | Default | ความหมาย |
| --- | --- | --- | --- | --- | --- |
| product_id | int(11) | NO | PRI | NULL | รหัสสินค้า |
| category_id | int(11) | NO | MUL | NULL | รหัสหมวดหมู่ |
| brand_id | int(11) | NO | MUL | NULL | รหัสแบรนด์ |
| sku | varchar(50) | NO | UNI | NULL | รหัสสินค้า SKU |
| product_name | varchar(200) | NO | - | NULL | ชื่อสินค้า |
| description | text | YES | - | NULL | รายละเอียดสินค้า |
| price | decimal(10,2) | NO | - | 0.00 | ราคาต่อหน่วย (บาท) |
| stock_qty | int(11) | NO | - | 0 | สต็อกพร้อมขายหลังหักยอดจอง |
| image_path | varchar(255) | YES | - | NULL | URL รูปภาพ |
| is_active | tinyint(1) | NO | - | 1 | 1 เปิดขาย / 0 ซ่อน |

FK: `brand_id` → `brands.brand_id`.

FK: `category_id` → `categories.category_id`.

## orders

| Field | Type | Null | Key | Default | ความหมาย |
| --- | --- | --- | --- | --- | --- |
| order_id | int(11) | NO | PRI | NULL | รหัสคำสั่งซื้อ |
| user_id | int(11) | NO | MUL | NULL | รหัสสมาชิก |
| order_no | varchar(30) | NO | UNI | NULL | เลขที่คำสั่งซื้อไม่ซ้ำ |
| recipient_name | varchar(150) | NO | - | NULL | ชื่อผู้รับสินค้า |
| recipient_phone | varchar(20) | NO | - | NULL | โทรศัพท์ผู้รับ |
| shipping_address | text | NO | - | NULL | ที่อยู่จัดส่ง |
| subtotal | decimal(10,2) | NO | - | 0.00 | ยอดสินค้ารวม |
| shipping_fee | decimal(10,2) | NO | - | 0.00 | ค่าจัดส่ง |
| total_amount | decimal(10,2) | NO | - | 0.00 | ยอดชำระสุทธิ |
| order_status | varchar(30) | NO | - | awaiting_payment | awaiting_payment/pending_review/paid/cancelled |
| tracking_no | varchar(100) | YES | - | NULL | เลขพัสดุ (เผื่อขยายระบบ) |
| receipt_no | varchar(30) | YES | UNI | NULL | เลขที่ใบเสร็จหลังอนุมัติ |
| receipt_issued_at | datetime | YES | - | NULL | เวลาออกใบเสร็จ |
| created_at | datetime | NO | - | current_timestamp() | เวลาสร้าง (เวลาไทย) |
| request_key | varchar(64) | YES | - | NULL | รหัสป้องกันสั่งซ้ำต่อสมาชิก |

FK: `user_id` → `users.user_id`.

## order_items

| Field | Type | Null | Key | Default | ความหมาย |
| --- | --- | --- | --- | --- | --- |
| order_item_id | int(11) | NO | PRI | NULL | รหัสรายการย่อย |
| order_id | int(11) | NO | MUL | NULL | รหัสคำสั่งซื้อ |
| product_id | int(11) | NO | MUL | NULL | รหัสสินค้า |
| product_name_snapshot | varchar(200) | NO | - | NULL | ชื่อสินค้าขณะสั่งซื้อ |
| sku_snapshot | varchar(50) | NO | - | NULL | SKU ขณะสั่งซื้อ |
| quantity | int(11) | NO | - | 1 | จำนวนสินค้า |
| unit_price | decimal(10,2) | NO | - | 0.00 | ราคาต่อหน่วยขณะสั่งซื้อ |

FK: `order_id` → `orders.order_id`.

FK: `product_id` → `products.product_id`.

## payments

| Field | Type | Null | Key | Default | ความหมาย |
| --- | --- | --- | --- | --- | --- |
| payment_id | int(11) | NO | PRI | NULL | รหัสการชำระเงิน |
| order_id | int(11) | NO | MUL | NULL | รหัสคำสั่งซื้อ |
| amount | decimal(10,2) | NO | - | 0.00 | จำนวนเงินที่แจ้งโอน |
| payment_method | varchar(30) | NO | - | bank_transfer | วิธีชำระ (bank_transfer) |
| transferred_at | datetime | NO | - | NULL | วันเวลาโอนที่แจ้ง |
| slip_path | varchar(255) | NO | - | NULL | ชื่อไฟล์หลักฐานภายในพื้นที่เก็บไฟล์ |
| status | enum('pending','approved','rejected') | NO | - | pending | pending/approved/rejected |
| reviewed_by | int(11) | YES | MUL | NULL | รหัส Admin ผู้ตรวจ |
| reviewed_at | datetime | YES | - | NULL | วันเวลาตรวจยืนยัน |
| rejection_reason | text | YES | - | NULL | เหตุผลเมื่อไม่อนุมัติ |
| created_at | datetime | NO | - | current_timestamp() | เวลาสร้าง (เวลาไทย) |

FK: `order_id` → `orders.order_id`.

FK: `reviewed_by` → `users.user_id`.

## password_reset_tokens

| Field | Type | Null | Key | Default | ความหมาย |
| --- | --- | --- | --- | --- | --- |
| reset_id | int(11) | NO | PRI | NULL | รหัสคำขอรีเซ็ต |
| user_id | int(11) | NO | MUL | NULL | รหัสสมาชิก |
| token_hash | varchar(255) | NO | UNI | NULL | SHA-256 ของ token (ไม่เก็บ token จริง) |
| expires_at | datetime | NO | - | NULL | วันเวลาหมดอายุ |
| used_at | datetime | YES | - | NULL | วันเวลาใช้/ยกเลิก token |
| created_at | datetime | NO | - | current_timestamp() | เวลาสร้าง (เวลาไทย) |

FK: `user_id` → `users.user_id`.
