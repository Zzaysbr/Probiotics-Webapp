<template>
  <main class="container py-4 py-md-5">
    <div class="page-heading d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
      <div>
        <p class="eyebrow mb-2">{{ admin ? "จัดการร้านค้า" : "PROBIOTIC SHOP" }}</p>
        <h1 class="h2 fw-semibold mb-1">{{ admin ? "สินค้าในร้าน" : "เลือกชมสินค้า" }}</h1>
        <p class="text-secondary mb-0">{{ admin ? "ค้นหา เพิ่ม และปรับปรุงรายการสินค้า" : "ผลิตภัณฑ์โปรไบโอติกที่พร้อมให้คุณเลือก" }}</p>
      </div>
      <form class="search-form d-flex gap-2" role="search" @submit.prevent="loadProducts">
        <label class="visually-hidden" for="product-search">ค้นหาสินค้า</label>
        <input id="product-search" v-model.trim="search" class="form-control" placeholder="ค้นหาชื่อหรือ SKU">
        <button class="btn btn-outline-success" type="submit" :disabled="loading">ค้นหา</button>
      </form>
    </div>

    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
    <div v-if="notice" class="alert alert-success" role="status">{{ notice }}</div>

    <section v-if="admin" class="product-editor mb-4">
      <div class="d-flex align-items-center justify-content-between gap-3 mb-3">
        <h2 class="h5 mb-0">{{ editingId ? "แก้ไขสินค้า" : "เพิ่มสินค้า" }}</h2>
        <button v-if="editingId" class="btn btn-sm btn-outline-secondary" type="button" @click="resetEditor">ยกเลิก</button>
      </div>
      <form class="row g-3" @submit.prevent="saveProduct">
        <div class="col-sm-6 col-lg-2">
          <label class="form-label" for="product-sku">SKU</label>
          <input id="product-sku" v-model.trim="form.sku" class="form-control" required>
        </div>
        <div class="col-sm-6 col-lg-3">
          <label class="form-label" for="product-name">ชื่อสินค้า</label>
          <input id="product-name" v-model.trim="form.name" class="form-control" required>
        </div>
        <div class="col-sm-6 col-lg-2">
          <label class="form-label" for="product-price">ราคา</label>
          <input id="product-price" v-model.number="form.price" class="form-control" type="number" min="0" step="0.01" required>
        </div>
        <div class="col-sm-6 col-lg-2">
          <label class="form-label" for="product-stock">จำนวนคงเหลือ</label>
          <input id="product-stock" v-model.number="form.stock_quantity" class="form-control" type="number" min="0" step="1">
        </div>
        <div class="col-lg-3">
          <label class="form-label" for="product-description">รายละเอียด</label>
          <input id="product-description" v-model.trim="form.description" class="form-control">
        </div>
        <div class="col-12 d-flex justify-content-end">
          <button class="btn btn-success" type="submit" :disabled="saving">
            {{ saving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "เพิ่มสินค้า" }}
          </button>
        </div>
      </form>
    </section>

    <div class="results-meta mb-2" aria-live="polite">
      <span>{{ products.length }} รายการ</span>
      <span v-if="admin" class="text-secondary">จัดการได้เฉพาะบัญชี Admin</span>
    </div>
    <div v-if="loading" class="py-5 text-center text-secondary">กำลังโหลดสินค้า...</div>
    <div v-else-if="!products.length" class="empty-state py-5 text-center">
      <h2 class="h5">ไม่พบสินค้า</h2>
      <p class="text-secondary mb-0">ลองค้นหาด้วยชื่อสินค้าหรือ SKU อื่น</p>
    </div>
    <div v-else class="table-responsive product-table-wrap">
      <table class="table align-middle mb-0">
        <thead>
          <tr>
            <th scope="col">สินค้า</th>
            <th scope="col">SKU</th>
            <th scope="col" class="text-end">ราคา</th>
            <th scope="col" class="text-end">คงเหลือ</th>
            <th v-if="admin" scope="col" class="text-end">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.product_id">
            <td>
              <div class="fw-medium">{{ product.name }}</div>
              <div v-if="product.description" class="small text-secondary product-description">{{ product.description }}</div>
            </td>
            <td class="text-secondary">{{ product.sku }}</td>
            <td class="text-end text-nowrap">{{ formatPrice(product.price) }}</td>
            <td class="text-end">{{ product.stock_quantity ?? 0 }}</td>
            <td v-if="admin" class="text-end text-nowrap">
              <button class="btn btn-sm btn-outline-secondary me-1" type="button" :aria-label="`แก้ไข ${product.name}`" @click="editProduct(product)">แก้ไข</button>
              <button class="btn btn-sm btn-outline-danger" type="button" :aria-label="`ลบ ${product.name}`" @click="deleteProduct(product)">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import api from "../services/api";
import { isAdmin } from "../services/auth";

const admin = isAdmin();
const products = ref([]);
const search = ref("");
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const notice = ref("");
const editingId = ref(null);
const emptyForm = () => ({ sku: "", name: "", price: 0, stock_quantity: 0, description: "" });
const form = reactive(emptyForm());

function formatPrice(value) {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(Number(value) || 0);
}

function messageFrom(requestError) {
  return requestError.response?.data?.message || "เชื่อมต่อระบบไม่สำเร็จ กรุณาลองอีกครั้ง";
}

async function loadProducts() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/products", { params: search.value ? { search: search.value } : {} });
    products.value = data.data || [];
  } catch (requestError) {
    error.value = messageFrom(requestError);
  } finally {
    loading.value = false;
  }
}

function resetEditor() {
  editingId.value = null;
  Object.assign(form, emptyForm());
}

function editProduct(product) {
  editingId.value = product.product_id;
  Object.assign(form, {
    sku: product.sku || "",
    name: product.name || "",
    price: Number(product.price) || 0,
    stock_quantity: Number(product.stock_quantity) || 0,
    description: product.description || "",
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function saveProduct() {
  saving.value = true;
  error.value = "";
  notice.value = "";
  const payload = { ...form };
  try {
    if (editingId.value) {
      await api.put(`/products/${editingId.value}`, { ...payload, is_active: 1 });
      notice.value = "บันทึกการแก้ไขสินค้าแล้ว";
    } else {
      await api.post("/products", payload);
      notice.value = "เพิ่มสินค้าแล้ว";
    }
    resetEditor();
    await loadProducts();
  } catch (requestError) {
    error.value = messageFrom(requestError);
  } finally {
    saving.value = false;
  }
}

async function deleteProduct(product) {
  if (!window.confirm(`ยืนยันลบสินค้า “${product.name}” หรือไม่?`)) return;
  error.value = "";
  notice.value = "";
  try {
    await api.delete(`/products/${product.product_id}`);
    notice.value = "ลบสินค้าแล้ว";
    if (editingId.value === product.product_id) resetEditor();
    await loadProducts();
  } catch (requestError) {
    error.value = messageFrom(requestError);
  }
}

onMounted(loadProducts);
</script>