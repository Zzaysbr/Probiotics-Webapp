import { createRouter, createWebHistory } from "vue-router";

import HomeView from "../views/HomeView.vue";
import ContactView from "../views/ContactView.vue";
import ProductsView from "../views/ProductsView.vue";
import RegisterView from "../views/RegisterView.vue";
import LoginView from "../views/LoginView.vue";
import CartView from "../views/CartView.vue";
import AdminView from "../views/AdminView.vue";

const routes = [
    {
        path: "/",
        name: "Home",
        component: HomeView,
    },
    {
        path: "/contact",
        name: "Contact",
        component: ContactView,
    },
    {
        path: "/products",
        name: "Products",
        component: ProductsView,
    },
    {
        path: "/register",
        name: "Register",
        component: RegisterView,
    },
    {
        path: "/login",
        name: "Login",
        component: LoginView,
    },
    {
        path: "/cart",
        name: "Cart",
        component: CartView,
    },
    {
        path: "/admin",
        name: "Admin",
        component: AdminView,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;