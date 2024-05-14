import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { createBootstrap } from 'bootstrap-vue-next';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import './assets/css/global.css';

const app = createApp(App);

// Use BootstrapVue3 plugins
app.use(createBootstrap());

// Use Vue Router
app.use(router);
app.use(store);

// Define feature flags explicitly
app.config.performance = true;

app.mount('#app');