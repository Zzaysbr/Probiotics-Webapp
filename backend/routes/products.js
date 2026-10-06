const express = require("express");
const router = express.Router();
const db = require("../db");

// Search / ดูสินค้าทั้งหมด
router.get("/", (req, res) => {
    const keyword = req.query.search || "";

    const sql = `
        SELECT
            p.product_id,
            p.sku,
            p.product_name,
            p.description,
            p.price,
            p.stock_qty,
            p.image_path,
            p.is_active,
            c.category_id,
            c.category_name,
            b.brand_id,
            b.brand_name
        FROM products p
        JOIN categories c ON p.category_id = c.category_id
        JOIN brands b ON p.brand_id = b.brand_id
        WHERE p.product_name LIKE ?
           OR p.sku LIKE ?
           OR b.brand_name LIKE ?
           OR c.category_name LIKE ?
        ORDER BY p.product_id DESC
    `;

    const search = `%${keyword}%`;

    db.query(
        sql,
        [search, search, search, search],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "ไม่สามารถดึงข้อมูลสินค้าได้"
                });
            }

            res.json(results);
        }
    );
});

// Insert - เพิ่มสินค้า
router.post("/", (req, res) => {
    const {
        category_id,
        brand_id,
        sku,
        product_name,
        description,
        price,
        stock_qty,
        image_path
    } = req.body;

    const sql = `
        INSERT INTO products
        (
            category_id,
            brand_id,
            sku,
            product_name,
            description,
            price,
            stock_qty,
            image_path
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            category_id,
            brand_id,
            sku,
            product_name,
            description,
            price,
            stock_qty,
            image_path
        ],
        (err, result) => {
            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "เพิ่มสินค้าไม่สำเร็จ",
                    error: err.message
                });
            }

            res.status(201).json({
                message: "เพิ่มสินค้าสำเร็จ",
                product_id: result.insertId
            });
        }
    );
});

// Update - แก้ไขสินค้า
router.put("/:id", (req, res) => {
    const id = req.params.id;

    const {
        category_id,
        brand_id,
        sku,
        product_name,
        description,
        price,
        stock_qty,
        image_path,
        is_active
    } = req.body;

    const sql = `
        UPDATE products
        SET
            category_id = ?,
            brand_id = ?,
            sku = ?,
            product_name = ?,
            description = ?,
            price = ?,
            stock_qty = ?,
            image_path = ?,
            is_active = ?
        WHERE product_id = ?
    `;

    db.query(
        sql,
        [
            category_id,
            brand_id,
            sku,
            product_name,
            description,
            price,
            stock_qty,
            image_path,
            is_active,
            id
        ],
        (err) => {
            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "แก้ไขสินค้าไม่สำเร็จ",
                    error: err.message
                });
            }

            res.json({
                message: "แก้ไขสินค้าสำเร็จ"
            });
        }
    );
});

// Delete - ลบสินค้า
router.delete("/:id", (req, res) => {
    const id = req.params.id;

    const sql = `
        DELETE FROM products
        WHERE product_id = ?
    `;

    db.query(sql, [id], (err) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "ลบสินค้าไม่สำเร็จ",
                error: err.message
            });
        }

        res.json({
            message: "ลบสินค้าสำเร็จ"
        });
    });
});

module.exports = router;