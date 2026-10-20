const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const multer = require("multer");
const {
  verifyToken,
  isAdmin,
  isCustomerMember,
} = require("../middlewares/authMiddleware");
router.post(
  "/images",
  verifyToken,
  isAdmin,
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0 },
  }).single("image"),
  require("../controllers/productImageController").upload,
);

// 6.6.3: Customer Member และ Admin เข้าดูสินค้า & ค้นหาสินค้าได้
router.get(
  "/",
  verifyToken,
  isCustomerMember,
  productController.getAllProducts,
);

// 6.6.2: เฉพาะ Admin เท่านั้นที่ Insert, Update, Delete ได้
router.post("/", verifyToken, isAdmin, productController.createProduct);
router.put("/:id", verifyToken, isAdmin, productController.updateProduct);
router.delete("/:id", verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;
