import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
// import store from './store';

import { Quasar } from 'quasar';
import quasarUserOptions from './quasar-user-options';
import "./styles/app.scss";

const pinia = createPinia();

// createApp(App).use(Quasar, quasarUserOptions).use(store.original).use(pinia).use(router).mount('#app');
createApp(App).use(Quasar, quasarUserOptions).use(pinia).use(router).mount('#app');
