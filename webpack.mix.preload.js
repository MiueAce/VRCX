var mix = require('laravel-mix');

mix.disableNotifications();

mix.webpackConfig({
    target: 'electron-preload',
});

mix.override(function (webpackConfig) {
    // drop babel
    webpackConfig.module.rules = webpackConfig.module.rules.filter(function (rule) {
        return String(rule.test) !== '/\\.(cjs|mjs|jsx?|tsx?)$/';
    });
});

mix.js('src/js/preload/index.js', 'assets/preload.js');

mix.dump();
