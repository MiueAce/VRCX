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

module.exports = i18n;
