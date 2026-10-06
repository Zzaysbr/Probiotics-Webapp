<template>
  <div class="app-shell">
    <Navbar />
    <router-view />
  </div>
</template>

<script setup>
import Navbar from "./components/Navbar.vue";
</script>