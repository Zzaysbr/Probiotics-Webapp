<template>
  <nav class="navbar navbar-expand-lg shop-nav">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">
        <span class="brand-mark" aria-hidden="true">P</span>
        <span>PROBIOTIC SHOP</span>
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-label="เปิดเมนู"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">Home</RouterLink>
          </li>

          <li v-if="user" class="nav-item"><RouterLink class="nav-link" to="/products">สินค้า</RouterLink></li>
          <li v-if="user" class="nav-item nav-user">{{ user.full_name || user.username }}</li>
          <li v-if="user" class="nav-item"><button class="nav-link nav-action" type="button" @click="logout">ออกจากระบบ</button></li>
          <li v-else class="nav-item"><RouterLink class="nav-link" to="/login">เข้าสู่ระบบ</RouterLink></li>
          <li v-if="!user" class="nav-item"><RouterLink class="nav-link" to="/register">สมัครสมาชิก</RouterLink></li>
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
const user = computed(() => authState.user);

function logout() {
  clearSession();
  router.push({ name: "home" });
}
</script>