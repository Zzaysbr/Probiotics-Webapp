<template>
  <main class="container auth-wrap py-5">
    <section class="auth-panel mx-auto">
      <p class="eyebrow mb-2">PROBIOTIC SHOP</p>
      <h1 class="h2 fw-semibold mb-2">{{ heading }}</h1>
      <p class="text-secondary mb-4">{{ intro }}</p>

      <div v-if="notice" class="alert alert-success" role="status">
        {{ notice }}
      </div>
      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <form v-if="mode === 'login'" @submit.prevent="login">
        <div class="mb-3">
          <label class="form-label" for="login-username"
            >ชื่อผู้ใช้หรืออีเมล</label
          >
          <input
            id="login-username"
            v-model.trim="loginForm.username"
            class="form-control"
            autocomplete="username"
            required
          />
        </div>
        <div class="mb-3">
          <label class="form-label" for="login-password">รหัสผ่าน</label>
          <PasswordInput
            id="login-password"
            v-model="loginForm.password"
            class="form-control"
            autocomplete="current-password"
            required
            :disabled="busy"
          />
        </div>
        <button
          class="btn btn-success w-100 mt-2"
          type="submit"
          :disabled="busy"
        >
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
            <input
              id="register-name"
              v-model.trim="registerForm.full_name"
              class="form-control"
              autocomplete="name"
              required
            />
          </div>
          <div class="col-sm-6">
            <label class="form-label" for="register-phone">เบอร์โทรศัพท์</label>
            <input
              id="register-phone"
              v-model.trim="registerForm.phone"
              class="form-control"
              autocomplete="tel"
              inputmode="tel"
            />
          </div>
          <div class="col-sm-6">
            <label class="form-label" for="register-username">ชื่อผู้ใช้</label>
            <input
              id="register-username"
              v-model.trim="registerForm.username"
              class="form-control"
              autocomplete="username"
              required
            />
            <p class="form-text">
              ใช้ภาษาอังกฤษ ตัวเลข จุด (.) ขีดล่าง (_) หรือขีดกลาง (-) จำนวน
              3–50 ตัว ห้ามมี @
            </p>
          </div>
          <div class="col-sm-6">
            <label class="form-label" for="register-email">อีเมล</label>
            <input
              id="register-email"
              v-model.trim="registerForm.email"
              class="form-control"
              type="email"
              autocomplete="email"
              required
            />
          </div>
          <div class="col-12">
            <label class="form-label" for="register-password">รหัสผ่าน</label>
            <PasswordInput
              id="register-password"
              aria-describedby="register-rules"
              v-model="registerForm.password"
              class="form-control"
              autocomplete="new-password"
              minlength="8"
              required
              :disabled="busy"
            />
            <PasswordRules
              id="register-rules"
              :password="registerForm.password"
            />
          </div>
        </div>
        <label for="confirm-password" class="form-label mt-3"
          >ยืนยันรหัสผ่าน</label
        >
        <PasswordInput
          id="confirm-password"
          label="รหัสผ่านยืนยัน"
          v-model="confirmPassword"
          class="form-control"
          autocomplete="new-password"
          required
          :disabled="busy"
        />
        <button
          class="btn btn-success w-100 mt-4"
          type="submit"
          :disabled="busy"
        >
          {{ busy ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก" }}
        </button>
        <p class="text-center small mt-3 mb-0">
          เป็นสมาชิกแล้ว? <RouterLink to="/login">เข้าสู่ระบบ</RouterLink>
        </p>
      </form>

      <form v-else-if="mode === 'forgot'" @submit.prevent="forgotPassword">
        <div class="mb-3">
          <label class="form-label" for="forgot-email"
            >อีเมลที่ลงทะเบียนไว้</label
          >
          <input
            id="forgot-email"
            v-model.trim="email"
            class="form-control"
            type="email"
            autocomplete="email"
            required
          />
        </div>
        <button class="btn btn-success w-100" type="submit" :disabled="busy">
          {{ busy ? "กำลังส่งคำขอ..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน" }}
        </button>
        <p class="text-center small mt-3 mb-0">
          <RouterLink to="/login">กลับไปเข้าสู่ระบบ</RouterLink>
        </p>
      </form>

      <form v-else @submit.prevent="resetPassword">
        <div class="mb-3">
          <label class="form-label" for="reset-email">อีเมล</label>
          <input
            id="reset-email"
            v-model.trim="email"
            class="form-control"
            type="email"
            autocomplete="email"
            :readonly="Boolean(route.query.email)"
            required
          />
        </div>
        <div v-if="!tokenFromLink" class="mb-3">
          <label class="form-label" for="reset-token">รหัสยืนยันจากอีเมล</label>
          <input
            id="reset-token"
            v-model.trim="resetToken"
            class="form-control"
            autocomplete="one-time-code"
            required
          />
        </div>
        <p v-else class="form-text">
          ระบบกรอกรหัสยืนยันจากลิงก์อีเมลให้แล้ว
          คุณสามารถตั้งรหัสผ่านใหม่ด้านล่างได้เลย
        </p>
        <div class="mb-3">
          <label class="form-label" for="reset-password">รหัสผ่านใหม่</label>
          <PasswordInput
            id="reset-password"
            aria-describedby="reset-rules"
            label="รหัสผ่านใหม่"
            v-model="newPassword"
            class="form-control"
            autocomplete="new-password"
            minlength="8"
            required
            :disabled="busy"
          />
          <PasswordRules id="reset-rules" :password="newPassword" />
        </div>
        <div class="mb-3">
          <label class="form-label" for="reset-confirm"
            >ยืนยันรหัสผ่านใหม่</label
          >
          <PasswordInput
            id="reset-confirm"
            v-model="resetConfirm"
            label="ยืนยันรหัสผ่านใหม่"
            autocomplete="new-password"
            required
            :disabled="busy"
          />
          <p class="form-text">
            กรอกรหัสผ่านใหม่อีกครั้งให้ตรงกัน เพื่อป้องกันการพิมพ์ผิด
          </p>
        </div>
        <button
          class="btn btn-success w-100"
          type="submit"
          :disabled="busy || !resetToken"
        >
          {{ busy ? "กำลังเปลี่ยนรหัสผ่าน..." : "ตั้งรหัสผ่านใหม่" }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import PasswordInput from "../components/PasswordInput.vue";
import PasswordRules from "../components/PasswordRules.vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";
import { saveSession } from "../services/auth";

const route = useRoute();
const router = useRouter();
const tokenFromLink = computed(
  () =>
    typeof route.query.token === "string" &&
    /^[a-f0-9]{64}$/.test(route.query.token),
);
const mode = computed(
  () =>
    ({
      login: "login",
      register: "register",
      "forgot-password": "forgot",
      "reset-password": "reset",
    })[route.name] || "login",
);
const heading = computed(
  () =>
    ({
      login: "ยินดีต้อนรับกลับ",
      register: "สมัครสมาชิก",
      forgot: "ลืมรหัสผ่าน",
      reset: "ตั้งรหัสผ่านใหม่",
    })[mode.value],
);
const intro = computed(
  () =>
    ({
      login: "เข้าสู่ระบบเพื่อเลือกชมสินค้า",
      register: "สร้างบัญชีเพื่อเริ่มเลือกชมสินค้า",
      forgot: "เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลที่ลงทะเบียน",
      reset: "ตั้งรหัสผ่านตามเงื่อนไขด้านล่าง แล้วกรอกซ้ำอีกครั้งเพื่อยืนยัน",
    })[mode.value],
);
const confirmPassword = ref("");
const loginForm = reactive({ username: "", password: "" });
const registerForm = reactive({
  full_name: "",
  phone: "",
  username: "",
  email: "",
  password: "",
});
const email = ref("");
const resetToken = ref("");
const newPassword = ref("");
const resetConfirm = ref("");
const notice = ref("");
const error = ref("");
const busy = ref(false);

watch(
  () => route.fullPath,
  () => {
    notice.value =
      route.query.reset === "success"
        ? "เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่"
        : "";
    error.value = "";
    newPassword.value = "";
    resetConfirm.value = "";
    email.value =
      typeof route.query.email === "string" ? route.query.email : "";
    resetToken.value =
      typeof route.query.token === "string" ? route.query.token : "";
  },
  { immediate: true },
);

function showError(requestError) {
  error.value =
    requestError.response?.data?.message ||
    (requestError.code === "ECONNABORTED"
      ? "ระบบใช้เวลาตอบกลับนาน กรุณาตรวจกล่องจดหมายและสแปมก่อนลองใหม่อีกครั้ง"
      : "เชื่อมต่อระบบไม่สำเร็จ กรุณาตรวจว่าเปิด backend แล้วและลองอีกครั้ง");
}

async function login() {
  busy.value = true;
  error.value = "";
  try {
    const { data } = await api.post("/auth/login", loginForm);
    saveSession(data);
    const destination =
      typeof route.query.redirect === "string" &&
      route.query.redirect.startsWith("/") &&
      !route.query.redirect.startsWith("//")
        ? route.query.redirect
        : data.user?.role === "admin"
          ? "/admin"
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
    if (registerForm.password !== confirmPassword.value) {
      error.value = "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน";
      return;
    }
    await api.post("/auth/register", registerForm);
    notice.value =
      "สมัครสมาชิกสำเร็จ เข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านได้เลย";
    await router.replace({ name: "login" });
    notice.value =
      "สมัครสมาชิกสำเร็จ เข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านได้เลย";
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
    const { data } = await api.post(
      "/auth/forgot-password",
      { email: email.value },
      { timeout: 35000 },
    );
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
    if (newPassword.value !== resetConfirm.value) {
      error.value = "รหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ต้องตรงกัน";
      return;
    }
    const { data } = await api.post("/auth/reset-password", {
      email: email.value,
      token: resetToken.value,
      newPassword: newPassword.value,
    });
    await router.replace({ name: "login", query: { reset: "success" } });
  } catch (requestError) {
    showError(requestError);
  } finally {
    busy.value = false;
  }
}
</script>
