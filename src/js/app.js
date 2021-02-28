// const { ipcRenderer } = require('electron');
import { ref, createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import ElementPlus from 'element-plus';
import App from '../vue/app.vue';

// ipcRenderer.send('vrcx', 'send'); // void
// ipcRenderer.invoke('vrcx', 'invoke'); // Promise<any>

// ipcRenderer.on('vrcx', function (events, ...args) {
//     console.log('ipcRenderer.on(vrcx)', args);
// });

(async function () {
    var i18n = createI18n({
        locale: 'en',
        fallbackLocale: 'en',
        messages: {
            en: {
                locale: {
                    en: 'English',
                    ko: 'Korean',
                },
                login: {
                    username: 'Username or Email',
                    password: 'Password',
                    submit: 'Login',
                },
            },
            ko: {
                locale: {
                    en: '영어',
                    ko: '한국어',
                },
                login: {
                    username: '닉네임 혹은 이메일 주소',
                    password: '비밀번호',
                    submit: '로그인',
                },
            },
        },
    });
    var app = createApp(App);
    app.use(i18n);
    app.use(ElementPlus);
    app.mount('#app');
})();
