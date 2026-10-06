<template>
  <div>

    <div class="products-section">
      <div class="container py-4">
        
        <!-- Header & Search Bar -->
        <div class="row align-items-center mb-4">
          <div class="col-md-6">
            <span class="section-badge">🌿 PRODUCT CATALOG</span>
            <h2 class="fw-bold text-dark-green mt-1">ผลิตภัณฑ์โปรไบโอติก</h2>
          </div>
          <div class="col-md-6 mt-3 mt-md-0">
            <div class="search-box input-group">
              <input
                v-model="search"
                type="text"
                class="form-control search-input"
                placeholder="ค้นหาสินค้าตามชื่อ, หมวดหมู่ หรือแบรนด์..."
                @keyup.enter="fetchProducts"
              />
              <button class="btn btn-shop" type="button" @click="fetchProducts">
                🔎 ค้นหา
              </button>
            </div>
          </div>
        </div>

        <!-- Status Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-green" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">กำลังโหลดรายการสินค้า...</p>
        </div>

        <!-- Status Empty -->
        <div v-else-if="products.length === 0" class="text-center py-5">
          <div class="empty-icon mb-3">🌱</div>
          <h4 class="fw-bold text-dark-green">ไม่พบสินค้าที่คุณค้นหา</h4>
          <p class="text-muted">ลองค้นหาด้วยคำอื่น หรือกดค้นหาใหม่</p>
          <button class="btn btn-outline-shop mt-2" @click="resetSearch">แสดงสินค้าทั้งหมด</button>
        </div>

        <!-- Product Grid -->
        <div v-else class="row g-4">
          <div
            v-for="product in products"
            :key="product.product_id || product.id"
            class="col-12 col-sm-6 col-lg-4 col-xl-3"
          >
            <div class="product-card">
              <div class="image-wrapper">
                <img
                  v-if="product.image_path"
                  :src="product.image_path.startsWith('http') ? product.image_path : `http://localhost:3000/${product.image_path}`"
                  :alt="product.product_name || product.name"
                  class="product-image"
                />
                <div v-else class="placeholder-image">
                  💊
                </div>
                <span v-if="product.stock_qty <= 0" class="badge bg-danger stock-badge">สินค้าหมด</span>
              </div>

              <div class="product-info">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="brand-tag">{{ product.brand_name || 'Probiotic Shop' }}</span>
                  <span class="category-tag">{{ product.category_name || 'ทั่วไป' }}</span>
                </div>

                <h5 class="product-title">{{ product.product_name || product.name }}</h5>
                <p class="product-description">{{ product.description || 'ไม่มีรายละเอียดสินค้า' }}</p>

                <div class="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <span class="product-price">฿{{ Number(product.price || 0).toLocaleString() }}</span>
                    <small class="d-block text-muted">เหลือ {{ product.stock_qty ?? 0 }} ชิ้น</small>
                  </div>
                  <button
                    class="btn btn-shop btn-sm px-3"
                    :disabled="(product.stock_qty ?? 0) <= 0"
                    @click="addToCart(product)"
                  >
                    {{ (product.stock_qty ?? 0) > 0 ? 'เลือกสินค้า' : 'หมด' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
// import Navbar from "../components/Navbar.vue";

const products = ref([]);
const search = ref("");
const loading = ref(true);

const fetchProducts = async () => {
  loading.value = true;

  try {
    const token = localStorage.getItem('token');
    const url = search.value
      ? `http://localhost:3000/api/products?search=${encodeURIComponent(search.value)}`
      : "http://localhost:3000/api/products";

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`โหลดสินค้าไม่สำเร็จ (Status: ${response.status})`);
    }

    const data = await response.json();

    // ตรวจสอบโครงสร้าง Response ยืดหยุ่นรองรับทุกรูปแบบ
    if (Array.isArray(data)) {
      products.value = data;
    } else if (Array.isArray(data.data)) {
      products.value = data.data;
    } else if (Array.isArray(data.products)) {
      products.value = data.products;
    } else {
      products.value = [];
    }
  } catch (error) {
    console.error("Fetch Products Error:", error);
  } finally {
    loading.value = false;
  }
};

const resetSearch = () => {
  search.value = "";
  fetchProducts();
};

const addToCart = (product) => {
  alert(`เพิ่ม "${product.product_name || product.name}" ลงในตะกร้าแล้ว`);
};

onMounted(fetchProducts);
</script>

<style scoped>
.products-section {
  min-height: calc(100vh - 80px);
  background: #f7faf8;
  padding: 40px 0;
}

.text-dark-green { color: #202a24; }
.text-green { color: #4c956c; }

.section-badge {
  display: inline-block;
  background: #e4f3e9;
  color: #397452;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
}

.search-input {
  border-radius: 12px 0 0 12px;
  padding: 12px 18px;
  border: 1px solid #e6ece8;
}

.search-input:focus {
  border-color: #4c956c;
  box-shadow: none;
}

.btn-shop {
  background: #4c956c;
  color: white;
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 600;
  border: none;
}

.btn-shop:hover {
  background: #397452;
  color: white;
}

.search-box .btn-shop {
  border-radius: 0 12px 12px 0;
}

.btn-outline-shop {
  border: 1px solid #4c956c;
  color: #397452;
  border-radius: 12px;
  padding: 8px 20px;
  font-weight: 600;
}

.btn-outline-shop:hover {
  background: #4c956c;
  color: white;
}

.product-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e6ece8;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 35px rgba(59, 94, 70, 0.1);
}

.image-wrapper {
  position: relative;
  height: 200px;
  background: #edf8f1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  font-size: 50px;
}

.stock-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 50px;
}

.product-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.brand-tag {
  font-size: 12px;
  color: #758278;
  font-weight: 600;
}

.category-tag {
  font-size: 11px;
  background: #f0f7f2;
  color: #397452;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.product-title {
  font-size: 16px;
  font-weight: 700;
  color: #202a24;
  margin-top: 6px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.product-description {
  font-size: 13px;
  color: #738078;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: auto;
}

.product-price {
  font-size: 20px;
  font-weight: 800;
  color: #397452;
}

.empty-icon {
  font-size: 50px;
}
</style>