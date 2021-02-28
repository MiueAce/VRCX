var mix = require('laravel-mix');

mix.disableNotifications();

mix.webpackConfig({
    target: 'electron-main',
    externals: {
        'better-sqlite3': 'commonjs better-sqlite3',
        'vrcx-native': 'commonjs vrcx-native',
    },
});

mix.override(function (webpackConfig) {
    // drop babel
    webpackConfig.module.rules = webpackConfig.module.rules.filter(function (rule) {
        return String(rule.test) !== '/\\.(cjs|mjs|jsx?|tsx?)$/';
    });
});

mix.copyDirectory('resources/', 'assets/');
mix.js('src/js/main/index.js', 'assets/main.js');

mix.dump();
