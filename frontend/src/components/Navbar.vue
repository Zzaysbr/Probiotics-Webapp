<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { authState, isAdmin, clearSession } from "../services/auth";
import { cartItems } from "../services/cart";
const open = ref(false),
  router = useRouter(),
  count = computed(() => cartItems.value.reduce((s, p) => s + p.quantity, 0));
router.afterEach(() => {
  open.value = false;
});
function logout() {
  clearSession();
  router.push("/login");
}
</script>
<template>
  <nav class="navbar navbar-expand-xl shop-nav">
    <div class="container">
      <RouterLink class="navbar-brand" to="/"
        ><span class="brand-mark">P</span> PROBIOTIC SHOP</RouterLink
      ><button
        class="navbar-toggler"
        type="button"
        :aria-expanded="open"
        aria-controls="shop-menu"
        aria-label="เปิดปิดเมนู"
        @click="open = !open"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div
        id="shop-menu"
        class="collapse navbar-collapse"
        :class="{ show: open }"
      >
        <ul class="navbar-nav ms-auto align-items-xl-center">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">หน้าแรก</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/products">สินค้า</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/contact">ติดต่อ</RouterLink>
          </li>
          <template v-if="authState.user"
            ><li class="nav-item">
              <RouterLink class="nav-link" to="/cart"
                >ตะกร้า ({{ count }})</RouterLink
              >
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/orders">คำสั่งซื้อ</RouterLink>
            </li>
            <template v-if="isAdmin()"
              ><li class="nav-item">
                <RouterLink class="nav-link" to="/admin"
                  >จัดการสินค้า</RouterLink
                >
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" to="/admin/payments"
                  >ตรวจชำระ</RouterLink
                >
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" to="/admin/dashboard"
                  >Dashboard</RouterLink
                >
              </li></template
            >
            <li class="nav-item">
              <RouterLink
                class="nav-link profile-link"
                to="/profile"
                aria-label="ดูโปรไฟล์ของฉัน"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                </svg>
                {{ authState.user.username }}
              </RouterLink>
            </li>
            <li class="nav-item">
              <button class="btn btn-sm btn-outline-success" @click="logout">
                ออกจากระบบ
              </button>
            </li></template
          ><template v-else
            ><li class="nav-item">
              <RouterLink class="nav-link" to="/login">เข้าสู่ระบบ</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="btn btn-success" to="/register"
                >สมัครสมาชิก</RouterLink
              >
            </li></template
          >
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.profile-link {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #5e456d;
}
.profile-link.router-link-active {
  font-weight: 600;
}
</style>
