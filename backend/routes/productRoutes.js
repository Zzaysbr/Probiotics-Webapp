const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin, isCustomerMember } = require('../middlewares/authMiddleware');

// 6.6.3: Customer Member และ Admin เข้าดูสินค้า & ค้นหาสินค้าได้
router.get('/', productController.getAllProducts);


// 6.6.2: เฉพาะ Admin เท่านั้นที่ Insert, Update, Delete ได้
router.post('/', verifyToken, isAdmin, productController.createProduct);
router.put('/:id', verifyToken, isAdmin, productController.updateProduct);
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;
