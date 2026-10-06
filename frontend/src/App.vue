<template>
  <div class="app-shell">
    <Navbar />
    <router-view />
  </div>
</template>

<script setup>
import Navbar from "./components/Navbar.vue";
</script>

<style>
:root {
  color: #25352e;
  background: #f7f8f5;
  font-family: "Avenir Next", Avenir, sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

body {
  min-width: 320px;
  margin: 0;
  background: #f7f8f5;
  color: #25352e;
}

.app-shell {
  min-height: 100vh;
}
</style>