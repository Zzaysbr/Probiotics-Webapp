<template>
  <main class="container home-content py-5">
    <section class="home-intro">
      <p class="eyebrow mb-3">PROBIOTIC SHOP</p>
      <h1 class="display-5 fw-semibold">ดูแลสมดุลสุขภาพ<br>เริ่มได้จากทุกวัน</h1>
      <p class="lead text-secondary mt-3">ร้านจำหน่ายผลิตภัณฑ์โปรไบโอติกออนไลน์</p>
      <RouterLink class="btn btn-success mt-3" :to="user ? '/products' : '/register'">
        {{ user ? "เลือกชมสินค้า" : "สมัครสมาชิกเพื่อเลือกชมสินค้า" }}
      </RouterLink>
      <p v-if="!user" class="small text-secondary mt-3 mb-0">
        เป็นสมาชิกแล้ว? <RouterLink to="/login">เข้าสู่ระบบ</RouterLink>
      </p>
    </div>
  </main>
</template>

<script setup>
import { computed } from "vue";
import { authState } from "../services/auth";

const user = computed(() => authState.user);
</script>