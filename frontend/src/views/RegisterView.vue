<template>
  <div class="register-section d-flex align-items-center justify-content-center min-vh-100 py-5">
    <div class="register-card p-4 p-md-5 shadow-lg rounded-4 bg-white border-0">
      
      <!-- Brand Header -->
      <div class="text-center mb-4">
        <div class="brand-badge d-inline-block px-3 py-1 rounded-pill mb-2 fw-bold text-uppercase">
          🌿 Probiotic Shop
        </div>
        <h2 class="fw-bold text-dark-green fs-3 mb-1">สร้างบัญชีใหม่</h2>
        <p class="text-muted small">สมัครสมาชิกเพื่อรับสิทธิพิเศษและสั่งซื้อสินค้า</p>
      </div>

      <!-- Alerts -->
      <div v-if="message" class="alert alert-success alert-dismissible fade show rounded-3 small py-2 mb-3" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>{{ message }}
      </div>
      <div v-if="error" class="alert alert-danger alert-dismissible fade show rounded-3 small py-2 mb-3" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
        <button type="button" class="btn-close py-2" @click="error = ''"></button>
      </div>

      <!-- Form -->
      <form @submit.prevent="register">
        <div class="row g-3">
          
          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold text-secondary small mb-1">ชื่อผู้ใช้ (Username) <span class="text-danger">*</span></label>
            <input
              v-model="form.username"
              type="text"
              class="form-control custom-input"
              placeholder="Username"
              required
              :disabled="loading"
            />
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold text-secondary small mb-1">อีเมล <span class="text-danger">*</span></label>
            <input
              v-model="form.email"
              type="email"
              class="form-control custom-input"
              placeholder="name@example.com"
              required
              :disabled="loading"
            />
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold text-secondary small mb-1">ชื่อ-นามสกุล <span class="text-danger">*</span></label>
            <input
              v-model="form.full_name"
              type="text"
              class="form-control custom-input"
              placeholder="ชื่อ นามสกุล"
              required
              :disabled="loading"
            />
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold text-secondary small mb-1">เบอร์โทรศัพท์</label>
            <input
              v-model="form.phone"
              type="tel"
              class="form-control custom-input"
              placeholder="08X-XXX-XXXX"
              :disabled="loading"
            />
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold text-secondary small mb-1">รหัสผ่าน <span class="text-danger">*</span></label>
            <input
              v-model="form.password"
              type="password"
              class="form-control custom-input"
              placeholder="กำหนดรหัสผ่าน"
              required
              :disabled="loading"
            />
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold text-secondary small mb-1">ยืนยันรหัสผ่าน <span class="text-danger">*</span></label>
            <input
              v-model="form.confirmPassword"
              type="password"
              class="form-control custom-input"
              placeholder="ระบุรหัสผ่านอีกครั้ง"
              required
              :disabled="loading"
            />
          </div>

        </div>

        <button type="submit" class="btn btn-shop w-100 py-2.5 fw-bold shadow-sm mt-4" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <span>{{ loading ? 'กำลังบันทึกข้อมูล...' : 'สมัครสมาชิก' }}</span>
        </button>
      </form>

      <!-- Footer Link -->
      <div class="text-center mt-4 pt-3 border-top">
        <p class="small text-muted mb-0">
          มีบัญชีผู้ใช้อยู่แล้ว? 
          <RouterLink to="/" class="text-green fw-bold text-decoration-none">เข้าสู่ระบบ</RouterLink>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const form = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  full_name: "",
  phone: ""
});

const message = ref("");
const error = ref("");
const loading = ref(false);

const register = async () => {
  message.value = "";
  error.value = "";

  if (form.value.password !== form.value.confirmPassword) {
    error.value = "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน";
    return;
  }

  loading.value = true;

  try {
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: form.value.username,
        email: form.value.email,
        password: form.value.password,
        full_name: form.value.full_name,
        phone: form.value.phone
      })
    });

    const data = await response.json();

    if (!response.ok) {
      error.value = data.message || "ไม่สามารถสมัครสมาชิกได้";
      return;
    }

    message.value = "สมัครสมาชิกสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...";

    setTimeout(() => {
      router.push("/");
    }, 1200);

  } catch (err) {
    console.error(err);
    error.value = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-section {
  background: linear-gradient(135deg, #f4fbf7 0%, #ffffff 50%, #edf8f1 100%);
  min-height: calc(100vh - 80px);
}

.register-card {
  width: 100%;
  max-width: 580px;
  border: 1px solid #e2ece5 !important;
}

.brand-badge {
  background: #eaf5ee;
  color: #397452;
  font-size: 12px;
  letter-spacing: 0.8px;
}

.text-dark-green { color: #1e2923; }
.text-green { color: #397452; }

.custom-input {
  border-radius: 12px;
  padding: 10px 14px;
  border: 1px solid #dce6e0;
  background-color: #f9fbf9;
  font-size: 14.5px;
  transition: all 0.2s ease;
}

.custom-input:focus {
  background-color: #ffffff;
  border-color: #4c956c;
  box-shadow: 0 0 0 0.25rem rgba(76, 149, 108, 0.15);
}

.btn-shop {
  background: #4c956c;
  color: white;
  border-radius: 12px;
  padding: 12px;
  font-size: 15px;
  border: none;
  transition: all 0.2s ease;
}

.btn-shop:hover:not(:disabled) {
  background: #397452;
  transform: translateY(-1px);
}

.btn-shop:disabled {
  background: #8fbca1;
  cursor: not-allowed;
}
</style>