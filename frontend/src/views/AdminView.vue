<template>
  <div class="admin-section py-4">
    <div class="container">
      <!-- ส่วนหัว -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold text-dark-green mb-1">⚙️ ระบบจัดการหลังบ้าน (Admin)</h2>
          <p class="text-muted small mb-0">จัดการรายการสินค้า Probiotics ทั้งหมดในระบบ</p>
        </div>
        <button @click="openModal('add')" class="btn btn-shop px-4 fw-bold">
          + เพิ่มสินค้าใหม่
        </button>
      </div>

      <!-- สถานะ Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">กำลังโหลด...</span>
        </div>
        <p class="text-muted mt-2">กำลังดึงข้อมูลสินค้า...</p>
      </div>

      <!-- ตารางสินค้า -->
      <div v-else class="table-card p-4">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>SKU</th>
                <th>ชื่อสินค้า</th>
                <th>ประเภท</th>
                <th>ราคา</th>
                <th>จำนวนสต็อก</th>
                <th class="text-end">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="products.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">
                  ยังไม่มีรายการสินค้าในระบบ
                </td>
              </tr>
              <tr v-for="item in products" :key="getProductId(item)">
                <td>#{{ String(getProductId(item) || 0).padStart(2, '0') }}</td>
                <td class="text-muted small">{{ item.sku || '-' }}</td>
                <td class="fw-bold text-dark-green">
                  {{ item.name || item.title || item.product_name }}
                </td>
                <td>
                  <span class="badge bg-soft-green text-green">
                    {{ item.category || item.type || 'แคปซูล' }}
                  </span>
                </td>
                <td class="fw-bold">฿{{ item.price }}</td>
                <td>
                  <span class="badge" :class="(item.stock_qty ?? item.stock_quantity ?? 0) > 0 ? 'bg-success' : 'bg-danger'">
                    {{ item.stock_qty ?? item.stock_quantity ?? 0 }} ชิ้น
                  </span>
                </td>
                <td class="text-end">
                  <button @click="openModal('edit', item)" class="btn btn-outline-primary btn-sm me-2">
                    แก้ไข
                  </button>
                  <button @click="deleteProduct(getProductId(item))" class="btn btn-outline-danger btn-sm">
                    ลบ
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal ฟอร์ม เพิ่ม/แก้ไข สินค้า -->
    <div v-if="showModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center">
      <div class="modal-card p-4 bg-white rounded-4 shadow-lg">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="fw-bold text-dark-green mb-0">
            {{ isEditMode ? '✏️ แก้ไขข้อมูลสินค้า' : '➕ เพิ่มสินค้าใหม่' }}
          </h4>
          <button @click="closeModal" type="button" class="btn-close"></button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="row mb-3">
            <div class="col-8">
              <label class="form-label small fw-bold text-secondary">ชื่อสินค้า</label>
              <input v-model="form.name" type="text" class="form-control custom-input" placeholder="ระบุชื่อสินค้า" required />
            </div>
            <div class="col-4">
              <label class="form-label small fw-bold text-secondary">SKU</label>
              <input v-model="form.sku" type="text" class="form-control custom-input" placeholder="เช่น SKU-001" />
            </div>
          </div>

          <div class="row mb-3">
            <div class="col-4">
              <label class="form-label small fw-bold text-secondary">ประเภท</label>
              <input v-model="form.category" type="text" class="form-control custom-input" placeholder="เช่น แคปซูล" required />
            </div>
            <div class="col-4">
              <label class="form-label small fw-bold text-secondary">ราคา (บาท)</label>
              <input v-model.number="form.price" type="number" class="form-control custom-input" placeholder="0" min="0" required />
            </div>
            <div class="col-4">
              <label class="form-label small fw-bold text-secondary">จำนวนสต็อก</label>
              <input v-model.number="form.stock_quantity" type="number" class="form-control custom-input" placeholder="100" min="0" required />
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-bold text-secondary">รายละเอียดสินค้า</label>
            <textarea v-model="form.description" class="form-control custom-input" rows="3" placeholder="ระบุรายละเอียด..."></textarea>
          </div>

          <div class="d-flex justify-content-end gap-2 pt-2 border-top">
            <button type="button" @click="closeModal" class="btn btn-light px-4">ยกเลิก</button>
            <button type="submit" class="btn btn-shop px-4 fw-bold" :disabled="submitting">
              {{ submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { isAdmin, authState } from '../services/auth';

const router = useRouter();
const API_BASE_URL = 'http://localhost:3000/api';

const products = ref([]);
const loading = ref(false);
const submitting = ref(false);
const showModal = ref(false);
const isEditMode = ref(false);
const currentId = ref(null);

const form = ref({
  sku: '',
  name: '',
  category: 'แคปซูล',
  price: 0,
  stock_quantity: 100,
  description: '',
  is_active: 1
});

// ฟังก์ชันช่วยดึงค่า ID
const getProductId = (item) => {
  if (!item) return null;
  return item.product_id || item.id || item._id;
};

// ฟังก์ชันดึง Token และสร้าง Header
const getHeaders = () => {
  let token = authState.token || authState.session?.token || localStorage.getItem('token');
  
  if (!token) {
    try {
      const savedSession = localStorage.getItem('probiotics-session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        token = parsed.token;
      }
    } catch (e) {
      console.error('Error parsing probiotics-session:', e);
    }
  }

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// 1. ดึงข้อมูลสินค้า (READ)
const fetchProducts = async () => {
  loading.value = true;
  try {
    let res = await fetch(`${API_BASE_URL}/products`, { headers: getHeaders() });

    if (res.ok) {
      const data = await res.json();
      products.value = Array.isArray(data) ? data : (data.data || data.products || []);
    } else {
      console.warn('ไม่สามารถดึงข้อมูลรายการสินค้าได้');
    }
  } catch (err) {
    console.error('Error fetching products:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (!isAdmin()) {
    alert('คุณไม่มีสิทธิ์เข้าถึงหน้าระบบจัดการหลังบ้าน');
    router.push('/products');
    return;
  }
  fetchProducts();
});

//
const openModal = (mode, item = null) => {
  if (mode === 'edit' && item) {
    isEditMode.value = true;
    currentId.value = getProductId(item);
    form.value = {
      sku: item.sku || '',
      name: item.product_name || item.name || item.title || '',
      category: item.category || item.type || 'แคปซูล',
      price: item.price || 0,
      // อ่านค่า stock_qty จาก Database ก่อน
      stock_quantity: item.stock_qty !== undefined ? item.stock_qty : (item.stock_quantity !== undefined ? item.stock_quantity : 100),
      description: item.description || '',
      is_active: item.is_active !== undefined ? item.is_active : 1
    };
  } else {
    isEditMode.value = false;
    currentId.value = null;
    form.value = { 
      sku: '', 
      name: '', 
      category: 'แคปซูล', 
      price: 0, 
      stock_quantity: 100, 
      description: '', 
      is_active: 1 
    };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

// 2. บันทึก/แก้ไขข้อมูลสินค้า (CREATE / UPDATE)
const handleSubmit = async () => {
  if (!form.value.name || form.value.price <= 0) {
    alert('กรุณากรอกชื่อสินค้าและราคาให้ถูกต้อง');
    return;
  }

  submitting.value = true;
  try {
    const endpoint = isEditMode.value 
      ? `${API_BASE_URL}/products/${currentId.value}`
      : `${API_BASE_URL}/products`;
    
    const method = isEditMode.value ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method: method,
      headers: getHeaders(),
      body: JSON.stringify(form.value)
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      alert(isEditMode.value ? 'แก้ไขสินค้าเรียบร้อย!' : 'เพิ่มสินค้าเรียบร้อย!');
      closeModal();
      await fetchProducts();
    } else {
      alert(data.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  } catch (err) {
    console.error('Submit error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
  } finally {
    submitting.value = false;
  }
};

// 3. ลบสินค้า (DELETE)
const deleteProduct = async (id) => {
  if (!id) return;
  if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?')) return;

  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      alert('ลบรายการสินค้าเรียบร้อยแล้ว');
      await fetchProducts();
    } else {
      alert(data.message || 'ไม่สามารถลบสินค้าได้');
    }
  } catch (err) {
    console.error('Delete error:', err);
    alert('เกิดข้อผิดพลาดในการลบข้อมูล');
  }
};
</script>

<style scoped>
.admin-section {
  min-height: calc(100vh - 80px);
  background: #f7faf8;
}
.text-dark-green { color: #202a24; }
.text-green { color: #397452; }
.bg-soft-green {
  background: #e4f3e9;
  color: #397452;
}
.table-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e6ece8;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
}
.btn-shop {
  background: #4c956c;
  color: white;
  border-radius: 10px;
  font-weight: 600;
  border: none;
}
.btn-shop:hover { background: #397452; }

.modal-backdrop-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1050;
}
.modal-card {
  width: 100%;
  max-width: 540px;
  border: 1px solid #e6ece8;
}
.custom-input {
  border-radius: 10px;
  padding: 10px 14px;
  border: 1px solid #e6ece8;
  background-color: #f8faf8;
}
.custom-input:focus {
  background-color: #fff;
  border-color: #4c956c;
  box-shadow: 0 0 0 0.2rem rgba(76, 149, 108, 0.15);
}
</style>