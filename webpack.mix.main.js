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
mix.js('src/js/main/index.js', 'assets/main.js');

mix.dump();
