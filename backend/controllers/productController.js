const db = require('../db');


exports.getAllProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM products WHERE is_active = 1';
    let params = [];

    // 6.6.2 ค้นหา (Search)
    if (search) {
      query += ' AND (name LIKE ? OR sku LIKE ? OR description LIKE ?)';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    query += ' ORDER BY product_id DESC';

    const [products] = await db.query(query, params);
    return res.status(200).json({ status: 'success', total: products.length, data: products });
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า', error: error.message });
  }
};


exports.createProduct = async (req, res) => {
  const { sku, name, price, stock_quantity, description } = req.body;

  try {
    if (!sku || !name || price === undefined) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูล SKU, ชื่อสินค้า และราคา' });
    }

    await db.query(
      'INSERT INTO products (sku, name, price, stock_quantity, description) VALUES (?, ?, ?, ?, ?)',
      [sku, name, price, stock_quantity || 0, description || '']
    );

    return res.status(201).json({ message: 'เพิ่มรายการสินค้าสำเร็จ' });
  } catch (error) {
    return res.status(500).json({ message: 'ไม่สามารถเพิ่มสินค้าได้', error: error.message });
  }
};

// 6.6.2: Admin แก้ไขสินค้า (Update)
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { sku, name, price, stock_quantity, description, is_active } = req.body;

  try {
    const [existing] = await db.query('SELECT product_id FROM products WHERE product_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'ไม่พบรายการสินค้านี้' });
    }

    await db.query(
      'UPDATE products SET sku = ?, name = ?, price = ?, stock_quantity = ?, description = ?, is_active = ? WHERE product_id = ?',
      [sku, name, price, stock_quantity, description, is_active, id]
    );

    return res.status(200).json({ message: 'อัปเดตข้อมูลสินค้าสำเร็จ' });
  } catch (error) {
    return res.status(500).json({ message: 'ไม่สามารถอัปเดตสินค้าได้', error: error.message });
  }
};

// 6.6.2: Admin ลบสินค้า (Delete / Soft Delete)
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // ใช้ Soft Delete เพื่อไม่ให้กระทบประวัติคำสั่งซื้อ
    await db.query('UPDATE products SET is_active = 0 WHERE product_id = ?', [id]);
    return res.status(200).json({ message: 'ลบรายการสินค้าเรียบร้อยแล้ว (Soft Delete)' });
  } catch (error) {
    return res.status(500).json({ message: 'ไม่สามารถลบสินค้าได้', error: error.message });
  }
};