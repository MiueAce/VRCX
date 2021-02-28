const { arch, platform, env } = require('process');
const path = require('path');
const { app, nativeImage } = require('electron');

const APP_PATH = app.getAppPath();

module.exports = {
    ARCH: arch,
    PLATFORM: platform,
    ENV: env,
    APP_PATH,
    APP_ICON: nativeImage.createFromPath(path.join(APP_PATH, 'assets/icon.ico')),
};
