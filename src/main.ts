import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import { Quasar } from 'quasar';
import quasarUserOptions from './quasar-user-options';
import { socket } from "./socket";

createApp(App).use(Quasar, quasarUserOptions).use(store.original).use(router).use(socket).mount('#app');
