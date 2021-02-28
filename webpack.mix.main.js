var mix = require('laravel-mix');

mix.disableNotifications();

mix.webpackConfig({
    target: 'electron-main',
    externals: {
        'better-sqlite3': 'commonjs better-sqlite3',
        'vrcx-native': 'commonjs vrcx-native',
    },
});

mix.copyDirectory('resources/', 'assets/');
mix.js('src/js/main/main.js', 'assets/');

mix.dump();
