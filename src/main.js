import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import iconsPlugin from "./plugins/icons";
import { useAlert } from "./composables/useAlert";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";
import "flatpickr/dist/flatpickr.css";

import { createBootstrap } from "bootstrap-vue-next";

const app = createApp(App);
const pinia = createPinia();
app.config.globalProperties.$alert = useAlert();
app.use(createBootstrap());
app.use(pinia);
app.use(router);
app.use(iconsPlugin);
app.mount("#app");
