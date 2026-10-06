<template>
  <main class="container auth-wrap py-5">
    <section class="auth-panel mx-auto">
      <p class="eyebrow mb-2">PROBIOTIC SHOP</p>
      <h1 class="h2 fw-semibold mb-2">{{ heading }}</h1>
      <p class="text-secondary mb-4">{{ intro }}</p>

      <div v-if="notice" class="alert alert-success" role="status">{{ notice }}</div>
      <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

      <form v-if="mode === 'login'" @submit.prevent="login">
        <div class="mb-3">
          <label class="form-label" for="login-username">Username หรือ Email</label>
          <input id="login-username" v-model.trim="loginForm.username" class="form-control" autocomplete="username" required>
        </div>
        <div class="mb-3">
          <label class="form-label" for="login-password">Password</label>
          <input id="login-password" v-model="loginForm.password" class="form-control" type="password" autocomplete="current-password" required>
        </div>
        <button class="btn btn-success w-100 mt-2" type="submit" :disabled="busy">
          {{ busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ" }}
        </button>
        <div class="auth-links mt-3">
          <RouterLink to="/register">สมัครสมาชิก</RouterLink>
          <RouterLink to="/forgot-password">ลืมรหัสผ่าน?</RouterLink>
        </div>
      </form>

      <form v-else-if="mode === 'register'" @submit.prevent="register">
        <div class="row g-3">
          <div class="col-sm-6">
            <label class="form-label" for="register-name">ชื่อ-นามสกุล</label>
            <input id="register-name" v-model.trim="registerForm.full_name" class="form-control" autocomplete="name" required>
          </div>
          <div class="col-sm-6">
            <label class="form-label" for="register-phone">เบอร์โทรศัพท์</label>
            <input id="register-phone" v-model.trim="registerForm.phone" class="form-control" autocomplete="tel" inputmode="tel">
          </div>
          <div class="col-sm-6">
            <label class="form-label" for="register-username">Username</label>
            <input id="register-username" v-model.trim="registerForm.username" class="form-control" autocomplete="username" required>
          </div>
          <div class="col-sm-6">
            <label class="form-label" for="register-email">Email</label>
            <input id="register-email" v-model.trim="registerForm.email" class="form-control" type="email" autocomplete="email" required>
          </div>
          <div class="col-12">
            <label class="form-label" for="register-password">Password</label>
            <input id="register-password" v-model="registerForm.password" class="form-control" type="password" autocomplete="new-password" minlength="8" required>
            <div class="form-text">อย่างน้อย 8 ตัว มี A-Z, a-z, ตัวเลข และอักขระพิเศษ</div>
          </div>
        </div>
        <button class="btn btn-success w-100 mt-4" type="submit" :disabled="busy">
          {{ busy ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก" }}
        </button>
        <p class="text-center small mt-3 mb-0">เป็นสมาชิกแล้ว? <RouterLink to="/login">เข้าสู่ระบบ</RouterLink></p>
      </form>

      <form v-else-if="mode === 'forgot'" @submit.prevent="forgotPassword">
        <div class="mb-3">
          <label class="form-label" for="forgot-email">Email ที่ลงทะเบียนไว้</label>
          <input id="forgot-email" v-model.trim="email" class="form-control" type="email" autocomplete="email" required>
        </div>
        <button class="btn btn-success w-100" type="submit" :disabled="busy">
          {{ busy ? "กำลังส่งคำขอ..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน" }}
        </button>
        <p class="text-center small mt-3 mb-0"><RouterLink to="/login">กลับไปเข้าสู่ระบบ</RouterLink></p>
      </form>

      <form v-else @submit.prevent="resetPassword">
        <div class="mb-3">
          <label class="form-label" for="reset-email">Email</label>
          <input id="reset-email" v-model.trim="email" class="form-control" type="email" autocomplete="email" required>
        </div>
        <div class="mb-3">
          <label class="form-label" for="reset-token">รหัสยืนยันจากอีเมล</label>
          <input id="reset-token" v-model.trim="resetToken" class="form-control" autocomplete="one-time-code" required>
        </div>
        <div class="mb-3">
          <label class="form-label" for="reset-password">Password ใหม่</label>
          <input id="reset-password" v-model="newPassword" class="form-control" type="password" autocomplete="new-password" minlength="8" required>
          <div class="form-text">อย่างน้อย 8 ตัว มี A-Z, a-z, ตัวเลข และอักขระพิเศษ</div>
        </div>
        <button class="btn btn-success w-100" type="submit" :disabled="busy || !resetToken">
          {{ busy ? "กำลังเปลี่ยนรหัสผ่าน..." : "ตั้ง Password ใหม่" }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";
import { saveSession } from "../services/auth";

const route = useRoute();
const router = useRouter();
const mode = computed(() => ({
  login: "login",
  register: "register",
  "forgot-password": "forgot",
  "reset-password": "reset",
}[route.name] || "login"));
const heading = computed(() => ({
  login: "ยินดีต้อนรับกลับ",
  register: "สมัครสมาชิก",
  forgot: "ลืมรหัสผ่าน",
  reset: "ตั้งรหัสผ่านใหม่",
}[mode.value]));
const intro = computed(() => ({
  login: "เข้าสู่ระบบเพื่อเลือกชมสินค้า",
  register: "สร้างบัญชีเพื่อเริ่มเลือกชมสินค้า",
  forgot: "เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลที่ลงทะเบียน",
  reset: "กรอกข้อมูลจากลิงก์รีเซ็ตที่ได้รับทางอีเมล",
}[mode.value]));
const loginForm = reactive({ username: "", password: "" });
const registerForm = reactive({ full_name: "", phone: "", username: "", email: "", password: "" });
const email = ref("");
const resetToken = ref("");
const newPassword = ref("");
const notice = ref("");
const error = ref("");
const busy = ref(false);

watch(() => route.fullPath, () => {
  notice.value = "";
  error.value = "";
  email.value = typeof route.query.email === "string" ? route.query.email : "";
  resetToken.value = typeof route.query.token === "string" ? route.query.token : "";
});

function showError(requestError) {
  error.value = requestError.response?.data?.message || "เชื่อมต่อระบบไม่สำเร็จ กรุณาลองอีกครั้ง";
}

async function login() {
  busy.value = true;
  error.value = "";
  try {
    const { data } = await api.post("/auth/login", loginForm);
    saveSession(data);
    const destination = typeof route.query.redirect === "string" && route.query.redirect.startsWith("/")
      ? route.query.redirect
      : "/products";
    await router.replace(destination);
  } catch (requestError) {
    showError(requestError);
  } finally {
    busy.value = false;
  }
}

async function register() {
  busy.value = true;
  error.value = "";
  try {
    await api.post("/auth/register", registerForm);
    notice.value = "สมัครสมาชิกสำเร็จ เข้าสู่ระบบด้วย Username และ Password ได้เลย";
    await router.replace({ name: "login" });
    notice.value = "สมัครสมาชิกสำเร็จ เข้าสู่ระบบด้วย Username และ Password ได้เลย";
  } catch (requestError) {
    showError(requestError);
  } finally {
    busy.value = false;
  }
}

async function forgotPassword() {
  busy.value = true;
  error.value = "";
  try {
    const { data } = await api.post("/auth/forgot-password", { email: email.value });
    notice.value = data.message;
  } catch (requestError) {
    showError(requestError);
  } finally {
    busy.value = false;
  }
}

async function resetPassword() {
  busy.value = true;
  error.value = "";
  try {
    const { data } = await api.post("/auth/reset-password", {
      email: email.value,
      token: resetToken.value,
      newPassword: newPassword.value,
    });
    await router.replace({ name: "login" });
    notice.value = data.message;
  } catch (requestError) {
    showError(requestError);
  } finally {
    busy.value = false;
  }
}
</script>