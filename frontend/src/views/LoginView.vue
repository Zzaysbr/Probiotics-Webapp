<template>
  <div class="auth-section d-flex align-items-center justify-content-center min-vh-100 py-5">
    <div class="auth-card p-4 p-md-5 shadow-lg rounded-4 bg-white border-0">
      
      <!-- Brand Header -->
      <div class="text-center mb-4">
        <div class="brand-badge d-inline-block px-3 py-1 rounded-pill mb-2 fw-bold text-uppercase">
          🌿 Probiotic Shop
        </div>
        <h2 class="fw-bold text-dark-green fs-3 mb-1">ยินดีต้อนรับกลับมา</h2>
        <p class="text-muted small">เข้าสู่ระบบเพื่อจัดการคำสั่งซื้อและบัญชีของคุณ</p>
      </div>

      <!-- Alert Message -->
      <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show rounded-3 small py-2 mb-3" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
        <button type="button" class="btn-close py-2" @click="errorMessage = ''"></button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label fw-semibold text-secondary small">ชื่อผู้ใช้ หรือ อีเมล</label>
          <div class="input-group">
            <input
              v-model="form.username"
              type="text"
              class="form-control custom-input"
              placeholder="ระบุ username หรือ email"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label fw-semibold text-secondary small">รหัสผ่าน</label>
          <input
            v-model="form.password"
            type="password"
            class="form-control custom-input"
            placeholder="ระบุรหัสผ่าน"
            required
            :disabled="loading"
          />
        </div>

        <button type="submit" class="btn btn-shop w-100 py-2.5 fw-bold shadow-sm" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <span>{{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}</span>
        </button>
      </form>

      <!-- Footer Link -->
      <div class="text-center mt-4 pt-3 border-top">
        <p class="small text-muted mb-0">
          ยังไม่มีบัญชีสมาชิก? 
          <RouterLink to="/register" class="text-green fw-bold text-decoration-none">สมัครสมาชิก</RouterLink>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { saveSession } from '../services/auth';

const router = useRouter();
const form = ref({ username: '', password: '' });
const loading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    
    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);

      saveSession({
        token: data.token,
        user: data.user
      });

      const role = String(data.user?.role || '').toLowerCase();
      if (role === 'admin' || data.user?.isAdmin) {
        await router.push('/admin');
      } else {
        await router.push('/products');
      }
    } else {
      errorMessage.value = data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
    }
  } catch (err) {
    console.error('Login Error:', err);
    errorMessage.value = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-section {
  background: linear-gradient(135deg, #f4fbf7 0%, #ffffff 50%, #edf8f1 100%);
  min-height: calc(100vh - 80px);
}

.auth-card {
  width: 100%;
  max-width: 420px;
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
  padding: 11px 16px;
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