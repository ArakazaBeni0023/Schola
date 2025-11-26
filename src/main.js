import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';

import VCalendar from 'v-calendar';
import 'v-calendar/style.css';

import "@fontsource/poppins"
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@/assets/icons/et-line-font/et-line-font.css';

import '@/assets/css/root.css';
import '@/assets/css/common.css';
import '@/assets/css/custom.css';
import '@/assets/css/auth-form.css';
import '@/assets/css/table.css';
import '@/assets/css/responsivity.css';
import '@/assets/css/modal_custom.css';
import '@/assets/css/notes.css';
import '@/assets/css/notebook.css';
import '@/assets/css/popover.css';

const app = createApp(App)
app.use(store)
app.use(router)
app.use(VCalendar, {})
app.mount('#app')
