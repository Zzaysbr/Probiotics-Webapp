<template>
  <div class="app-shell">
    <a href="#main-content" class="skip-link">ข้ามไปเนื้อหาหลัก</a>
    <Navbar />
    <div id="main-content" tabindex="-1"><router-view /></div>
  </div>
</template>

<script setup>
import Navbar from "./components/Navbar.vue";
</script>
