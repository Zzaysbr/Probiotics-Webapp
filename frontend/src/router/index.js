import { createRouter, createWebHistory } from "vue-router";

import HomeView from "../views/HomeView.vue";
import ContactView from "../views/ContactView.vue";
import ProductsView from "../views/ProductsView.vue";
import RegisterView from "../views/RegisterView.vue";

const routes = [
    {
        path: "/",
        component: HomeView,
    },
    {
        path: "/contact",
        component: ContactView,
    },
    {
        path: "/products",
        component: ProductsView,
    },
    {
        path: "/register",
        component: RegisterView,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;