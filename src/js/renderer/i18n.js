const { ipcRenderer } = window;
const { createI18n } = require('vue-i18n');

const availableLocales = ['en', 'ko'];

const messages = availableLocales.reduce(function (messages, locale) {
    messages[locale] = require(`../../locale/${locale}.json`);
    return messages;
}, {});

const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages,
});

(async function () {
    var locale = await ipcRenderer.invoke('vrcx', 'get-app-locale');
    console.log('get-app-locale', locale);
    if (locale in messages) {
        i18n.global.locale = locale;
    }
})();

module.exports = i18n;
