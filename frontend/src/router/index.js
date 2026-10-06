import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ProductsView from "../views/ProductsView.vue";
import ContactView from "../views/ContactView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import CartView from "../views/CartView.vue";
import AdminView from "../views/AdminView.vue";
import AuthView from "../views/AuthView.vue";
import { authState, isAdmin } from "../services/auth.js";

const routes = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/products", name: "Products", component: ProductsView },
  { path: "/contact", name: "Contact", component: ContactView },
  { path: "/login", name: "Login", component: LoginView },
  { path: "/register", name: "Register", component: RegisterView },
  { path: "/forgot-password", name: "forgot-password", component: AuthView },
  { path: "/reset-password", name: "reset-password", component: AuthView },
  {
    path: "/cart",
    name: "Cart",
    component: CartView,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin",
    name: "Admin",
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard ตรวจสอบสิทธิ์การเข้าถึง
router.beforeEach((to, from, next) => {
  const isLoggedIn = !!authState.user;

  if (to.meta.requiresAuth && !isLoggedIn) {
    alert("กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้");
    return next({ name: "Login" });
  }

  if (to.meta.requiresAdmin && !isAdmin()) {
    alert("คุณไม่มีสิทธิ์เข้าถึงหน้าระบบจัดการหลังบ้าน ( Admin เท่านั้น)");
    return next({ name: "Products" });
  }

  next();
});

export default router;