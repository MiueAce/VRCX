import { createI18n } from 'vue-i18n';

const availableLocales = ['en', 'ko'];

export default createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: availableLocales.reduce(function (messages, locale) {
        messages[locale] = require(`./locale/${locale}.js`);
        return messages;
    }, {}),
});
