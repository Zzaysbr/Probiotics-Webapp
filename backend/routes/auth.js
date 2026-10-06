const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();
const db = require("../db");

router.post("/register", async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            full_name,
            phone
        } = req.body;

        if (!username || !email || !password || !full_name) {
            return res.status(400).json({
                message: "กรุณากรอกข้อมูลให้ครบ"
            });
        }

        const checkSql = `
            SELECT user_id
            FROM users
            WHERE username = ? OR email = ?
        `;

        db.query(
            checkSql,
            [username, email],
            async (err, results) => {

                if (err) {
                    console.error(err);

                    return res.status(500).json({
                        message: "เกิดข้อผิดพลาด"
                    });
                }

                if (results.length > 0) {
                    return res.status(409).json({
                        message: "Username หรือ Email นี้มีอยู่แล้ว"
                    });
                }

                const passwordHash =
                    await bcrypt.hash(password, 10);

                const insertSql = `
                    INSERT INTO users
                    (
                        username,
                        email,
                        password_hash,
                        full_name,
                        phone,
                        role
                    )
                    VALUES (?, ?, ?, ?, ?, 'customer')
                `;

                db.query(
                    insertSql,
                    [
                        username,
                        email,
                        passwordHash,
                        full_name,
                        phone || null
                    ],
                    (insertErr, result) => {

                        if (insertErr) {
                            console.error(insertErr);

                            return res.status(500).json({
                                message: "สมัครสมาชิกไม่สำเร็จ"
                            });
                        }

                        res.status(201).json({
                            message: "สมัครสมาชิกสำเร็จ",
                            user_id: result.insertId
                        });
                    }
                );
            }
        );

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "เกิดข้อผิดพลาดจาก Server"
        });
    }
});

module.exports = router;