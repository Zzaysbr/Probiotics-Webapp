<template>
  <nav class="navbar navbar-expand-lg custom-navbar">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold" to="/">
        🌿 PROBIOTIC SHOP
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="เปิดเมนู"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-lg-center">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">
              Home
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/contact">
              Contact
            </RouterLink>
          </li>

          <li v-if="user" class="nav-item">
            <RouterLink class="nav-link" to="/products">
              Products
            </RouterLink>
          </li>

          <li v-if="user" class="nav-item nav-user">
            {{ user.full_name || user.username }}
          </li>

          <li v-if="user" class="nav-item ms-lg-2">
            <button
              class="btn logout-btn"
              type="button"
              @click="logout"
            >
              ออกจากระบบ
            </button>
          </li>

          <template v-else>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/register">
                สมัครสมาชิก
              </RouterLink>
            </li>

            <li class="nav-item ms-lg-2">
              <RouterLink class="btn login-btn" to="/login">
                Login
              </RouterLink>
            </li>
          </template>
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
  router.push("/");
}
</script>

<style scoped>
.custom-navbar {
  position: relative;
  z-index: 1000;
  width: 100%;
  background: #ffffff;
  border-bottom: 1px solid #edf1ee;
  padding: 14px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.navbar-brand {
  color: #26382d;
  font-size: 20px;
  font-weight: 800;
  text-decoration: none;
}

.nav-link {
  color: #59665d;
  margin: 0 8px;
  font-weight: 500;
}

.nav-link:hover,
.router-link-active {
  color: #4c956c;
}

.nav-user {
  margin: 0 10px;
  color: #397452;
  font-weight: 700;
  white-space: nowrap;
}

.login-btn {
  background: #4c956c;
  color: #ffffff;
  padding: 8px 22px;
  border-radius: 9px;
}

.login-btn:hover {
  background: #397452;
  color: #ffffff;
}

.logout-btn {
  border: 1px solid #4c956c;
  color: #397452;
  background: #ffffff;
  padding: 8px 18px;
  border-radius: 9px;
}

.logout-btn:hover {
  background: #4c956c;
  color: #ffffff;
}

@media (max-width: 991.98px) {
  .navbar-collapse {
    padding-top: 14px;
  }

  .nav-user {
    margin: 8px 8px;
  }

  .login-btn,
  .logout-btn {
    display: inline-block;
    margin-top: 8px;
  }
}
</style>
