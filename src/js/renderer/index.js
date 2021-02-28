const { createApp } = require('vue');
const ElementPlus = require('element-plus');
const i18n = require('./i18n.js');

import App from '../../vue/app.vue';

(function () {
    var app = createApp(App);
    app.use(ElementPlus);
    app.use(i18n);
    app.mount('#app');
})();
