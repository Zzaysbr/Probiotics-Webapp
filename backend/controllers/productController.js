const db = require('../db');

// 1. ดึงข้อมูลสินค้าทั้งหมด
exports.getAllProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM products WHERE is_active = 1';
    let params = [];

    if (search) {
      query += ' AND (product_name LIKE ? OR sku LIKE ? OR description LIKE ?)';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    query += ' ORDER BY product_id DESC';

    const [products] = await db.query(query, params);
    return res.status(200).json({ status: 'success', total: products.length, data: products });
  } catch (error) {
    console.error('getAllProducts error:', error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า', error: error.message });
  }
};

// 2. เพิ่มสินค้าใหม่ (Create)
exports.createProduct = async (req, res) => {
  const { sku, name, product_name, price, stock_quantity, stock_qty, description, category_id, brand_id } = req.body;

  const productNameVal = product_name || name;
  const stockQtyVal = stock_qty !== undefined ? stock_qty : (stock_quantity !== undefined ? stock_quantity : 100);

  try {
    if (!productNameVal || price === undefined) {
      return res.status(400).json({ message: 'กรุณากรอกชื่อสินค้าและราคา' });
    }

    const productSku = sku || `SKU-${Date.now()}`;
    const categoryIdVal = category_id || 1; // ใส่ค่า Default ID หมวดหมู่
    const brandIdVal = brand_id || 1;       // ใส่ค่า Default ID แบรนด์

    await db.query(
      'INSERT INTO products (category_id, brand_id, sku, product_name, description, price, stock_qty, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [categoryIdVal, brandIdVal, productSku, productNameVal, description || '', price, stockQtyVal]
    );

    return res.status(201).json({ message: 'เพิ่มรายการสินค้าสำเร็จ' });
  } catch (error) {
    console.error('createProduct error:', error);
    return res.status(500).json({ message: 'ไม่สามารถเพิ่มสินค้าได้', error: error.message });
  }
};

// 3. แก้ไขข้อมูลสินค้า (Update)
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { sku, name, product_name, price, stock_quantity, stock_qty, description, category_id, brand_id, is_active } = req.body;

  try {
    const [existing] = await db.query('SELECT * FROM products WHERE product_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'ไม่พบรายการสินค้านี้' });
    }

    const currentData = existing[0];

    const updatedSku = sku || currentData.sku || `SKU-${id}`;
    const updatedName = product_name || name || currentData.product_name;
    const updatedPrice = price !== undefined ? price : currentData.price;
    const updatedStock = stock_qty !== undefined ? stock_qty : (stock_quantity !== undefined ? stock_quantity : currentData.stock_qty);
    const updatedDesc = description !== undefined ? description : (currentData.description || '');
    const updatedCategory = category_id || currentData.category_id || 1;
    const updatedBrand = brand_id || currentData.brand_id || 1;
    const updatedIsActive = is_active !== undefined ? is_active : (currentData.is_active !== undefined ? currentData.is_active : 1);

    await db.query(
      'UPDATE products SET category_id = ?, brand_id = ?, sku = ?, product_name = ?, description = ?, price = ?, stock_qty = ?, is_active = ? WHERE product_id = ?',
      [updatedCategory, updatedBrand, updatedSku, updatedName, updatedDesc, updatedPrice, updatedStock, updatedIsActive, id]
    );

    return res.status(200).json({ message: 'อัปเดตข้อมูลสินค้าสำเร็จ' });
  } catch (error) {
    console.error('updateProduct error:', error);
    return res.status(500).json({ message: 'ไม่สามารถอัปเดตสินค้าได้', error: error.message });
  }
};

// 4. ลบสินค้า (Delete / Soft Delete)
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('UPDATE products SET is_active = 0 WHERE product_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบรายการสินค้านี้' });
    }

    return res.status(200).json({ message: 'ลบรายการสินค้าเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('deleteProduct error:', error);
    return res.status(500).json({ message: 'ไม่สามารถลบสินค้าได้', error: error.message });
  }
};