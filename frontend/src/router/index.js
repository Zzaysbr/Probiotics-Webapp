import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/HomeView.vue";
import Contact from "../views/ContactView.vue";
import Auth from "../views/AuthView.vue";
import Products from "../views/ProductsView.vue";
import Cart from "../views/CartView.vue";
import Admin from "../views/AdminView.vue";
import Orders from "../views/OrdersView.vue";
import Order from "../views/OrderView.vue";
import Payments from "../views/PaymentsView.vue";
import Dashboard from "../views/DashboardView.vue";
import Profile from "../views/ProfileView.vue";
import { authState, isAdmin, clearSession } from "../services/auth";
const member = { requiresAuth: true },
  admin = { requiresAuth: true, requiresAdmin: true };
const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: "/", name: "Home", component: Home },
    { path: "/contact", name: "Contact", component: Contact },
    ...["login", "register", "forgot-password", "reset-password"].map(
      (name) => ({ path: "/" + name, name, component: Auth }),
    ),
    { path: "/products", component: Products, meta: member },
    { path: "/cart", component: Cart, meta: member },
    { path: "/profile", name: "Profile", component: Profile, meta: member },
    { path: "/orders", component: Orders, meta: member },
    { path: "/orders/:id", component: Order, meta: member },
    { path: "/admin", component: Admin, meta: admin },
    { path: "/admin/payments", component: Payments, meta: admin },
    { path: "/admin/dashboard", component: Dashboard, meta: admin },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});
router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    let valid = false;
    try {
      const payload = JSON.parse(
        atob(
          authState.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"),
        ),
      );
      valid = payload.exp * 1000 > Date.now();
    } catch {}
    if (!valid) {
      clearSession();
      return { name: "login", query: { redirect: to.fullPath } };
    }
  }
  if (to.meta.requiresAdmin && !isAdmin()) return "/products";
});
export default router;
