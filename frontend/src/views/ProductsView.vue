<script setup>
import { ref, onMounted } from "vue";
import Navbar from "../components/Navbar.vue";

const products = ref([]);
const search = ref("");
const loading = ref(true);

const fetchProducts = async () => {
  loading.value = true;

  try {
    const url = search.value
      ? `http://localhost:3000/api/products?search=${encodeURIComponent(search.value)}`
      : "http://localhost:3000/api/products";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("โหลดสินค้าไม่สำเร็จ");
    }

    products.value = await response.json();
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProducts);
</script>

<template>
  <div>
    <Navbar />

    <section class="products-hero">
      <div class="container">
        <div class="text-center">
          <span class="page-badge">PRODUCTS</span>

          <h1 class="page-title mt-3">สินค้าโปรไบโอติก</h1>

          <p class="page-subtitle">
            เลือกผลิตภัณฑ์โปรไบโอติกที่เหมาะกับคุณ
            จากหลากหลายหมวดหมู่และแบรนด์
          </p>
        </div>
      </div>
    </section>

    <section class="products-section">
      <div class="container">
        <div class="search-wrapper">
          <div class="search-box">
            <input
              v-model="search"
              type="text"
              placeholder="ค้นหาชื่อสินค้า แบรนด์ หรือหมวดหมู่..."
              @keyup.enter="fetchProducts"
            />

            <button type="button" @click="fetchProducts">
              ค้นหา
            </button>
          </div>
        </div>

        <div v-if="loading" class="status-box">
          <div class="spinner"></div>
          <p>กำลังโหลดสินค้า...</p>
        </div>

        <div v-else-if="products.length === 0" class="status-box">
          <div class="empty-icon">🔎</div>
          <h3>ไม่พบสินค้า</h3>
          <p>ลองค้นหาด้วยคำอื่นอีกครั้ง</p>
        </div>

        <div v-else class="product-grid">
          <article
            v-for="product in products"
            :key="product.product_id"
            class="product-card"
          >
            <div class="product-image-wrap">
              <img
                v-if="product.image_path"
                :src="`http://localhost:3000/${product.image_path}`"
                :alt="product.product_name"
              />

              <div v-else class="image-placeholder">
                <span>🌿</span>
                <small>PROBIOTIC</small>
              </div>

              <span class="category-badge">
                {{ product.category_name }}
              </span>
            </div>

            <div class="product-info">
              <p class="brand">{{ product.brand_name }}</p>

              <h2>{{ product.product_name }}</h2>

              <p class="description">
                {{ product.description }}
              </p>

              <div class="product-bottom">
                <div>
                  <h3 class="price">
                    ฿{{ Number(product.price).toLocaleString() }}
                  </h3>

                  <p
                    class="stock"
                    :class="{ out: product.stock_qty <= 0 }"
                  >
                    {{
                      product.stock_qty > 0
                        ? `เหลือ ${product.stock_qty} ชิ้น`
                        : "สินค้าหมด"
                    }}
                  </p>
                </div>

                <button
                  class="select-btn"
                  type="button"
                  :disabled="product.stock_qty <= 0"
                >
                  เลือกสินค้า
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.products-hero {
  background: linear-gradient(
    135deg,
    #f3faf5 0%,
    #ffffff 55%,
    #eaf6ee 100%
  );
  padding: 65px 0 50px;
}

.page-badge {
  display: inline-block;
  padding: 8px 18px;
  border-radius: 30px;
  background: #e3f2e8;
  color: #3f7c58;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
}

.page-title {
  font-size: 44px;
  font-weight: 800;
  color: #223128;
}

.page-subtitle {
  margin-top: 12px;
  color: #748078;
  font-size: 17px;
}

.products-section {
  padding: 55px 0 90px;
  background: #ffffff;
}

.search-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 45px;
}

.search-box {
  width: 100%;
  max-width: 760px;
  display: flex;
  gap: 12px;
}

.search-box input {
  flex: 1;
  border: 1px solid #dfe8e2;
  border-radius: 12px;
  padding: 14px 18px;
  font-size: 16px;
  outline: none;
  transition: 0.2s;
}

.search-box input:focus {
  border-color: #4c956c;
  box-shadow: 0 0 0 4px rgba(76, 149, 108, 0.1);
}

.search-box button {
  border: none;
  border-radius: 12px;
  padding: 0 26px;
  background: #4c956c;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.search-box button:hover {
  background: #397452;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 28px;
}

.product-card {
  border: 1px solid #e6ece8;
  border-radius: 22px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(56, 86, 65, 0.07);
  transition: all 0.25s ease;
}

.product-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 20px 45px rgba(56, 86, 65, 0.13);
}

.product-image-wrap {
  position: relative;
  height: 230px;
  background: linear-gradient(145deg, #edf8f1, #dcefe3);
  overflow: hidden;
}

.product-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #4c956c;
}

.image-placeholder span {
  font-size: 58px;
}

.image-placeholder small {
  margin-top: 10px;
  font-weight: 700;
  letter-spacing: 2px;
}

.category-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.92);
  color: #397452;
  padding: 7px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.product-info {
  padding: 24px;
}

.brand {
  margin: 0 0 7px;
  color: #4c956c;
  font-size: 14px;
  font-weight: 700;
}

.product-info h2 {
  font-size: 24px;
  font-weight: 800;
  color: #26352b;
  margin-bottom: 12px;
}

.description {
  color: #6f7c73;
  line-height: 1.65;
  min-height: 80px;
  margin-bottom: 22px;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 15px;
  border-top: 1px solid #edf1ee;
  padding-top: 18px;
}

.price {
  margin: 0;
  color: #26352b;
  font-size: 27px;
  font-weight: 800;
}

.stock {
  margin: 5px 0 0;
  color: #4c956c;
  font-size: 14px;
  font-weight: 600;
}

.stock.out {
  color: #c45b5b;
}

.select-btn {
  border: none;
  border-radius: 11px;
  padding: 11px 18px;
  background: #4c956c;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.select-btn:hover:not(:disabled) {
  background: #397452;
}

.select-btn:disabled {
  background: #b9c3bc;
  cursor: not-allowed;
}

.status-box {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #6f7c73;
}

.spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #e3eee7;
  border-top-color: #4c956c;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 15px;
}

.empty-icon {
  font-size: 45px;
  margin-bottom: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767px) {
  .page-title {
    font-size: 34px;
  }

  .search-box {
    flex-direction: column;
  }

  .search-box button {
    padding: 13px 20px;
  }

  .product-bottom {
    align-items: flex-start;
    flex-direction: column;
  }

  .select-btn {
    width: 100%;
  }
}
</style>
