var mix = require('laravel-mix');

mix.disableNotifications();

mix.webpackConfig({
    target: 'electron-preload',
});

mix.js('src/js/preload/index.js', 'assets/preload.js');

mix.dump();
