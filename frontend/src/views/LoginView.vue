<template>
  <div>
    <Navbar />
    <div class="auth-section d-flex align-items-center justify-content-center">
      <div class="auth-card">
        <div class="text-center mb-4">
          <div class="brand-badge mb-2">🌿 PROBIOTIC SHOP</div>
          <h2 class="fw-bold text-dark-green">ยินดีต้อนรับกลับมา</h2>
          <p class="text-muted small">เข้าสู่ระบบเพื่อจัดการคำสั่งซื้อของคุณ</p>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label class="form-label fw-bold text-secondary small">ชื่อผู้ใช้ หรือ อีเมล</label>
            <input v-model="form.username" type="text" class="form-control custom-input" placeholder="ระบุ username หรือ email" required />
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold text-secondary small">รหัสผ่าน</label>
            <input v-model="form.password" type="password" class="form-control custom-input" placeholder="ระบุรหัสผ่าน" required />
          </div>

          <button type="submit" class="btn btn-shop w-100 py-2.5 fw-bold mt-2">
            เข้าสู่ระบบ
          </button>
        </form>

        <div class="text-center mt-4 pt-3 border-top">
          <p class="small text-muted mb-0">
            ยังไม่มีบัญชีสมาชิก? 
            <RouterLink to="/register" class="text-green fw-bold text-decoration-none">สมัครสมาชิก</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';

const router = useRouter();
const form = ref({ username: '', password: '' });

const handleLogin = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      alert('เข้าสู่ระบบสำเร็จ');
      router.push('/products');
    } else {
      alert(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
  }
};
</script>

<style scoped>
.auth-section {
  min-height: calc(100vh - 80px);
  background: linear-gradient(135deg, #f4fbf7 0%, #ffffff 55%, #edf8f1 100%);
  padding: 40px 20px;
}
.auth-card {
  background: white;
  padding: 40px;
  border-radius: 28px;
  box-shadow: 0 18px 45px rgba(59, 94, 70, 0.08);
  border: 1px solid #e6ece8;
  width: 100%;
  max-width: 440px;
}
.brand-badge {
  color: #397452;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 1px;
}
.text-dark-green { color: #202a24; }
.text-green { color: #4c956c; }
.custom-input {
  border-radius: 12px;
  padding: 12px 15px;
  border: 1px solid #e6ece8;
  background-color: #f8faf8;
}
.custom-input:focus {
  background-color: #fff;
  border-color: #4c956c;
  box-shadow: 0 0 0 0.2rem rgba(76, 149, 108, 0.15);
}
.btn-shop {
  background: #4c956c;
  color: white;
  border-radius: 12px;
  padding: 12px;
  font-weight: 600;
  border: none;
  transition: all 0.2s ease;
}
.btn-shop:hover {
  background: #397452;
}
</style>