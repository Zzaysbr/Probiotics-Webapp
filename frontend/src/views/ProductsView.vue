<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import ProductVisual from "../components/ProductVisual.vue";
const route = useRoute();
import api, { money, errorMessage } from "../services/api";
import { addToCart } from "../services/cart";
const products = ref([]),
  catalog = ref({ categories: [], brands: [] }),
  search = ref(""),
  category = ref(""),
  brand = ref(""),
  loading = ref(false),
  error = ref(""),
  notice = ref("");
function resetFilters() {
  search.value = "";
  category.value = "";
  brand.value = "";
  load();
}
let requestNumber = 0;
async function load() {
  const currentRequest = ++requestNumber;
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/products", {
      params: {
        search: search.value,
        category_id: category.value,
        brand_id: brand.value,
      },
    });
    if (currentRequest === requestNumber) products.value = data.data;
  } catch (e) {
    if (currentRequest === requestNumber) error.value = errorMessage(e);
  } finally {
    if (currentRequest === requestNumber) loading.value = false;
  }
}
function add(p) {
  try {
    addToCart(p);
    notice.value = `เพิ่ม ${p.product_name} ในตะกร้าแล้ว`;
    error.value = "";
  } catch (e) {
    error.value = e.message;
  }
}
onMounted(async () => {
  try {
    catalog.value = (await api.get("/catalog")).data;
    if (typeof route.query.category === "string")
      category.value =
        catalog.value.categories.find(
          (c) => c.category_name === route.query.category,
        )?.category_id || "";
  } catch (e) {
    error.value = errorMessage(e);
  }
  await load();
});
</script>
<template>
  <main class="shop-page container">
    <div class="page-heading">
      <div>
        <p class="eyebrow">SHOP OUR COLLECTION</p>
        <h1>สินค้าทั้งหมด</h1>
        <p class="text-secondary">
          เลือกผลิตภัณฑ์ที่เหมาะกับคุณ พร้อมรายละเอียด ราคา และจำนวนคงเหลือ
        </p>
      </div>
      <RouterLink class="btn btn-success" to="/cart"
        >ดูตะกร้าสินค้า →</RouterLink
      >
    </div>
    <form class="shop-panel row g-3 mb-4" @submit.prevent="load">
      <div class="col-md-5">
        <label for="search" class="form-label">ค้นหาสินค้า</label
        ><input
          id="search"
          v-model="search"
          class="form-control"
          placeholder="ชื่อสินค้า SKU หมวดหมู่ หรือแบรนด์"
          maxlength="200"
        />
      </div>
      <div class="col-md-3">
        <label for="category" class="form-label">หมวดหมู่</label
        ><select
          id="category"
          v-model="category"
          class="form-select"
          @change="load"
        >
          <option value="">ทุกหมวดหมู่</option>
          <option
            v-for="c in catalog.categories"
            :value="c.category_id"
            :key="c.category_id"
          >
            {{ c.category_name }}
          </option>
        </select>
      </div>
      <div class="col-md-2">
        <label for="brand" class="form-label">แบรนด์</label
        ><select id="brand" v-model="brand" class="form-select" @change="load">
          <option value="">ทุกแบรนด์</option>
          <option
            v-for="b in catalog.brands"
            :value="b.brand_id"
            :key="b.brand_id"
          >
            {{ b.brand_name }}
          </option>
        </select>
      </div>
      <div class="col-md-2 d-flex align-items-end">
        <button class="btn btn-success w-100" :disabled="loading">ค้นหา</button>
      </div>
    </form>
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
      <button class="btn btn-sm btn-outline-danger" @click="load">
        ลองใหม่
      </button>
    </div>
    <div v-if="notice" class="alert alert-success" role="status">
      {{ notice }} <RouterLink to="/cart">ไปที่ตะกร้า</RouterLink>
    </div>
    <div
      class="d-flex justify-content-between align-items-center mb-3 small text-secondary"
    >
      <span v-if="!loading">พบ {{ products.length }} รายการ</span
      ><span v-else></span
      ><button
        v-if="search || category || brand"
        class="btn btn-link btn-sm"
        type="button"
        @click="resetFilters"
      >
        ล้างตัวกรองทั้งหมด
      </button>
    </div>
    <p v-if="loading" role="status">กำลังโหลดสินค้า…</p>
    <div v-else-if="!products.length" class="shop-panel text-center py-5">
      ไม่พบสินค้าที่ค้นหา
    </div>
    <div v-else class="row g-4">
      <article
        v-for="p in products"
        :key="p.product_id"
        class="col-md-6 col-lg-4"
      >
        <div class="product-card h-100">
          <div class="product-art">
            <img
              v-if="/^https?:\/\//.test(p.image_path || '')"
              :src="p.image_path"
              :alt="p.product_name"
              @error="$event.target.style.display = 'none'"
            /><ProductVisual
              v-else
              :variant="
                p.category_name === 'แบบผงหรือซอง'
                  ? 2
                  : p.category_name === 'แบบเม็ดเคี้ยว'
                    ? 3
                    : 1
              "
            />
          </div>
          <div class="p-4 d-flex flex-column flex-grow-1">
            <p class="small text-secondary">
              {{ p.category_name }} · {{ p.brand_name }} · {{ p.sku }}
            </p>
            <h2 class="h5">{{ p.product_name }}</h2>
            <p class="text-secondary product-description">
              {{ p.description }}
            </p>
            <div class="mt-auto">
              <p class="h4 text-success">{{ money(p.price) }}</p>
              <p class="small">
                {{
                  p.stock_qty > 0
                    ? "คงเหลือ " + p.stock_qty + " ชิ้น"
                    : "สินค้าหมด"
                }}
              </p>
              <button
                class="btn btn-success w-100"
                :disabled="p.stock_qty < 1"
                @click="add(p)"
              >
                {{ p.stock_qty > 0 ? "เพิ่มในตะกร้า" : "สินค้าหมด" }}
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  </main>
</template>
