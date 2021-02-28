const mix = require('laravel-mix');
const HtmlWebpackPlugin = require('html-webpack-plugin');

mix.disableNotifications();

mix.webpackConfig({
    target: 'electron-renderer',
});

mix.override(function (webpackConfig) {
    // drop babel
    webpackConfig.module.rules = webpackConfig.module.rules.filter(function (rule) {
        return String(rule.test) !== '/\\.(cjs|mjs|jsx?|tsx?)$/';
    });
    webpackConfig.module.rules.push({
        test: /\.pug$/,
        oneOf: [
            {
                resourceQuery: /^\?vue/,
                use: ['pug-plain-loader'],
            },
            {
                use: 'pug-loader',
            },
        ],
    });
    webpackConfig.plugins.push(
        new HtmlWebpackPlugin({
            filename: 'assets/index.html',
            template: 'src/pug/index.pug',
            inject: false,
            minify: false,
        })
    );
});

// fontawesome
mix.copyDirectory(
    'node_modules/@fortawesome/fontawesome-free/webfonts/',
    'assets/vendor/fontawesome/webfonts/'
);
mix.copyDirectory('node_modules/@fortawesome/fontawesome-free/css/all.min.css', 'assets/vendor/fontawesome/css/');

// element-plus
mix.copyDirectory(
    'node_modules/element-plus/lib/theme-chalk/fonts/',
    'assets/vendor/element-plus/lib/theme-chalk/fonts/'
);
mix.copyDirectory('node_modules/element-plus/lib/theme-chalk/index.css', 'assets/vendor/element-plus/lib/theme-chalk/');

mix.js('src/js/renderer/index.js', 'assets/app.js').vue();
mix.sass('src/css/app.scss', 'assets/');

mix.dump();
