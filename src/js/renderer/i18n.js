const { createI18n } = require('vue-i18n');

var availableLocales = ['en', 'ko'];

var messages = availableLocales.reduce(function (messages, locale) {
    messages[locale] = require(`../../locale/${locale}.json`);
    return messages;
}, {});

var i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages,
});

module.exports = i18n;
