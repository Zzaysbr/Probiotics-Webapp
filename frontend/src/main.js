import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
import "./appearance.css";

createApp(App).use(router).mount("#app");
