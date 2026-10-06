<template>
  <nav class="navbar navbar-expand-lg shop-nav">
    <div class="container">
      <!-- โลโก้ร้าน -->
      <RouterLink class="navbar-brand" to="/">
        <span class="brand-mark" aria-hidden="true">P</span>
        <span>PROBIOTIC SHOP</span>
      </RouterLink>

      <!-- ปุ่ม Hamburger สำหรับหน้าจอขนาดเล็ก -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- เมนู Navbar -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-lg-center gap-2">
          
          <!-- 1. เมนูสาธารณะ -->
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">หน้าแรก</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/products">สินค้าทั้งหมด</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/contact">ติดต่อเรา</RouterLink>
          </li>

          <!-- 2. เมนูเฉพาะ ADMIN -->
          <li v-if="user && role === 'admin'" class="nav-item">
            <RouterLink class="nav-link nav-admin-link" to="/admin">
              ⚙️ จัดการระบบ (Admin)
            </RouterLink>
          </li>

          <!-- 3. เมนูเมื่อเข้าสู่ระบบแล้ว -->
          <li v-if="user" class="nav-item">
            <RouterLink class="nav-link nav-cart-link" to="/cart">
              🛒 ตะกร้าสินค้า
            </RouterLink>
          </li>

          <li v-if="user" class="nav-item ms-lg-2">
            <span class="user-badge">
              <small class="role-tag" :class="role === 'admin' ? 'bg-admin' : 'bg-user'">
                {{ role === 'admin' ? 'ADMIN' : 'MEMBER' }}
              </small>
              {{ user.full_name || user.username || user.name || 'ผู้ใช้งาน' }}
            </span>
          </li>

          <li v-if="user" class="nav-item">
            <button class="btn btn-logout ms-lg-2" type="button" @click="logout">
              ออกจากระบบ
            </button>
          </li>

          <!-- 4. เมนูเมื่อยังไม่ได้เข้าสู่ระบบ -->
          <li v-if="!user" class="nav-item">
            <RouterLink class="nav-link" to="/login">เข้าสู่ระบบ</RouterLink>
          </li>
          <li v-if="!user" class="nav-item">
            <RouterLink class="btn btn-shop ms-lg-2" to="/register">
              สมัครสมาชิก
            </RouterLink>
          </li>

        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { authState, clearSession } from "../services/auth";

const router = useRouter();

// ดึงข้อมูลผู้ใช้จาก authState
const user = computed(() => authState.user);

// ตรวจสอบ Role ของผู้ใช้ (รองรับทั้งจาก authState และ localStorage)
const role = computed(() => {
  const currentUser = authState.user;
  if (currentUser && currentUser.role) {
    return String(currentUser.role).toLowerCase();
  }
  
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    try {
      const parsed = JSON.parse(savedUser);
      return parsed.role ? String(parsed.role).toLowerCase() : "customer";
    } catch (e) {
      return "customer";
    }
  }
  return "customer";
});

function logout() {
  clearSession();
  router.push("/login");
}
</script>

<style scoped>
.shop-nav {
  background-color: #ffffff;
  border-bottom: 1px solid #e6ece8;
  padding: 12px 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  color: #202a24;
  font-size: 18px;
  text-decoration: none;
}

.brand-mark {
  background: #4c956c;
  color: white;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.nav-link {
  color: #56645b;
  font-weight: 600;
  font-size: 15px;
  padding: 8px 14px !important;
  border-radius: 8px;
  transition: all 0.2s ease;
  text-decoration: none;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #397452;
  background-color: #edf8f1;
}

.nav-admin-link {
  color: #d97706;
  font-weight: 700;
}

.nav-admin-link:hover,
.nav-admin-link.router-link-active {
  background-color: #fef3c7;
  color: #b45309;
}

.nav-cart-link {
  color: #2563eb;
  font-weight: 600;
}

.nav-cart-link:hover,
.nav-cart-link.router-link-active {
  background-color: #eff6ff;
  color: #1d4ed8;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f4fbf7;
  border: 1px solid #d8efdf;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  color: #202a24;
}

.role-tag {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  color: white;
  text-transform: uppercase;
}

.bg-admin {
  background-color: #d97706;
}

.bg-user {
  background-color: #4c956c;
}

.btn-shop {
  background: #4c956c;
  color: white !important;
  border-radius: 10px;
  padding: 8px 18px;
  font-weight: 600;
  border: none;
  text-decoration: none;
}

.btn-shop:hover {
  background: #397452;
}

.btn-logout {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #e53e3e;
  border-radius: 10px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #fff5f5;
  border-color: #feb2b2;
}
</style>