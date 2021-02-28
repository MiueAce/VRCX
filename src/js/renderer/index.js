import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import App from '../../vue/app.vue';
import i18n from './i18n.js';

(async function () {
    var app = createApp(App);
    app.use(i18n);
    app.use(ElementPlus);
    app.mount('#app');
})();
