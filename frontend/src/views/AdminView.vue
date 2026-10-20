<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import PaginationControls from "../components/PaginationControls.vue";
import { productImageUrl } from "../services/productImages";
const page = ref(1),
  total = ref(0),
  imageFile = ref(null),
  imagePreview = ref("");
function goPage(next) {
  page.value = next;
  load();
}
function clearPreview() {
  if (imagePreview.value.startsWith("blob:"))
    URL.revokeObjectURL(imagePreview.value);
  imagePreview.value = "";
}
onBeforeUnmount(clearPreview);
function selectImage(event) {
  const file = event.target.files[0];
  clearPreview();
  imageFile.value = null;
  if (!file) return;
  if (
    !["image/png", "image/jpeg"].includes(file.type) ||
    file.size > 5 * 1024 * 1024
  ) {
    error.value = "เลือกรูป JPG หรือ PNG ขนาดไม่เกิน 5 MB";
    event.target.value = "";
    return;
  }
  imageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
  error.value = "";
}
import api, { money, errorMessage } from "../services/api";
const products = ref([]),
  catalog = ref({ categories: [], brands: [] }),
  search = ref(""),
  error = ref(""),
  notice = ref(""),
  busy = ref(false),
  editing = ref(null),
  show = ref(false),
  newCategory = ref(""),
  newBrand = ref("");
const empty = () => ({
  sku: "",
  product_name: "",
  description: "",
  price: "",
  stock_qty: 0,
  category_id: "",
  brand_id: "",
  image_path: "",
  is_active: 1,
  version: 0,
  package_size: "",
  usage_instructions: "",
  storage_instructions: "",
  caution: "",
});
const form = reactive(empty());
async function load(reset = false) {
  if (reset === true) page.value = 1;
  busy.value = true;
  error.value = "";
  try {
    catalog.value = (await api.get("/catalog")).data;
    const result = await api.get("/products", {
      params: { all: 1, search: search.value, page: page.value },
    });
    products.value = result.data.data;
    total.value = result.data.total;
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
function edit(p = null) {
  clearPreview();
  imageFile.value = null;
  editing.value = p?.product_id || null;
  Object.assign(form, empty(), p || {});
  show.value = true;
  notice.value = "";
}
async function save() {
  notice.value = "";
  busy.value = true;
  error.value = "";
  try {
    if (imageFile.value) {
      const body = new FormData();
      body.append("image", imageFile.value);
      form.image_path = (
        await api.post("/products/images", body)
      ).data.image_path;
      imageFile.value = null;
    }
    await api[editing.value ? "put" : "post"](
      "/products" + (editing.value ? "/" + editing.value : ""),
      { ...form, expected_version: form.version },
    );
    show.value = false;
    notice.value = "บันทึกสินค้าสำเร็จ";
    await load();
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
async function hide(p) {
  if (!window.confirm(`ซ่อนสินค้า ${p.product_name} จากหน้าร้าน?`)) return;
  busy.value = true;
  try {
    await api.delete("/products/" + p.product_id);
    notice.value = "ซ่อนสินค้าแล้ว สามารถแก้ไขสถานะเพื่อเปิดขายอีกครั้ง";
    await load();
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
async function addCatalog(kind) {
  busy.value = true;
  error.value = "";
  try {
    await api.post("/catalog/" + kind, {
      name: kind === "categories" ? newCategory.value : newBrand.value,
    });
    newCategory.value = "";
    newBrand.value = "";
    await load();
    notice.value = "เพิ่มข้อมูลสำเร็จ";
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
onMounted(load);
</script>
<template>
  <main class="shop-page container">
    <div class="page-heading">
      <div>
        <p class="eyebrow">ADMIN / CATALOG</p>
        <h1>จัดการสินค้า</h1>
        <p class="text-secondary">
          เพิ่ม แก้ไข ซ่อน และค้นหาสินค้า รวมถึงหมวดหมู่และแบรนด์
        </p>
      </div>
      <button class="btn btn-success" @click="edit()">+ เพิ่มสินค้า</button>
    </div>
    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
    <div v-if="notice" class="alert alert-success" role="status">
      {{ notice }}
    </div>
    <section v-if="show" class="shop-panel mb-4">
      <h2 class="h4">
        {{ editing ? "แก้ไขสินค้า #" + editing : "เพิ่มสินค้าใหม่" }}
      </h2>
      <form class="row g-3" @submit.prevent="save">
        <div class="col-md-4">
          <label for="sku" class="form-label">SKU</label
          ><input
            id="sku"
            v-model.trim="form.sku"
            class="form-control"
            maxlength="50"
            required
          />
        </div>
        <div class="col-md-8">
          <label for="product-name" class="form-label">ชื่อสินค้า</label
          ><input
            id="product-name"
            v-model.trim="form.product_name"
            class="form-control"
            maxlength="200"
            required
          />
        </div>
        <div class="col-md-6">
          <label for="edit-category" class="form-label">หมวดหมู่</label
          ><select
            id="edit-category"
            v-model="form.category_id"
            class="form-select"
            required
          >
            <option value="" disabled>เลือกหมวดหมู่</option>
            <option
              v-for="c in catalog.categories"
              :key="c.category_id"
              :value="c.category_id"
            >
              {{ c.category_name }}
            </option>
          </select>
        </div>
        <div class="col-md-6">
          <label for="edit-brand" class="form-label">แบรนด์</label
          ><select
            id="edit-brand"
            v-model="form.brand_id"
            class="form-select"
            required
          >
            <option value="" disabled>เลือกแบรนด์</option>
            <option
              v-for="b in catalog.brands"
              :key="b.brand_id"
              :value="b.brand_id"
            >
              {{ b.brand_name }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label for="price" class="form-label">ราคา (บาท)</label
          ><input
            id="price"
            v-model="form.price"
            type="number"
            class="form-control"
            min="0"
            max="99999999.99"
            step="0.01"
            required
          />
        </div>
        <div class="col-md-4">
          <label for="stock" class="form-label">จำนวนคงเหลือ</label
          ><input
            id="stock"
            v-model.number="form.stock_qty"
            type="number"
            class="form-control"
            min="0"
            max="2147483647"
            step="1"
            required
          />
        </div>
        <div class="col-md-4">
          <label for="active" class="form-label">สถานะ</label
          ><select id="active" v-model="form.is_active" class="form-select">
            <option :value="1">เปิดขาย</option>
            <option :value="0">ซ่อน</option>
          </select>
        </div>
        <div class="col-12">
          <label for="product-image" class="form-label"
            >อัปโหลดรูปสินค้า JPG หรือ PNG ไม่เกิน 5 MB</label
          >
          <input
            :key="String(editing) + String(show)"
            id="product-image"
            type="file"
            accept="image/jpeg,image/png"
            class="form-control"
            :disabled="busy"
            @change="selectImage"
          />
          <p class="form-text">
            ไฟล์จะเก็บใน backend/image/pdimages
            กดบันทึกสินค้าเพื่อใช้รูปที่เลือก
          </p>
          <img
            v-if="imagePreview || productImageUrl(form.image_path)"
            :src="imagePreview || productImageUrl(form.image_path)"
            alt="ตัวอย่างรูปสินค้า"
            class="admin-image-preview"
          />
          <label for="image" class="form-label mt-2"
            >ตำแหน่งรูปภาพ (ระบบกรอกให้อัตโนมัติหลังอัปโหลด หรือใช้ URL
            รูปเดิม)</label
          >
          <input
            id="image"
            v-model.trim="form.image_path"
            maxlength="255"
            class="form-control"
            placeholder="เลือกไฟล์ด้านบน หรือกรอก https://..."
          />
          <button
            v-if="form.image_path || imageFile"
            type="button"
            class="btn btn-outline-danger mt-2"
            :disabled="busy"
            @click="
              form.image_path = '';
              imageFile = null;
              clearPreview();
            "
          >
            นำรูปออกจากสินค้านี้
          </button>
        </div>
        <div class="col-md-6">
          <label for="package-size" class="form-label">ขนาดบรรจุ</label
          ><input
            id="package-size"
            v-model="form.package_size"
            maxlength="200"
            class="form-control"
          />
        </div>
        <div class="col-md-6">
          <label for="usage" class="form-label">วิธีใช้</label
          ><textarea
            id="usage"
            v-model="form.usage_instructions"
            maxlength="2000"
            class="form-control"
          ></textarea>
        </div>
        <div class="col-md-6">
          <label for="storage" class="form-label">การเก็บรักษา</label
          ><textarea
            id="storage"
            v-model="form.storage_instructions"
            maxlength="2000"
            class="form-control"
          ></textarea>
        </div>
        <div class="col-md-6">
          <label for="caution" class="form-label">ข้อควรระวัง</label
          ><textarea
            id="caution"
            v-model="form.caution"
            maxlength="2000"
            class="form-control"
          ></textarea>
        </div>
        <div class="col-12">
          <label for="description" class="form-label">รายละเอียดสินค้า</label
          ><textarea
            id="description"
            v-model="form.description"
            maxlength="5000"
            rows="3"
            class="form-control"
          ></textarea>
        </div>
        <div class="col-12 d-flex gap-2">
          <button class="btn btn-success" :disabled="busy">บันทึกสินค้า</button
          ><button
            type="button"
            class="btn btn-light"
            :disabled="busy"
            @click="show = false"
          >
            ยกเลิก</button
          ><button
            type="button"
            class="btn btn-outline-success"
            :disabled="busy"
            @click="
              show = false;
              load();
            "
          >
            ปิดฟอร์มและโหลดข้อมูลล่าสุด
          </button>
        </div>
      </form>
    </section>
    <form class="d-flex gap-2 mb-4" @submit.prevent="load(true)">
      <label for="admin-search" class="visually-hidden">ค้นหาสินค้า</label
      ><input
        id="admin-search"
        v-model="search"
        class="form-control"
        maxlength="200"
        placeholder="ค้นหาชื่อ SKU รายละเอียด หมวดหมู่ หรือแบรนด์"
      /><button class="btn btn-success" :disabled="busy">ค้นหา</button>
    </form>
    <p v-if="busy" role="status">กำลังดำเนินการ…</p>
    <div class="shop-panel table-responsive">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>ID / SKU</th>
            <th>ชื่อสินค้า</th>
            <th>หมวดหมู่ / แบรนด์</th>
            <th>ราคา</th>
            <th>สต็อก</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p.product_id">
            <td>#{{ p.product_id }}<br />{{ p.sku }}</td>
            <td>{{ p.product_name }}</td>
            <td>
              {{ p.category_name }}<br /><small>{{ p.brand_name }}</small>
            </td>
            <td>{{ money(p.price) }}</td>
            <td>{{ p.stock_qty }}</td>
            <td>{{ p.is_active ? "เปิดขาย" : "ซ่อน" }}</td>
            <td class="text-nowrap">
              <button
                class="btn btn-sm btn-outline-success me-2"
                :disabled="busy"
                @click="edit(p)"
              >
                แก้ไข</button
              ><button
                v-if="p.is_active"
                class="btn btn-sm btn-outline-danger"
                :disabled="busy"
                @click="hide(p)"
              >
                ซ่อน/ลบ
              </button>
            </td>
          </tr>
          <tr v-if="!products.length">
            <td colspan="7" class="text-center">ไม่พบสินค้า</td>
          </tr>
        </tbody>
      </table>
    </div>
    <PaginationControls
      :page="page"
      :total="total"
      :busy="busy"
      @change="goPage"
    />
    <details class="shop-panel mt-4">
      <summary>เพิ่มหมวดหมู่และแบรนด์</summary>
      <div class="row g-3 mt-1">
        <form class="col-md-6" @submit.prevent="addCatalog('categories')">
          <label for="new-category" class="form-label">หมวดหมู่ใหม่</label>
          <div class="input-group">
            <input
              id="new-category"
              v-model.trim="newCategory"
              maxlength="100"
              required
              class="form-control"
            /><button class="btn btn-success" :disabled="busy">
              เพิ่มหมวดหมู่
            </button>
          </div>
        </form>
        <form class="col-md-6" @submit.prevent="addCatalog('brands')">
          <label for="new-brand" class="form-label">แบรนด์ใหม่</label>
          <div class="input-group">
            <input
              id="new-brand"
              v-model.trim="newBrand"
              maxlength="100"
              required
              class="form-control"
            /><button class="btn btn-success" :disabled="busy">
              เพิ่มแบรนด์
            </button>
          </div>
        </form>
      </div>
    </details>
  </main>
</template>
