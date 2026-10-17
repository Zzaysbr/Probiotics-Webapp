-- Optional public sample catalog for a NEW database. Use demo:seed to add demo accounts.
INSERT IGNORE INTO `categories` (`category_id`,`category_name`) VALUES
(2,'แบบผงหรือซอง'),
(3,'แบบเม็ดเคี้ยว'),
(1,'แบบแคปซูล');
INSERT IGNORE INTO `brands` (`brand_id`,`brand_name`) VALUES
(1,'BioCare'),
(3,'Healthy Gut'),
(2,'Probio Plus');
INSERT IGNORE INTO `products` (`product_id`,`category_id`,`brand_id`,`sku`,`product_name`,`description`,`price`,`stock_qty`,`image_path`,`is_active`) VALUES
(1,1,1,'PB001','Probiotic Daily Balance','โปรไบโอติกแบบแคปซูล ขนาดบรรจุ 30 แคปซูล เหมาะสำหรับรับประทานเป็นประจำ ควรเก็บในที่แห้งและเย็น','590.00',50,'uploads/products/pb001.jpg',1),
(2,2,2,'PB002','Probiotic Powder Plus','โปรไบโอติกชนิดผงหรือซอง ขนาดบรรจุ 15 ซอง วิธีใช้ละลายในน้ำตามคำแนะนำบนฉลาก','450.00',40,'uploads/products/pb002.jpg',1),
(3,3,3,'PB003','Probiotic Chewable','โปรไบโอติกชนิดเม็ดเคี้ยว ขนาดบรรจุ 30 เม็ด รับประทานง่าย','490.00',10,'uploads/products/pb003.jpg',1);
